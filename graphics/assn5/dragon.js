//function dragon() {
  var canvas = initCanvas('canvas2');

  var data = [new Vec(0.6,0,0), new Vec(-0.6,0,0)];

  var actions = [];
  var shrink = [1.5,1.5,1.5,1.5,1.5,1.4,1.4,1.4,1.4,1.4,1.4,1.4,1.3,1.3].reverse();
  for (var i = 0; i < 14; i++) {
    actions.push({type:"roll"});
    actions.push({type:"dup", s:shrink[i]});
    actions.push({type:"shrink", s:shrink[i]});
  }

  canvas.update = function(g) {
    var inRotation = false;
    if (actions.length > 0) {
      var a = actions.pop();
      switch (a.type) {
        case "dup": {
          var l = data.length;
          var center = data[l-1];
          for (var i = l-2; i >= 0; i--) {
            data[i].data[0] -= center.data[0];
            data[i].data[1] -= center.data[1];
            var tmp = new Vec(data[i].data[0], data[i].data[1], data[i].data[2]);
            //console.log(tmp.data);
            data.push(tmp);
          }
          break;
        }
        case "shrink": {
          var l = data.length;
          var center = data[l-1];
          var steps = 30;
          var ss = Math.pow(1/a.s,1/steps);
          var smat = new Mat4().scale(ss,ss,1);
          var tmat = new Mat4().translate(-center.data[0]/a.s/steps,-center.data[1]/a.s/steps, 0);
          var m = compose(tmat, smat);
          //for (var i = 0; i < steps; i++) {
            //actions.push({type:"st", mat:m});
          //}
          for (var i = 0; i < steps; i++) {
            actions.push({type:"st", mat:tmat});
          }
          for (var i = 0; i < steps; i++) {
            actions.push({type:"st", mat:smat});
          }
          break;
        }
        case "st": {
          data = data.map(function(d) {
            return a.mat.transform(d);
          });
          break;
        }
        case "roll": {
          /*var b = Math.floor(data.length / 2);
          var roll = new Mat4().rotateZ(-Math.PI/2);
          for (var i = b+1; i < data.length; i++) {
            data[i] = roll.transform(data[i]);
          }*/
          var steps = 60;
          var rollMat = new Mat4().rotateZ(-Math.PI/2/steps);
          for (var i = 0; i < steps; i++) {
            actions.push({type:"rot", mat: rollMat});
          }
          break;
        }
        case "rot": {
          inRotation = true;
          var b = Math.floor(data.length / 2);
          var roll = a.mat;
          for (var i = b+1; i < data.length; i++) {
            data[i] = roll.transform(data[i]);
          }
          break;
        }
      }
    }
    for (var i = 0; i < data.length-1; i++) {
      var p = viewPortTransformation(data[i+1], canvas);
      var b = viewPortTransformation(data[i], canvas); 
      g.lineWidth = .5;
      if (inRotation && i > data.length / 2-1) g.strokeStyle = "#FF0000";
      else g.strokeStyle = "#000000";
      g.beginPath();
      g.moveTo(b.data[0], b.data[1]);
      g.lineTo(p.data[0], p.data[1]);
      g.stroke();
    }
  }
//}
