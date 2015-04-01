
function buildCurveHermite(v1, v2, a1, a2) {
  var coefx = hermite([v1.data[0], v2.data[0], a1[0], a2[0]]);
  var coefy = hermite([v1.data[1], v2.data[1], a1[1], a2[1]]);
  var dx = v2.data[0] - v1.data[0];
  var dy = v2.data[1] - v1.data[1];
  var d = Math.sqrt(dx*dx + dy*dy);
  var pts = 1000;
  var r = [];
  for (var i = 1; i <= pts; i++) {
    var t = i / pts;
    r.push(new Vec(cubic(coefx, t), cubic(coefy, t), 0));
  }
  return r;
}
function buildSmoothCurve(zigzag, angles) {
  if (len(zigzag) == 0) return [];
  var r = [zigzag[0]];
  if (len(zigzag) == 1) return r;
  var angles = angles || getAngles(zigzag);
  for (var i = 0; i < len(zigzag) - 1; i++) {
    var herm =buildCurveHermite(zigzag[i], zigzag[i+1], angles[i], angles[i+1]);
    for (var j = 0; j < herm.length; j++) {
      r.push(herm[j]);
    }
  }
  return r;
}

function len(a) {return a.length;}
var points = [];
var angles = [];
// 0
points.push(
  [new Vec(0., 0.8, 0),
    new Vec(-.5, 0., 0.),
    new Vec(0,-.8,0),
    new Vec(.5,0,0.),
    new Vec(0.,0.8,0)]);
angles.push(
  [[-1,0],
    [0,-1],
    [1,0],
    [0,1],
    [-1,0]]);
// 1
points.push(
  [new Vec(-0.2, 0.5, 0),
   new Vec(0, 0.8, 0),
   new Vec(0, 0.2, 0),
   new Vec(0, -0.2, 0),
   new Vec(0, -0.8, 0)]
);
angles.push([
  [.5, .65],
  [.5, .7],
  [0, -1],
  [0, -1],
  [0, -1]]);
// 2
points.push(
  [new Vec(-.5, .2, 0),
    new Vec(.1, .8, 0),
    new Vec(.1, -.1, 0),
    new Vec(-.5, -.7, 0),
    new Vec(.5, -.7, 0)
]);

angles.push(
  [[.5, .7],
  [1, -.5],
  [-.5, -.5],
  [-.5, -.2],
  [1, 0]
  ]);

  //3
points.push(
  [new Vec(-.5, .7, 0),
    new Vec(.3, .7, 0),
    new Vec(-.3, .1, 0),
    new Vec(.5, -.1, 0),
    new Vec(-.5, -.7, 0)]);

angles.push(
  [[.5, .3],
    [.5, -.3],
    [-.5, -.3],
    [0, -1],
    [-.5, .3]]);

    //4
points.push(
  [new Vec(.3, -0.1, 0.),
    new Vec(0.1,-0.1,0.),
    new Vec(-.5, -0.1,0.),
    new Vec(.1, .7, 0.),
    new Vec(.1, -.8, 0.)]);

angles.push(
  [[-1,0],
    [-1,0],
    [1,1],
    [0,-1],
    [0,-1]]);

    // 5
points.push(
  [new Vec(.3, .7, 0),
    new Vec(-.2, .7, 0),
    new Vec(-0.5, 0.1, 0.),
    new Vec(.3, -.2, 0),
    new Vec(-.6, -.7, 0)]);
angles.push(
  [[-1, 0.],
    [-1, -0],
    [0, -1],
    [0, -1],
    [-1, 1]]);

    // 6
points.push(
  [new Vec(.3, .8, 0),
    new Vec(-.3, -.1, 0),
    new Vec(0, -.8, 0),
    new Vec(.5, -.5, 0),
    new Vec(-.3 ,-.1, 0)]);
angles.push(
  [[-1,-1],
    [-.1,-1],
    [1,0],
    [0,1],
    [-1,-0.8]]);

    // 7
points.push(
  [new Vec(-.5, .75, 0),
    new Vec(.2, .75, 0),
    new Vec(.2, .1, 0),
    new Vec(.1, -.1, 0),
    new Vec(-.30, -.9, 0)]);
angles.push(
  [[1,0],
    [1,0],
    [-1, -2],
    [-1, -2],
    [-1, -2]]);

points.push(
  [new Vec(0, .1, 0),
    new Vec(.0, .8, 0),
    new Vec(0, .1, 0),
    new Vec(0, -.8, 0),
    new Vec(0, .1, 0)]);

angles.push(
  [[1,1,],
    [-1,0],
    [1,-1],
    [-1, 0],
    [1,1]]);

points.push(
  [new Vec(.2, .2, 0),
    new Vec(0.1, 0.7, 0),
    new Vec(-.3, .3, 0),
    new Vec(.2, .3, 0),
    new Vec(.0, -.7, 0)]);

angles.push(
  [[0.4, 1],
    [-1,0],
    [1,-1],
    [-0.4,-1],
    [-.4,-1]]);
points.push(points[0]);
angles.push(angles[0]);
var pts = [];

for (var i = 0; i < points.length; i++) {
  pts.push(buildSmoothCurve(points[i], angles[i]));
}

var canvas = initCanvas('canvas1');

function makePoints(n, ps, c) {
  var t = n % 1;
  ps = ps || pts;
  if (t == 0) {
    return ps[n];
  }
  var tt = [];
  var n1 = Math.floor(n);
  var n2 = c; 
  for (var i = 0; i < ps[n1].length; i++) {
    tt.push(new Vec(ps[n1][i].data[0] * (1-t) + ps[n2][i].data[0]*(t),
                    ps[n1][i].data[1] * (1-t) + ps[n2][i].data[1]*(t),
                    0));
  }
  return tt;
}

canvas.update = function (g) {
  var d = new XDate();
  var h = d.getHours();
  var h1 = Math.floor(h / 10);
  var h2 = h % 10;
  var m = d.getMinutes();
  var m1 = Math.floor(m / 10);
  var m2 = m % 10;
  var s = d.getSeconds();
  var s1 = Math.floor(s/10);
  var s2 = s % 10;
  var am = d.getMilliseconds() / 1000;
  var nnn = [h1+1,h2+1,m1+1,m2+1,s1+1,s2+1];
  if (m == 59 && s == 59) {
    h = h + am;
    h2 = h2 + am;
    if (h2 > 9) {
      h1 = h1 + am;
    }
    if (h == 23) {
      nnn[0] = 0;
      nnn[1] = 0;
      h1 = h1 + am;
    }
  }
  if (s == 59) {
    m = m + am;
    m2 = m2 + am;
    if (m2 > 9) {
      m1 = m1 + am;
      nnn[5] = 0;
      if (m1 > 5) nnn[2] = 0;
      else nnn[2] = Math.ceil(m1);
    }
  }
  s2 += am;
  if (s2 > 9) {
    s1 += am;
    nnn[5] = 0;
    if (s1 > 5) nnn[4] = 0;
    else nnn[4] = Math.ceil(s1);
  }
  s = s + am;
  var ns = [h1, h2, m1, m2, s1, s2];
  var ps = []; 
  var nps = [];
  for (var i = 0; i < 6 ; i++) {
    ps.push(makePoints(ns[i], pts, nnn[i]));
    nps.push( makePoints(ns[i], points, nnn[i]));
  }
  var displacement = [-3.5, -2.3, -0.6, 0.6, 2.3, 3.5];
  for (var i = 0; i < 6; i++) {
    drawPts(canvas,[ps[i].map(function(p) {
      return new Vec(p.data[0] + displacement[i], p.data[1], 0);
    })]);
    nps[i].map(function(p) {
      drawCircle(canvas, g, new Vec(p.data[0]+displacement[i], p.data[1], 0), 5);
    });
  }
}
