function qsbegin() {
  var button = document.getElementById("qsbutton");
  button.disabled = true;
  //  button.parent.removeChild(button);
  var qscanvas = initCanvas('canvas1');
  var lines = [];

  var total = 50;

  var data = shuffle(Array.apply(null, Array(total)).map( function(_, i) {return i;}));

  var vanilla = [new Vec(0,-0.1,0), new Vec(0,0.1,0)];

  var inactiveColor = "#AAAAAA";
  var pivotColor = "#FF0000";
  var activeColor = "#000000";
  var movingColor = "#8EA65D";

  function makeTransformation(data) {
    var transformations = [];
    for (var i = 0; i < data.length; i++) {
      var trans = new Mat4().translate(-0.8+1.6/total * i,0,0);
      var angle = new Mat4().rotateZ(Math.PI/6-data[i]*Math.PI/3/total);
      transformations.push(
        { a : Math.PI/6-data[i]*Math.PI/3/total,
          t : -0.8+1.6/total * i,
          color : activeColor,
          cache:
            [trans.transform(angle.transform(vanilla[0])),
              trans.transform(angle.transform(vanilla[1]))]}
      );
    }
    return transformations;
  }

  lines = makeTransformation(data);



  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  var actions = [];

  actions = quicksort(data).reverse();

  var drawings = [];
  function actionToDrawings(actions) {
    var drawings = [];
    for (var a in actions) {
      switch (a.type) {
        case "swap": {
          drawings.push(a);
        }
        case "partition": {
          drawings.push(a);
        }
      }
    }
  }

  function quicksort(input) {
    var array = input.map(function(x){return x});
    var actions = [];
    function swap(i, j) {
      if (i == j) return;
      t = array[i];
      array[i] = array[j];
      array[j] = t;
      actions.push({ type:"swap", index : [i,j]});
    }
    function qs(l, r) {
      if (l >= r-1) return;
      var pivot = getRandomInt(l, r);
      actions.push({ type:"partition", index : [l, r], piv:pivot});
      swap(pivot, l);
      var k = l; 
      var p = array[l];
      for (var i = l + 1; i < r; i++) {
        if (array[i] < p) {
          k++;
          swap(i, k);
        }
      }
      swap(k, l);
      qs(l, k);
      qs(k+1,r);
    }
    qs(0, array.length);
    return actions;
  }


  var seq = 0;

  function updateCache(l) {
    var trans = new Mat4().translate(l.t,0,0);
    var angle = new Mat4().rotateZ(l.a);
    l.cache = [trans.transform(angle.transform(vanilla[0])),
      trans.transform(angle.transform(vanilla[1]))];
  }

  var speed = 0.05;
  qscanvas.update = function(g) {
    if (actions.length > 0) {
      var action = actions.pop();
      switch (action.type){ 
        case "swap": {
          if (action.index[0] > action.index[1]) {
            var t = action.index[0];
            action.index[0] = action.index[1];
            action.index[1] = t;
          }
          var i = action.index[0];
          var j = action.index[1];
          var atmp = lines[i].a;
          var ttmp = lines[i].t;
          var ctmp = lines[i].color;
          //lines[action.index[0]].a = lines[action.index[1]].a;
          // lines[action.index[0]].t = lines[action.index[1]].t;
          //lines[action.index[0]].color = lines[action.index[1]].color;
          // lines[action.index[1]].a = atmp;
          //  lines[action.index[1]].t = ttmp;
          // lines[action.index[1]].color = ctmp;
          //updateCache(lines[action.index[0]]);
          //updateCache(lines[action.index[1]]);
          var dist = lines[j].t - ttmp;
          if (action.index[0] > action.index[1]) console.log("error");
          var frames = Math.ceil(Math.abs(dist) / speed);
          actions.push({type:"commit", index:[j,i],
                       as : [lines[i].a, lines[j].a],
                       ts : [lines[j].t, lines[i].t],
                       cs : [lines[i].color, lines[j].color]});
                       for (var i = frames-1; i >= 0; i--) {
                         var anim = Array(2);
                         anim[0]={index:action.index[0], t: lines[action.index[0]].t + Math.min(i * speed, dist)};
                         anim[1]={index:action.index[1], t: lines[action.index[1]].t + Math.max(-i * speed, -dist)};
                         actions.push({type:"animate", a:anim});
                       }
                       break;
        }
        case "animate": {
          lines[action.a[0].index].t = action.a[0].t;
          lines[action.a[1].index].t = action.a[1].t;
          lines[action.a[0].index].lw = 1.5;
          lines[action.a[1].index].lw = 1.5;
          updateCache(lines[action.a[0].index]);
          updateCache(lines[action.a[1].index]);
          break;
        }
        case "commit": {
          var i = action.index[0];
          var j = action.index[1];
          lines[i].a = action.as[0];
          lines[j].a = action.as[1];
          lines[i].t = action.ts[0];
          lines[j].t = action.ts[1];
          lines[i].color = action.cs[0];
          lines[j].color = action.cs[1];
          lines[i].lw = 1.0;
          lines[j].lw = 1.0;
          updateCache(lines[i]);
          updateCache(lines[j]);
          break;
        }
        case "partition": {
          for (var i = 0; i < action.index[0]; i ++) {
            lines[i].color = inactiveColor;
          }
          for (var i = action.index[1]; i < lines.length; i++) {
            lines[i].color = inactiveColor;
          }
          for (var i = action.index[0]; i < action.index[1]; i++) {
            lines[i].color = activeColor;
          }
          lines[action.piv].color = pivotColor;
          break;
        }
      }
    } else if (seq < total) {
      if (seq == 0) lines.map(function (l) {l.color = inactiveColor;});
      lines[seq++].color = activeColor;
      lines[seq++].color = activeColor;
      //lines.map(function (l) {l.color = activeColor;});
    }
    lines.map(function(l) {
      g.strokeStyle=l.color;
      g.lineCap = "round";
      g.lineWidth = 2.0;
      var p1 = viewPortTransformation(l.cache[0],qscanvas);
      var p2 = viewPortTransformation(l.cache[1],qscanvas);
      g.beginPath();
      g.moveTo(p1.data[0], p1.data[1]);
      g.lineTo(p2.data[0], p2.data[1]);
      g.stroke();
    });
  }



  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}
