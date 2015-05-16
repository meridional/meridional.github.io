/// <reference path="./typings/threejs/three.d.ts" />
/// <reference path="./mazegen.ts" />
var wallWidth = .1;
var wallLength = 2;
var wallHeight = 2;
var turnspeed = .05;
var speed = .05;
var MazeScene = (function () {
    function MazeScene() {
        this.scene = new THREE.Scene();
    }
    MazeScene.prototype.tryJump = function () {
    };
    MazeScene.prototype.currentDirection = function () {
        return new THREE.Vector3(Math.sin(this.direction), -0., Math.cos(this.direction));
    };
    MazeScene.prototype.changeDirection = function (delta) {
        this.direction += delta;
        this.camera.rotateY(delta);
    };
    MazeScene.prototype.turnLeft = function () {
        this.changeDirection(turnspeed);
    };
    MazeScene.prototype.turnRight = function () {
        this.changeDirection(-turnspeed);
    };
    MazeScene.prototype.collisiontest = function (forward) {
        var dir = this.currentDirection().multiplyScalar(forward ? 1 : -1);
        var tracer = new THREE.Raycaster(new THREE.Vector3(this.camera.position.x, 0, this.camera.position.z), dir, 0, 0.4);
        var int = tracer.intersectObject(this.walls);
        return int.length > 0;
    };
    MazeScene.prototype.moveForward = function () {
        if (this.collisiontest(true))
            return;
        this.camera.position.add(this.currentDirection().multiplyScalar(speed));
    };
    MazeScene.prototype.moveBackward = function () {
        if (this.collisiontest(false))
            return;
        this.camera.position.add(this.currentDirection().multiplyScalar(-speed));
    };
    MazeScene.prototype.render = function (renderer) {
        renderer.render(this.scene, this.camera);
    };
    MazeScene.prototype.set = function (rows, cols) {
        for (var i = this.scene.children.length - 1; i >= 0; i--) {
            this.scene.remove(this.scene.children[i]);
        }
        //return;
        function indexToCoordinate(i, j) {
            return new THREE.Vector3(i - rows / 2, 0, j - cols / 2).multiplyScalar(wallLength);
        }
        this.edges = kruskal(rows, cols);
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
        this.scene.add(new THREE.AmbientLight(0x0f0f0f));
        var floortext = THREE.ImageUtils.loadTexture("floor.jpg");
        var plane = new THREE.PlaneBufferGeometry(cols * wallLength * 2, rows * wallLength * 2);
        var floor = new THREE.Mesh(plane, new THREE.MeshPhongMaterial({ color: 0xaaaaaa, wireframe: false, map: floortext, side: THREE.DoubleSide, repeat: [rows / 2, cols / 2] }));
        floor.rotateX(Math.PI / 2);
        floor.receiveShadow = true;
        var ceil = new THREE.Mesh(plane, new THREE.MeshPhongMaterial({
            map: floortext,
            side: THREE.DoubleSide,
            repeat: [rows, cols]
        }));
        ceil.rotateX(Math.PI / 2);
        ceil.position.set(0, wallHeight / 2, 0);
        scene.add(ceil);
        scene.add(floor);
        this.camera = new THREE.PerspectiveCamera(50, 800 / 600, .1, 2000);
        var cameraHeight = 0.5;
        var beginning = indexToCoordinate(0, 0);
        var spotlight = new THREE.PointLight(0xffffff, 1, 10);
        this.camera.add(spotlight);
        //spotlight.lookAt(new THREE.Vector3(0., cameraHeight,1.));
        this.scene.add(this.camera);
        this.camera.position.set(beginning.x, cameraHeight, beginning.z);
        this.camera.lookAt(new THREE.Vector3(0., cameraHeight, 0));
        var xx = new THREE.Vector3().subVectors(new THREE.Vector3(0, cameraHeight, 0), this.camera.position);
        this.direction = Math.atan2(xx.x, xx.z);
        this.theEnd = new THREE.Mesh(new THREE.SphereGeometry(.2), new THREE.MeshNormalMaterial());
        this.scene.add(this.theEnd);
        var endCoord = indexToCoordinate(rows - 1, cols - 1);
        this.theEnd.position.set(endCoord.x, endCoord.y, endCoord.z);
        this.theEnd.position.setY(cameraHeight);
        this.theEnd.position.y = cameraHeight;
    };
    MazeScene.prototype.goalReached = function () {
        return this.camera.position.distanceTo(this.theEnd.position) < wallLength / 5;
    };
    return MazeScene;
})();
function hijackKD(mazeScene) {
    kd.W.down(function () {
        mazeScene.moveForward();
    });
    kd.A.down(function () {
        mazeScene.turnLeft();
    });
    kd.D.down(function () {
        mazeScene.turnRight();
    });
    kd.S.down(function () {
        mazeScene.moveBackward();
    });
}
function unbind() {
    kd.W.unbindDown();
    kd.A.unbindDown();
    kd.D.unbindDown();
    kd.S.unbindDown();
}
function start(mazeScene, renderer) {
    kd.tick();
    if (mazeScene.goalReached()) {
        //alert("next level will be " + mazeScene.rows * 2 + " x " + mazeScene.cols * 2);
        mazeScene.set(mazeScene.rows * 2, mazeScene.cols * 2); // = new MazeScene(mazeScene.rows * 2, mazeScene.cols * 2);
    }
    mazeScene.render(renderer);
    requestAnimationFrame(function () {
        start(mazeScene, renderer);
    });
}
window.onload = function () {
    console.log("hello");
    var three = new MazeScene();
    three.set(2, 2);
    hijackKD(three);
    //kd.SpaceKey.down(function() {three.tryJump();});
    var renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(800, 600);
    renderer.setClearColor(0x000000, 1);
    // Bind the renderer to the HTML, parenting it to our 'content' DIV
    document.getElementById('content').appendChild(renderer.domElement);
    start(three, renderer);
};
//# sourceMappingURL=drawmaze3d.js.map