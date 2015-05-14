/// <reference path="./mazegen.ts" />
function start() {
    var canvas = initCanvas('canvas1');
    var rows = 100;
    var cols = 100;
    var edges = kruskal(rows, cols);
    function normalize(i, j) {
        return [i / rows * 2 - 1, j / cols * 2 - 1];
    }
    function drawEdge(g, e) {
        g.moveTo(e.from.i * 6, e.from.j * 6);
        g.lineTo(e.to.i * 6, e.to.j * 6);
    }
    canvas.update = function (g) {
        g.clearRect(0, 0, canvas.width, canvas.height);
        g.beginPath();
        for (var i = 0; i < edges.length; i++) {
            drawEdge(g, edges[i]);
        }
        g.stroke();
    };
}
start();
