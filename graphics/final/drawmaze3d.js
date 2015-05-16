/// <reference path="./typings/threejs/three.d.ts" />
/// <reference path="./mazegen.ts" />
var wallWidth = .1;
var wallLength = 2;
var wallHeight = 2;
var turnspeed = .05;
var speed = .05;
var ThreeJSTest = (function () {
    function ThreeJSTest(rows, cols) {
        //return;
        function indexToCoordinate(i, j) {
            return new THREE.Vector3(i - (rows / 2), 0, j - cols / 2).multiplyScalar(wallLength);
        }
        this.edges = kruskal(rows, cols);
        console.log(this.edges.length);
        this.rows = rows;
        this.cols = cols;
        var horizontalBox = new THREE.BoxGeometry(wallLength, wallHeight, wallWidth);
        var verticalBox = new THREE.BoxGeometry(wallWidth, wallHeight, wallLength);
        var texture = THREE.ImageUtils.loadTexture("wall.jpg");
        // texture.minFilter = THREE.NearestFilter;
        //texture.wrapS = THREE.RepeatWrapping;
        //texture.wrapT = THREE.RepeatWrapping;
        var mat = new THREE.MeshPhongMaterial({ map: texture, wireframe: false });
        //var mat = new THREE.MeshNormalMaterial();
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(800, 800);
        this.renderer.setClearColor(0xFFFFFF, 1);
        // Bind the renderer to the HTML, parenting it to our 'content' DIV
        document.getElementById('content').appendChild(this.renderer.domElement);
        // Create a Scene
        var scene = new THREE.Scene();
        this.scene = scene;
        var wallsGeo = new THREE.Geometry();
        this.edges.map(function (edge) {
            var from = edge.from;
            var to = edge.to;
            var box = (to.i == from.i) ? horizontalBox : verticalBox;
            var fromVec = indexToCoordinate(to.i, to.j);
            var toVec = indexToCoordinate(from.i, from.j);
            wallsGeo.merge(box, new THREE.Matrix4().makeTranslation((fromVec.x + toVec.x) / 2, (fromVec.y + toVec.y) / 2, (fromVec.z + toVec.z) / 2), 0);
        });
        for (var i = 0; i < rows; i++) {
            var box = horizontalBox;
            var pleft = indexToCoordinate(i, -.5);
            var pright = indexToCoordinate(i, cols - .5);
            wallsGeo.merge(box, new THREE.Matrix4().makeTranslation(pleft.x, 0, pleft.z), 0);
            wallsGeo.merge(box, new THREE.Matrix4().makeTranslation(pright.x, 0, pright.z), 0);
        }
        for (var j = 0; j < cols; j++) {
            var box = verticalBox;
            var pleft = indexToCoordinate(-.5, j);
            var pright = indexToCoordinate(rows - .5, j);
            wallsGeo.merge(box, new THREE.Matrix4().makeTranslation(pleft.x, 0, pleft.z), 0);
            wallsGeo.merge(box, new THREE.Matrix4().makeTranslation(pright.x, 0, pright.z), 0);
        }
        this.walls = new THREE.Mesh(wallsGeo, mat);
        scene.add(this.walls);
        this.scene.add(new THREE.AmbientLight(0xffffff));
        var floortext = THREE.ImageUtils.loadTexture("floor.jpg");
        var plane = new THREE.PlaneBufferGeometry(cols * wallLength * 2, rows * wallLength * 2);
        var floor = new THREE.Mesh(plane, new THREE.MeshPhongMaterial({ color: 0xaaaaaa, wireframe: false, map: floortext, side: THREE.DoubleSide, repeat: [1, 1] }));
        floor.rotateX(Math.PI / 2);
        floor.receiveShadow = true;
        scene.add(floor);
        this.camera = new THREE.PerspectiveCamera(50, 1, .1, 2000);
        this.camera.position.set(0, 2.5, 0);
        this.camera.lookAt(new THREE.Vector3(0., 2.5, 1.));
        this.direction = 0;
        this.scene.add(this.camera);
        this.renderer.render(this.scene, this.camera);
    }
    ThreeJSTest.prototype.currentDirection = function () {
        return new THREE.Vector3(Math.sin(this.direction), -0., Math.cos(this.direction));
    };
    ThreeJSTest.prototype.changeDirection = function (delta) {
        this.direction += delta;
        this.camera.rotateY(delta);
    };
    ThreeJSTest.prototype.turnLeft = function () {
        this.changeDirection(turnspeed);
    };
    ThreeJSTest.prototype.turnRight = function () {
        this.changeDirection(-turnspeed);
    };
    ThreeJSTest.prototype.collisiontest = function (forward) {
        var dir = this.currentDirection().multiplyScalar(forward ? 1 : -1);
        var tracer = new THREE.Raycaster(new THREE.Vector3(this.camera.position.x, 0, this.camera.position.z), dir, 0, 0.4);
        var int = tracer.intersectObject(this.walls);
        return int.length > 0;
    };
    ThreeJSTest.prototype.moveForward = function () {
        if (this.collisiontest(true))
            return;
        this.camera.position.add(this.currentDirection().multiplyScalar(speed));
    };
    ThreeJSTest.prototype.moveBackward = function () {
        if (this.collisiontest(false))
            return;
        this.camera.position.add(this.currentDirection().multiplyScalar(-speed));
    };
    ThreeJSTest.prototype.render = function () {
        this.renderer.render(this.scene, this.camera);
    };
    ThreeJSTest.prototype.turn = function () {
        //this.lightTarget.rotateY(.01);
    };
    return ThreeJSTest;
})();
function start(test) {
    test.turn();
    test.renderer.render(test.scene, test.camera);
    kd.tick();
    requestAnimationFrame(function () {
        start(test);
    });
}
window.onload = function () {
    console.log("hello");
    var three = new ThreeJSTest(20, 20);
    kd.W.down(function () {
        three.moveForward();
    });
    kd.A.down(function () {
        three.turnLeft();
    });
    kd.D.down(function () {
        three.turnRight();
    });
    kd.S.down(function () {
        three.moveBackward();
    });
    start(three);
};
//# sourceMappingURL=drawmaze3d.js.map