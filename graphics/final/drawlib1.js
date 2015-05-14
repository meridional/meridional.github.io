
function Vec(x,y,z) {
  this.data = [0,0,0,1];
  if (x) this.data[0] = x;
  if (y) this.data[1] = y;
  if (z) this.data[2] = z;
}

Vec.prototype = {
  set : function(x,y,z) {
    this.data[0] = x; this.data[1] = y; this.data[2] = z; this.data[3] = 1;
  },
  normalize : function() {
    var r = 0;
    for (var i = 0; i < 3; i++) {
      r += this.data[i] * this.data[i];
    }
    var rr = new Vec();
    for (var i = 0; i < 3; i++) {
      rr.data[i] = this.data[i] / Math.sqrt(r);
    }
    return rr;
  },
  dot : function(other) {
    var r = 0;
    for (var i = 0; i < 3; i++) {
      r += this.data[i] * other.data[i];
    }
    return r;
  },
  perspectiveTransform : function(f) {
    var x = this.data[0];
    var y = this.data[1];
    var z = this.data[2];
    if ((z) < 1e-9) {
      return new Vec(Infinity,Infinity,Infinity);
    }
    var r = new Vec(f * x / z, f * y / z, f / z);
    return r;
  }
}

function Mat4() {
  this.data = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
}

Mat4.prototype = {
  clear: function() {
    this.data = this.data.map(function (x) { return x.map(function(y) {return 0;})});
    this.data[3][3] = 1;
    return this;
  },
  print : function() {
    var i;
    for (i = 0; i < 4; i++) {
      var j;
      var msg = "";
      for (j = 0; j < 4; j++) {
        msg += this.data[i][j];
        msg += " ";
      }
      console.log(msg);
    }
  },
  identity : function() {
    this.clear();
    var i;
    for (i = 0; i < 4; i++) {
      this.data[i][i] = 1;
    }
    return this;
  },
  translate : function(x,y,z) {
    this.identity();
    this.data[0][3] = x;
    this.data[1][3] = y;
    this.data[2][3] = z;
    this.data[3][3] = 1;
    return this;
  },
  // counter-clockwise
  rotateX : function(t) {
    this.identity();  
    var s = Math.sin(t);
    var c = Math.cos(t);
    this.data[1][1] = c;
    this.data[1][2] = s;
    this.data[2][1] = -s;
    this.data[2][2] = c;
    return this;
  },
  // counter clockwise
  rotateY : function(t) {
    this.identity();
    var s = Math.sin(t);
    var c = Math.cos(t);
    this.data[0][0] = c;
    this.data[0][2] = -s;
    this.data[2][0] = s;
    this.data[2][2] = c;
    return this;
  },
  rotateZ : function(t) {
    this.identity();
    var s = Math.sin(t);
    var c = Math.cos(t);
    this.data[0][0] = c;
    this.data[0][1] = -s;
    this.data[1][0] = s;
    this.data[1][1] = c;
    return this;
  },
  scale : function(x,y,z) {
    this.clear();
    this.data[0][0] = x;
    this.data[1][1] = y;
    this.data[2][2] = z;
    return this;
  },
  transform : function(src) {
    var dst = new Vec(0,0,0);
    dst.data[3] = 0;
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        dst.data[i] += this.data[i][j] * src.data[j];
      }
    }
    return dst;
  },
  invert : function() {

    // COMPUTE ADJOINT COFACTOR MATRIX FOR THE ROTATION+SCALE 3x3
    var src = this.data;
    var r = new Mat4();
    var dst = r.data;
    dst = math.inv(src);
    r.data = math.inv(this.data);
    return r;
    for (var i = 0 ; i < 3 ; i++)
    for (var j = 0 ; j < 3 ; j++) {
      var i0 = (i+1) % 3;
      var i1 = (i+2) % 3;
      var j0 = (j+1) % 3;
      var j1 = (j+2) % 3;
      dst[i][j] = src[j0][i0] * src[j1][i1] - src[j1][i0] * src[j0][i1];
    }

    // RENORMALIZE BY DETERMINANT TO GET ROTATION+SCALE 3x3 INVERSE

    var determinant = src[0][0] * dst[0][0]
    + src[0][1] * dst[1][0]
    + src[0][2] * dst[2][0] ;
    for (var i = 0 ; i < 3 ; i++) {
      for (var j = 0 ; j < 3 ; j++) { dst[j][i] /= determinant;}
    }

    // COMPUTE INVERSE TRANSLATION

    for (var i = 0 ; i < 3 ; i++) {
      dst[3][i] = - dst[0][i] * src[3][0] - dst[1][i] * src[3][1] - dst[2][i] * src[3][2] ;
    }
    r.data = dst;
    return r;
  }
};

function compose(m1, m2) {
  var m = new Mat4();
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      m.data[i][j] = 0;
      for (var k = 0; k < 4; k++) {
        m.data[i][j] += m1.data[i][k] * m2.data[k][j];
      }
    }
  }
  return m;
}

function viewPortTransformation(v,g) {
  var x = new Vec();
  x.data[0] = g.width/2+v.data[0]*(g.width/2);
  x.data[1] = g.height/2-v.data[1]*(g.width/2);
  return x;
}

var startTime = (new Date()).getTime() / 1000, time = startTime;
var canvases = [];
function initCanvas(id) {
  var canvas = document.getElementById(id);
  canvas.setCursor = function(x, y, z) {
    var r = this.getBoundingClientRect();
    this.cursor.set(x - r.left, y - r.top, z);
  };
  canvas.cursor = new Vec(0, 0, 0);
  console.log(canvas.cursor);
  canvas.onmousedown = function(e) { this.setCursor(e.clientX, e.clientY, 1); }
  canvas.onmousemove = function(e) { this.setCursor(e.clientX, e.clientY, 0); }
  canvas.onmouseup   = function(e) { this.setCursor(e.clientX, e.clientY, 0); }
  canvases.push(canvas);
  return canvas;
}
function tick() {
  time = (new Date()).getTime() / 1000 - startTime;
  for (var i = 0 ; i < canvases.length ; i++)
  if (canvases[i].update !== undefined) {
    var canvas = canvases[i];
    var g = canvas.getContext('2d');
//    g.clearRect(0, 0, canvas.width, canvas.height);
    canvas.update(g);
  }
  setTimeout(tick, 1000 / 60);
}
tick();

function drawLine(g, v1, v2) {
  if (v1.data[0] == Infinity || v2.data[0] == Infinity) return;
  g.moveTo(v1.data[0], v1.data[1]);
  g.lineTo(v2.data[0], v2.data[1]);
}
function drawPts(canv, pts, f, c, g) {
  // assume pts is a 2 d array
  if (!f) {f = -20.0;}
  var li = pts.length;
  var lj = pts[0].length;
  var pxs = pts.map(
    function (ps) {
      return ps.map(function (p) {
        return viewPortTransformation(p.perspectiveTransform(f), canv);
      });
  });
  if (!g) g = canv.getContext("2d");
  g.beginPath();
  if (c) g.strokeStyle = c;
  for (var i = 0; i < li - 1; i++) {
    for (var j = 0; j < lj - 1; j++) {
      drawLine(g, pxs[i][j], pxs[i][j+1]);
      drawLine(g, pxs[i][j], pxs[i+1][j]);
    }
  }
  var i = li - 1;
  for (var j = 0; j < lj - 1; j++) {
      drawLine(g, pxs[i][j], pxs[i][j+1]);
  }
  var j = lj - 1;
  for (var i = 0; i < li - 1; i++) {
      drawLine(g, pxs[i][j], pxs[i+1][j]);
  }
  g.stroke();
}
