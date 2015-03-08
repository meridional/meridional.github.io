
   function Vec(x,y,z) {
     this.data = [x,y,z,1];
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
       for (var i = 0; i < 3; i++) {
         this.data[i] /= Math.sqrt(r);
       }
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
       this.data[1][1] = s;
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
     /*
      * dst = m * src
      * src and dst are vec4
      */
     transform : function(src) {
       var dst = new Vec(0,0,0);
       dst.data[3] = 0;
       for (var i = 0; i < 4; i++) {
         for (var j = 0; j < 4; j++) {
           dst.data[i] += this.data[i][j] * src.data[j];
         }
       }
       return dst;
     }
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
            g.clearRect(0, 0, canvas.width, canvas.height);
            canvas.update(g);
         }
      setTimeout(tick, 1000 / 60);
   }
   tick();
