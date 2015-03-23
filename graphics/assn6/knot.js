function dirAtPhi(kp, kq, phi) {
  var kc = 2;
  var r = Math.cos(kq * phi) + kc;
  return new Vec(
    -kp * r * Math.sin(kp * phi) - kq * Math.cos(kp * phi) * Math.sin(phi * kq),
    kp * Math.cos(phi * kp) * r - kq * Math.sin(kp * phi) * Math.sin(phi * kq),
    -kq * Math.cos(phi * kq));
}

function knotPointInSpace(kp, kq, phi) {
  return new Vec(r * Math.cos(kp * phi),
                                     r * Math.sin(kp * phi),
                                     -Math.sin(phi * kq));
}

function rotMatrixToDirAtPhi(kp, kq, phi) {
    var kc = 2;
    var dir = dirAtPhi(kp, kq, phi).normalize();
    var rxAngle = Math.atan2(dir.data[2], dir.data[0]);
    var ryAngle = Math.atan2(dir.data[2], dir.data[1]);
    var m = new Mat4();
    m.data[0][2] = dir.data[0];
    m.data[1][2] = dir.data[1];
    m.data[2][2] = dir.data[2];
    var cz = [dir.data[0],dir.data[1],dir.data[2]];
    var cx = math.cross([0,1,0], cz);
    cx = math.divide(cx, math.norm(cx, 2));
    m.data[0][0] = cx[0];
    m.data[1][0] = cx[1];
    m.data[2][0] = cx[2];
    var cy = math.cross(cz, cx);
    m.data[0][1] = cy[0];
    m.data[1][1] = cy[1];
    m.data[2][1] = cy[2];
    var rot = compose(m, new Mat4().rotateZ(phi * kq / kp)) ;
    return rot;
}

function mvMatrixAtPhi(kp, kq, phi) {
  var kc = 2;
  var r = Math.cos(kq * phi) + kc;
  return new Mat4().translate(r * Math.cos(kp * phi),
                                     r * Math.sin(kp * phi),
                                     -Math.sin(phi * kq));
}

function makeKnot(kp, kq, begin, end, bins1) {
  if (!begin) begin = 0;
  if (!end) end = Math.PI * 2;
  if (!bins1) bins1 = 500;
  var bins2 = 20;
  var kc = 2;
  var pts = [];
  var radius = .3;
  for (var i = 0; i <= bins1; i++) {
    pts.push([]);
    var phi = (end-begin) / bins1 * i + begin;
    //var r = 
    var r = Math.cos(kq * phi) + kc;
    var rot = rotMatrixToDirAtPhi(kp, kq, phi);
    var mvMat = mvMatrixAtPhi(kp, kq, phi);
    var mm = compose(mvMat, rot);
    for (var j = 0; j <= bins2; j++) {
      var psi = Math.PI / bins2 * j * 2;
      var v = (j - bins2/2) / (bins2 / 2) * .5;
      var vv = mm.transform(new Vec(radius * Math.cos(psi), radius * Math.sin(psi), 0));
      pts[i].push(vv);
    }
  }
  return pts;
}

function knot() {
  var speed = .1;
  var canvas = initCanvas('canvas2');
  var kp = 5; var kq = 8;
  var pts = makeKnot(kp,kq);
  var noiseGen = new Noise();
  canvas.update = function(g) {
    g.clearRect(0,0,canvas.width, canvas.height);
    var cameraMotion = compose(mvMatrixAtPhi(kp, kq, time * speed),
                               rotMatrixToDirAtPhi(kp, kq, time * speed)).invert();
    var tt = compose(new Mat4().translate(0,0,.2) , cameraMotion);
    //var tt = new Mat4().translate(0,0,10.);
    var nnpts = pts.map(
      function (ps) {
      return ps.map(function (p) {
        return tt.transform(p);
      });
    });
    var grad = g.createLinearGradient(0,0,canvas.width,canvas.height);
    grad.addColorStop(0.2, "red");
    grad.addColorStop(0.5, "orange");
    grad.addColorStop(0.8, "purple");
    g.strokeStyle = grad;
    drawPts(canvas, nnpts, 2.5);
  }
  var c3 = initCanvas('canvas3');
  c3.update = function(g) {
    g.clearRect(0,0,c3.width,c3.height);
    var tt = compose(new Mat4().translate(0,0,10.), new Mat4().rotateY(time * .2));
    //var tt = new Mat4().translate(0,0,10.);
    var nnpts = pts.map( function (ps) { return ps.map(function (p) { return tt.transform(p); })});
    g.stokeStyle = 'black';
    g.lineWidth = .1;
    drawPts(c3, nnpts, 2.5, 'black');
    var fronts = makeKnot(kp, kq, time * speed - .1, time * speed, 5);
    var nnpts = fronts.map( function (ps) { return ps.map(function (p) { return tt.transform(p); })});
    g.lineWidth = 1;
    var grad = g.createLinearGradient(0,0,canvas.width,canvas.height);
    drawPts(c3, nnpts, 2.5,'red');
  };
}

knot();

