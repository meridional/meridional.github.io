

var canvas = initCanvas('canvas1');
var pts = [];
var r = 0.1;
var trans = new Mat4().translate(0.0,0.00, 3.2);
var bins1 = 52;
var bins2 = 10;
var noiseGen = new Noise();
for (var i = 0; i <= bins1; i++) {
  pts.push([]);
  var phi = 2*Math.PI / bins1 * i;
  //var r = 
  for (var j = 0; j <= bins2; j++) {
    var psi = Math.PI / bins2 * j;
    var v = (j - bins2/2) / (bins2 / 2) * .5;
    //pts[i].push(trans.transform(new Vec(r*Math.cos(phi) * Math.sin(psi), r*Math.sin(phi), r*Math.cos(phi) * Math.cos(psi))));
//    pts[i].push(trans.transform(new Vec((i-50)/100, (j-50)/100), 1));
    var vv = new Vec((1. + v / 2 * Math.cos(phi / 2)) * Math.cos(phi),
                                        (1. + v/2 * Math.cos(phi / 2)) * Math.sin(phi),
                                        v / 2 * Math.sin(phi/2));
    //var n = noiseGen.noise(vv.normalize().data);
    //tt = compose(new Mat4().translate(0.0,0.0,n), trans);
    pts[i].push(vv);
  }
}
canvas.update = function(g) {
  g.clearRect(0,0,canvas.width, canvas.height);
  var rot = compose(new Mat4().rotateY(time * 0.125), new Mat4().rotateX(time * .25));
  var nnpts = pts.map(
    function (ps) {
    return ps.map(function (p) {
      var n = noiseGen.noise([p.data[0] + time, p.data[1] + time, p.data[2] + time].map(function (x) {return x * .6;}));
      var tt = compose(new Mat4().translate(0,0,n + 3.5), rot);
      return tt.transform(p);
    });
  });
  drawPts(canvas, nnpts, 2.1);
}
