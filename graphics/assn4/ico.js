
// Define a general purpose 3D vector object.

function Vector3() {
   this.x = 0;
   this.y = 0;
   this.z = 0;
}
Vector3.prototype = {
   set : function(x,y,z) {
      this.x = x;
      this.y = y;
      this.z = z;
   },
   copy: function(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
   },
   negate: function() {
     this.x = -this.x;
     this.y = -this.y;
     this.z = -this.z;
   }
}

function Vector4() {
  this.x = 0; this.y = 0; this.z = 0; this.w = 0;
}
Vector4.prototype = {
   set : function(x,y,z,w) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
   },
}


function start_gl(canvas_id, vertexShader, fragmentShader) {
   setTimeout(function() {
      try {
         var canvas = document.getElementById(canvas_id);
         var gl = canvas.getContext("experimental-webgl");
      } catch (e) { throw "Sorry, your browser does not support WebGL."; }

      // Catch mouse events that go to the canvas.

      function setMouse(event, eventZ) {
         var r = event.target.getBoundingClientRect();
         gl.cursor.x = (event.clientX - r.left  ) / (r.right - r.left) * 2 - 1;
         gl.cursor.y = (event.clientY - r.bottom) / (r.top - r.bottom) * 2 - 1;
         if (eventZ !== undefined)
	    gl.cursor.z = eventZ;
      }
      gl.cursor = new Vector3();
      canvas.onmousedown = function(event) { setMouse(event, 1); } // On mouse press, set z to 1.
      canvas.onmousemove = function(event) { setMouse(event) ; }
      canvas.onmouseup   = function(event) { setMouse(event, 0); } // On mouse press, set z to 0.

      // Initialize gl. Then start the frame loop.

      gl_init(gl, vertexShader, fragmentShader);
      gl_update(gl);
      init_shape(gl);

   }, 100); // Wait 100 milliseconds before starting gl.
}
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

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

function init_shape(gl) {
  var phi = (Math.sqrt(5) + 1) / 2;
  var fpoints = ([
    [[phi,1,0],[phi,-1,0],[1,0,phi]],
    [[phi,1,0],[phi,-1,0],[1,0,-phi]],
    [[-phi,1,0],[-phi,-1,0],[-1,0,phi]],
    [[-phi,1,0],[-phi,-1,0],[-1,0,-phi]],
    [[1,0,phi],[-1,0,phi],[0,phi,1]],
    [[1,0,phi],[-1,0,phi],[0,-phi,1]],
    [[1,0,-phi],[-1,0,-phi],[0,phi,-1]],
    [[1,0,-phi],[-1,0,-phi],[0,-phi,-1]],
    [[0,phi,1],[0,phi,-1],[phi,1,0]],
    [[0,phi,1],[0,phi,-1],[-phi,1,0]],
    [[0,-phi,1],[0,-phi,-1],[phi,-1,0]],
    [[0,-phi,1],[0,-phi,-1],[-phi,-1,0]],
    [[phi,1,0],[1,0,phi],[0,phi,1]],
    [[-phi,1,0],[-1,0,phi],[0,phi,1]],
    [[phi,-1,0],[1,0,phi],[0,-phi,1]],
    [[phi,1,0],[1,0,-phi],[0,phi,-1]],
    [[-phi,-1,0],[-1,0,phi],[0,-phi,1]],
    [[-phi,1,0],[-1,0,-phi],[0,phi,-1]],
    [[phi,-1,0],[1,0,-phi],[0,-phi,-1]],
    [[-phi,-1,0],[-1,0,-phi],[0,-phi,-1]],
  ]).map(function(triag){
    return triag.map(function(p) {
       var r = Math.sqrt(p[0]*p[0] + p[2] * p[2]);
       var a = Math.atan2(p[0],p[2]) + gl.time/2;
       p[0] = r * Math.cos(a);p[2] = r*Math.sin(a) ;
       return p;
    });
  });
  var walls = new Float32Array(20*4);
  var normals = new Float32Array(20 * 3);
  var cubeMats = new Float32Array(20 * 3);
  for (i = 0; i < 20; i++) {
    var dir1 = new Vector3();
    var p = new Vector3();
    p.set(fpoints[i][0][0], fpoints[i][0][1], fpoints[i][0][2]);
    dir1.x = fpoints[i][0][0] - fpoints[i][1][0];
    dir1.y = fpoints[i][0][1] - fpoints[i][1][1];
    dir1.z = fpoints[i][0][2] - fpoints[i][1][2];
    var dir2 = new Vector3();
    dir2.x = fpoints[i][2][0] - fpoints[i][1][0];
    dir2.y = fpoints[i][2][1] - fpoints[i][1][1];
    dir2.z = fpoints[i][2][2] - fpoints[i][1][2];
    var n = vNormalize(crossProduct(dir1, dir2));
    var w = -dotProduct(n, p);
    if (w < 0) {
      n.negate();
      w = w * -1;
    }
    walls[i*4 + 0] = n.x;
    walls[i*4 + 1] = n.y;
    walls[i*4 + 2] = n.z;
    walls[i*4 + 3] = w;
    normals[i * 3] = -n.x;
    normals[i * 3 + 1] = -n.y;
    normals[i * 3 + 2] = -n.z;
    cubeMats[i * 3] = (i)/40 + .5;
    cubeMats[i * 3+1] = 1.;
    cubeMats[i * 3+2] = 1.;
  }
  //console.log(walls);
  gl.uniform3fv(gl.uwNormals, normals);
  gl.uniform4fv(gl.uWalls, walls);
  gl.uniform3fv(gl.uCubeMats, cubeMats);
}
var hsv2rgb = function(hsv) {
  var h = hsv.hue, s = hsv.sat, v = hsv.val;
  var rgb, i, data = [];
  if (s === 0) {
    rgb = [v,v,v];
  } else {
    h = h / 60;
    i = Math.floor(h);
    data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
    switch(i) {
      case 0:
        rgb = [v, data[2], data[0]];
      break;
      case 1:
        rgb = [data[1], v, data[0]];
      break;
      case 2:
        rgb = [data[0], v, data[2]];
      break;
      case 3:
        rgb = [data[0], data[1], v];
      break;
      case 4:
        rgb = [data[2], data[0], v];
      break;
      default:
        rgb = [v, data[0], data[1]];
      break;
    }
  }
  return '#' + rgb.map(function(x){ 
                  return ("0" + Math.round(x).toString(16)).slice(-2);
                }).join('');
};

function initCube(gl) {
      gl.cubeAnchor = new Vector3();
      gl.cubeAnchor.set(-4,-2,-10);
      gl.cubeSideLength = 9.0;
      gl.cubeDir1 = new Vector3()
      gl.cubeDir1.set(1,0,0);
      gl.cubeDir2 = new Vector3()
      gl.cubeDir2.set(0,1,0);
}

function dotProduct(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

function crossProduct(v1,v2) {
   var r = new Vector3();
   r.set(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
   return r;
}

function vNormalize(v) {
   var r = new Vector3();
   var s = Math.sqrt(dotProduct(v,v));
   r.x = v.x / s;
   r.y = v.y / s;
   r.z = v.z / s;
   return r;
}

function gl_update_uCube(gl) {
  var alpha =1.; gl.time;
  var beta = -.8;gl.time * 2;
  gl.cubeDir1.set(Math.sin(alpha), Math.cos(alpha) * Math.sin(beta), Math.cos(alpha) * Math.cos(beta));
  gl.cubeDir2.set(Math.cos(alpha), -Math.sin(alpha) * Math.sin(beta), -Math.sin(alpha) * Math.cos(beta));
  gl.cubeDir3 = crossProduct(gl.cubeDir1, gl.cubeDir2);
  var cubeDir1 = gl.cubeDir1;
  var cubeDir2 = gl.cubeDir2;
  var cubeDir3 = new Vector3();
  var dir = 1.0;
  var walls = new Float32Array(24);
  var atmp = new Vector3()
  //gl.cubeAnchor.x = Math.sin(gl.time);
  //gl.cubeAnchor.y = Math.cos(gl.time);
  atmp.copy(gl.cubeAnchor);
gl.cubeSideLength = 10;
  var cubeSideLength = gl.cubeSideLength;
  var normals = new Float32Array(3*6);
  var mats = new Float32Array(3*6);
  var spces = new Float32Array(24);
  for (i = 0; i < 6; i++) {
      cubeDir3 = vNormalize(crossProduct(cubeDir1, cubeDir2));
      walls[4*i] = -cubeDir3.x;
      walls[4*i+1] = -cubeDir3.y;
      walls[4*i+2] = -cubeDir3.z;
      walls[4*i+3] = dotProduct(cubeDir3, atmp);
      normals[3*i] = -walls[4*i];
      normals[3*i+1] = -walls[4*i+1];
      normals[3*i+2] = -walls[4*i+2];
      mats[3*i] = .5;
      mats[3*i+1] = .5;
      mats[3*i+2] = .5;
      spces[4*i] = .9;
      spces[4*i+1] = .9;
      spces[4*i+2] = .9;
      spces[4*i+3] = 100;

      //wallMats[i] = vec3(.8,.8,.8);
      //wallSpecs[i] = vec4(1.,1.,1.,10.);
      atmp.x = atmp.x + cubeDir1.x * cubeSideLength;
      atmp.z = atmp.z + cubeDir1.z * cubeSideLength;
      atmp.y = atmp.y + cubeDir1.y * cubeSideLength;
      cubeDir1.x = dir * cubeDir2.x;
      cubeDir1.y = dir * cubeDir2.y;
      cubeDir1.z = dir * cubeDir2.z;
      cubeDir2.x = dir * cubeDir3.x;
      cubeDir2.y = dir * cubeDir3.y;
      cubeDir2.z = dir * cubeDir3.z;
      dir *= -1.0;
  }
  console.log(normals);

  gl.uniform4fv(gl.uWalls, walls);
  gl.uniform3fv(gl.uwNormals, normals);
  gl.uniform4fv(gl.uCubeSpecs, spces);
  gl.uniform3fv(gl.uCubeMats, mats);
  gl.uniform1f(gl.uCubeSideLength, cubeSideLength);
  gl.uniform3f(gl.uCubeDir1, gl.cubeDir1.x, gl.cubeDir1.y, gl.cubeDir1.z);
  gl.uniform3f(gl.uCubeDir2, gl.cubeDir2.x, gl.cubeDir2.y, gl.cubeDir2.z);
  gl.uniform3f(gl.uCubeDir3, gl.cubeDir3.x, gl.cubeDir3.y, gl.cubeDir3.z);
  gl.uniform3f(gl.uCubeAnchor, gl.cubeAnchor.x, gl.cubeAnchor.y, gl.cubeAnchor.z);
}

// Function to create and attach a shader to a gl program.

function addshader(gl, program, type, src) {
   var shader = gl.createShader(type);
   gl.shaderSource(shader, src);
   gl.compileShader(shader);
   if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw "Cannot compile shader:\n\n" + gl.getShaderInfoLog(shader);
   gl.attachShader(program, shader);
};

// Initialize gl and create a square, given vertex and fragment shader defs.

function gl_init(gl, vertexShader, fragmentShader) {

   // Create and link the gl program, using the application's vertex and fragment shaders.

   var program = gl.createProgram();
   addshader(gl, program, gl.VERTEX_SHADER  , vertexShader  );
   addshader(gl, program, gl.FRAGMENT_SHADER, fragmentShader);
   gl.linkProgram(program);
   if (! gl.getProgramParameter(program, gl.LINK_STATUS))
      throw "Could not link the shader program!";
   gl.useProgram(program);

   // Create vertex data for a square, as a strip of two triangles.

   gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1,1,0, 1,1,0, -1,-1,0, 1,-1,0 ]), gl.STATIC_DRAW);

   // Assign value of attribute aPosition for each of the square's vertices.

   gl.aPosition = gl.getAttribLocation(program, "aPosition");
   gl.enableVertexAttribArray(gl.aPosition);
   gl.vertexAttribPointer(gl.aPosition, 3, gl.FLOAT, false, 0, 0);
   gl.spheres = new Vector4;

   // Get the address in the fragment shader of each of my uniform variables.

   ['uTime','uCursor','uWalls','uCubeMats','uCubeSpecs','uwNormals','uSphere', 'uRefraction'].forEach(function(name) {
      gl[name] = gl.getUniformLocation(program, name);
   });

}

// Update is called once per animation frame.


function gl_update(gl) {
   var time = ((new Date()).getTime() - startTime) / 1000;            // Set uniform variables
   gl.time = time;
   //init_shape(gl);
   gl.uniform1f(gl.uTime  , time);                                    // in fragment shader.
   gl.uniform1f(gl.uRefraction, 1.5);
   gl.uniform3f(gl.uCursor, gl.cursor.x, gl.cursor.y, gl.cursor.z);
   //gl_update_uCube(gl);
   //gl.uniform1i(gl.uCount, 2);
   init_shape(gl);
   gl_update_sphere(gl);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);                            // Render the square.
   requestAnimFrame(function() { gl_update(gl); });                   // Animate.
}

function gl_update_sphere(gl) {
   gl.uniform4fv(gl.uSphere, new Float32Array([gl.cursor.x*5,gl.cursor.y*5,-4.,1.,1.,1.,1.,1.]));
}

// A browser-independent way to call a function after 1/60 second.

requestAnimFrame = (function(callback) {
      return requestAnimationFrame
          || webkitRequestAnimationFrame
          || mozRequestAnimationFrame
          || oRequestAnimationFrame
          || msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 1000 / 60); }; })();

// Remember what time we started, so we can pass relative time to shaders.

var startTime = (new Date()).getTime();

