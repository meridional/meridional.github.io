window.time = 0;
window.SimpleScene = function() {
  this.init = function(name) {
    this.scene = new THREE.Scene();

    // CREATE THE CAMERA, AND ATTACH IT TO THE SCENE.

    var camera = new THREE.PerspectiveCamera(50, 1, 1, 10000);
    camera.position.z = 5;
    this.scene.add(camera);
    this.camera = camera;

    // CREATE THE WEBGL RENDERER, AND ATTACH IT TO THE DOCUMENT BODY.

    var renderer = new THREE.WebGLRenderer( { alpha: true } );
    renderer.setSize(800, 800);
    document.getElementById(name).appendChild(renderer.domElement);

    // CALL THE USER'S SETUP FUNCTION JUST ONCE.

    this.setup();

    // START THE ANIMATION LOOP.

    var that = this;
    (function tick() {
      time = (new Date().getTime()) / 1000;
      that.update();
      renderer.render(that.scene, camera);
      requestAnimationFrame(tick);
    })();
  }
};

function Scene1() {
  var box;
  var body;
  var head;
  var leftForearm;
  var rightForearm;
  var lua;
  var lelb;
  var rua;
  var relb;
  var larmJoint;
  var rarmJoint;
  var leftThigh;
  var rightThigh;
  var material;


  var bodyLength = 0.8;
  var bodyWidth = .2;
  var falength = .3;
  var armxdisp = .2;
  var armydisp = .4;
  function leftArm(body) {
    larmJoint = new THREE.Mesh(new THREE.SphereGeometry(.0), material);
    larmJoint.rotation.z += .1;
    larmJoint.position.y += armydisp;
    larmJoint.position.x += armxdisp;

    leftForearm = new THREE.Mesh(new THREE.BoxGeometry(.1, falength,.1), material);
    leftForearm.position.y -= 0.3;
    larmJoint.add(leftForearm);
    body.add(larmJoint);

    lua = new THREE.Mesh(new THREE.BoxGeometry(.1,.3,.1), material);
    lelb = new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1), material);
    lelb.rotation.x += Math.PI/2;
    lelb.position.y = -.25;
    lua.position.y += .2;
    leftForearm.add(lelb);
    lelb.add(lua);
  }
  function rightArm(body) {
    rarmJoint = new THREE.Mesh(new THREE.BoxGeometry(.0,.0,.0), material);
    rarmJoint.rotation.z -= .1;
    rarmJoint.position.y += armydisp;
    rarmJoint.position.x -= armxdisp;
    rightForearm = new THREE.Mesh(new THREE.BoxGeometry(.1, falength,.1), material);
    rightForearm.position.y -= .3;
    rarmJoint.add(rightForearm);

    body.add(rarmJoint);
    rua = new THREE.Mesh(new THREE.BoxGeometry(.1,.3,.1), material);
    relb = new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1), material);
    relb.rotation.x += Math.PI/2;
    relb.position.y = -.25;
    rua.position.y += .2;
    rightForearm.add(relb);
    relb.add(rua);
  }

  var lljoint;
  var lknee;
  var lydisp = .45;
  var lxdisp = .1;
  function leftLeg(body) {
    lljoint = new THREE.Mesh(new THREE.SphereGeometry(.0), material);
    lljoint.rotation.z += .1;
    lljoint.position.y -= lydisp;
    lljoint.position.x += lxdisp;

    leftThigh = new THREE.Mesh(new THREE.BoxGeometry(.1,.5,.1), material);
    leftThigh.position.y -= .3;
    //leftThigh.position.x += .1;
    lljoint.add(leftThigh);
    body.add(lljoint);

    lknee = new THREE.Mesh(new THREE.SphereGeometry(.0), material);
    lknee.rotation.x += .9;
    lknee.position.y -= .35;
    leftThigh.add(lknee);

    var lleg = new THREE.Mesh(new THREE.BoxGeometry(.1,.5,.1), material);
    lleg.position.y -= .3;
    lknee.add(lleg);
  }

  var rljoint;
  var rknee;
  function rightLeg(body) {
    rljoint = new THREE.Mesh(new THREE.SphereGeometry(.0), material);
    rljoint.rotation.z -= .1;
    rljoint.position.y -= lydisp;
    rljoint.position.x -= lxdisp;
    rightThigh = new THREE.Mesh(new THREE.BoxGeometry(.1,.5,.1), material);
    rightThigh.position.y -= .3;
    //leftThigh.position.x += .1;
    rljoint.add(rightThigh);
    body.add(rljoint);

    rknee = new THREE.Mesh(new THREE.SphereGeometry(.0), material);
    rknee.rotation.x += .9;
    rknee.position.y -= .35;
    rightThigh.add(rknee);

    var rleg = new THREE.Mesh(new THREE.BoxGeometry(.1,.5,.1), material);
    rleg.position.y -= .3;
    rknee.add(rleg);
  }
  function generateTexture() {

	var size = 512;

	// create canvas
	canvas = document.createElement( 'canvas' );
	canvas.width = size;
	canvas.height = size;

	// get context
	var context = canvas.getContext( '2d' );

	// draw gradient
	context.rect( 0, 0, size, size );
	var gradient = context.createLinearGradient( 0, 0, size, size );
	gradient.addColorStop(0, '#FF0000'); // light blue 
	gradient.addColorStop(1, 'transparent'); // dark blue
	context.fillStyle = gradient;
	context.fill();

	return canvas;

  }

  var ground;
  var sky;
  function setGround(scene) {
    var radius = 100;
    var texture = new THREE.Texture( generateTexture() );
    ground = new THREE.Mesh(new THREE.SphereGeometry(radius, 100, 100), material );
    // instantiate a loader
    //THREE.ImageUtils.crossOrigin = "";
    var texture = THREE.ImageUtils.loadTexture( 'images/cloud10.png', null, null );
    //var mapCloud = THREE.ImageUtils.loadTexture('images/cloud10.png');
    var cloud = new THREE.PointCloudMaterial( {
      map: texture,
      size: 50
    } );
    //sky = new THREE.PointCloud(new THREE.SphereGeometry(radius * 2, 100, 100), cloud);
    //sky.position.y -= 100 + 1.6;
    //sky.side = THREE.DoubleSide;
    //scene.add(sky);
    //ground.position.z -= 50;
    ground.position.y -= 100 + 1.6;

    scene.add(ground);
    //scene.add(sky);
    //sky.material.side = THREE.DoubleSide;
    for (var i = 0; i < 100; i++) {
      var box;
      if (i % 2 == 1) {
        box = new THREE.Mesh(new THREE.BoxGeometry(.2,.2,.2), material);
      } else {
        box = new THREE.Mesh(new THREE.SphereGeometry(.2,10,10), material);
      }
      //var box = new THREE.Sprite(boxMat);
      //box.scale.set(.1,.1,.1);
      var angle = Math.PI * 2 / 100 * i;
      var a2 = -.01;
      box.rotation.x = angle;
      box.rotation.z = Math.PI / 4;
      box.rotation.y = Math.PI / 4;
      box.position.x = (radius + .1) * Math.sin(a2);
      box.position.z = (radius + .1) * Math.cos(a2) * Math.sin(angle);
      box.position.y = (radius + .1) * Math.cos(a2) * Math.cos(angle);
      ground.add(box);
      var newBox = box.clone();
      a2 = -a2;
      newBox.position.x = (radius + .1) * Math.sin(a2);
      newBox.position.z = (radius + .1) * Math.cos(a2) * Math.sin(angle + Math.PI *2 / 100);
      newBox.position.y = (radius + .1) * Math.cos(a2) * Math.cos(angle + Math.PI *2/ 100);
      ground.add(newBox);
    }
  }
  this.setup = function() {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    material = new THREE.MeshNormalMaterial({wireframe:false});
    body = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth, bodyLength, bodyWidth), material);
    head = new THREE.Mesh(new THREE.BoxGeometry(.2, .2, .2), material);
    head.position.y += bodyLength / 2 + .15;
    head.rotation.z += Math.PI/ 4;
    this.scene.add(body);
    body.add(head);
    leftArm(body);
    rightArm(body);
    leftLeg(body);
    rightLeg(body);

    setGround(this.scene);

    // lean forward
    var camerarot = .7;
    this.camera.position.x = Math.sin(camerarot) * 5;
    this.camera.position.z = Math.cos(camerarot) * 5;
  }

  var phase = 0;
  var speed = 5;
  this.update = function() {
    //this.camera.position.x = Math.sin(window.time) * 5;
    //this.camera.position.z = Math.cos(window.time) * 5;
    speed -= .05;
    speed = Math.max(5, speed);
    phase += speed * .01;
    body.rotation.x = speed/100;
    var legAmp = speed / 20 * .5;
    var armAmp = speed / 20 * .5;
    this.camera.lookAt(new THREE.Vector3(0,0,0));
    lljoint.rotation.x = Math.sin(phase+Math.PI) * legAmp;
    rljoint.rotation.x = Math.sin(phase) * legAmp;
    lknee.rotation.x = legAmp+Math.sin(phase+ Math.PI/4)*legAmp;
    rknee.rotation.x = legAmp+Math.sin(phase+ Math.PI/4 +Math.PI)*legAmp;
    lelb.rotation.x = Math.sin(phase)*armAmp + Math.PI * 8/ 9  - .3 * armAmp;
    relb.rotation.x = Math.sin(phase + Math.PI)*armAmp + Math.PI * 8 / 9 - .3 * armAmp;
    rarmJoint.rotation.x = Math.sin(phase + Math.PI)*armAmp;
    larmJoint.rotation.x = Math.sin(phase)*armAmp;
    body.rotation.y = Math.sin(phase) * .2 * speed / 10;
    head.rotation.y = Math.sin(phase) * .4 * speed / 20;
    ground.rotation.x -= speed / 20000;
    if (sky)
      sky.rotation.x -= speed / 20000;
  };

  window.addEventListener("keydown", pressed, false);
  function pressed(evt) {
    if (event.keyCode == 32 || event.keyCode == 119) {
      speed += 1.2;
      speed = Math.min(20, speed);
    }
    console.log("hello");
  };
}
Scene1.prototype = new SimpleScene;
window.onload = function() {
  new Scene1().init('Scene1_id');

}
