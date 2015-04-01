function platte() {
  var canvas = initCanvas('canvas1');

  var drawing = false;
  f = window.onmouseup;
  window.onmouseup = function(e) {
    f(e);
    drawing = false;
    //strokeEnd();
  }
  f = window.onmousedown;
  window.onmousedown = function(e) {
    f(e);
    drawing = true;
    strokeStart();
  }

  var curCurve = [];
  var curSmoothed = [];
  var pastCurves = [];
  var smoothedCurves = [];
  var lastPt = [0,0];

  function newPoint(pt) {
    return pt.data[0] != lastPt[0] && pt.data[1] != lastPt[1];
  }

  function getDxDy(v1, v2) {
    var dx = v2.data[0] - v1.data[0];
    var dy = v2.data[1] - v1.data[1];
    var d = Math.sqrt(dx*dx + dy*dy);
    return [dx/d, dy/d];
  }

  function getAngles(zigzag) {
    var angles = [];
    angles.push(getDxDy(zigzag[0], zigzag[1]));
    for (var i = 1; i < len(zigzag) - 1; i++) {
      angles.push(getDxDy(zigzag[i-1], zigzag[i+1]));
    }
    angles.push(getDxDy(zigzag[len(zigzag)-2], zigzag[len(zigzag)-1]));
    return angles
  }


  // return a hermite curve 
  function buildCurveHermite(v1, v2, a1, a2) {
    var coefx = hermite([v1.data[0], v2.data[0], a1[0], a2[0]]);
    var coefy = hermite([v1.data[1], v2.data[1], a1[1], a2[1]]);
    var dx = v2.data[0] - v1.data[0];
    var dy = v2.data[1] - v1.data[1];
    var d = Math.sqrt(dx*dx + dy*dy);
    var pts = Math.max(5, d * 1000);
    var r = [];
    for (var i = 1; i <= pts; i++) {
      var t = i / pts;
      r.push(new Vec(cubic(coefx, t), cubic(coefy, t), 0));
    }
    return r;
  }

  function len(a) {return a.length;}

  function buildSmoothCurve(zigzag) {
    if (len(zigzag) == 0) return [];
    var r = [zigzag[0]];
    if (len(zigzag) == 1) return r;
    var angles = getAngles(zigzag);
    for (var i = 0; i < len(zigzag) - 1; i++) {
      var herm =buildCurveHermite(zigzag[i], zigzag[i+1], angles[i], angles[i+1]);
      for (var j = 0; j < herm.length; j++) {
        r.push(herm[j]);
      }
    }
    return r;
  }

  var deleting = false;

  window.onkeydown = function(k) {
    if (k.keyCode == 68) {
      deleting = true;
      document.body.style.cursor = "crosshair";
    } else if (k.keyCode = 83) {
      strokeEnd();
    }
  }

  window.onkeyup = function(k) {
    if (k.keyCode == 68) {
      deleting = false;
      document.body.style.cursor = "auto";
    } 
  }

  function eucDist(v1, v2) {
    var dx = v2.data[0] - v1.data[0];
    var dy = v2.data[1] - v1.data[1];
    return Math.sqrt(dx*dx + dy*dy);
  }

  function deletePoint(pt) {
    console.log(pt.data);
    var eps = .02;
    for (var i = 0; i < curCurve.length; i++) {
      if (eucDist(pt, curCurve[i]) < eps) {
        curCurve.splice(i, 1);
        curSmoothed = buildSmoothCurve(curCurve);
        return;
      }
    }
    for (var i = 0; i < pastCurves.length; i++) {
      for (var j = 0; j < pastCurves[i].length; j++) {
        if (eucDist(pt, pastCurves[i][j]) < eps) {
          pastCurves[i].splice(j, 1);
          smoothedCurves[i] = buildSmoothCurve(pastCurves[i]);
          return;
        }
      }
    }
  }

  function addPoint(pt) {
    curCurve.push(pt.copy());
    lastPt = pt.copy().data;
    curSmoothed = buildSmoothCurve(curCurve);
  }

  function strokeEnd() {
    smoothedCurves.push(buildSmoothCurve(curCurve));
    pastCurves.push(curCurve);
    curCurve = [];
    curSmoothed = [];
  }

  function strokeStart() {
    console.log("start");
  }

  canvas.update = function(g) {
    if ( newPoint(this.cursor) && this.cursor.data[2] == 1) {
      if (deleting) {
        deletePoint(this.cursor);
      } else {
        addPoint(this.cursor);
      }
      //console.log(this.cursor.data);
    } else if (!drawing) {
      if (curCurve.length > 0) {
      }
    }
    g.strokeStyle = "black";
    g.lineWidth = 1;
    g.save();
    g.lineWidth = .2;
    var dcircle = function (p) {
      drawCircle(canvas, g, p, 2.);
      return 1;
    };
    drawPts(canvas, [curSmoothed]);
    curCurve.map(dcircle);
    pastCurves.map(function (pa) {
      pa.map(dcircle);
    });
    smoothedCurves.map(function (cs) {
      drawPts(canvas, [cs]);
    });
    g.restore();
  }
}
platte();
