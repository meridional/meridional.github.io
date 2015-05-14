// uses kruskal algorithm
function kruskal(rows, cols) {
    var cells = [];
    for (var i = 0; i < rows; i++) {
        var tmp = [];
        for (var j = 0; j < cols; j++) {
            tmp.push(new Vertex(i, j, rows, cols));
        }
        cells.push(tmp);
    }
    // make the edges
    var edges = [];
    for (var i = 0; i < rows - 1; i++) {
        for (var j = 0; j < cols - 1; j++) {
            edges.push(new Edge(cells[i][j], cells[i + 1][j], Math.random()));
            edges.push(new Edge(cells[i][j], cells[i][j + 1], Math.random()));
        }
    }
    for (var i = 0; i < rows - 1; i++) {
        edges.push(new Edge(cells[i][cols - 1], cells[i + 1][cols - 1], Math.random()));
    }
    for (var j = 0; j < cols - 1; j++) {
        edges.push(new Edge(cells[rows - 1][j], cells[rows - 1][j + 1], Math.random()));
    }
    // shuffle edges randomly
    edges.sort(function (a, b) {
        return a.weight - b.weight;
    });
    // kruskal
    var union = new UnionFind(rows * cols);
    var result = [];
    for (var i = 0; i < edges.length; i++) {
        if (union.find(edges[i].from.id) != union.find(edges[i].to.id)) {
            result.push(edges[i]);
            union.union(edges[i].from.id, edges[i].to.id);
        }
    }
    return result;
}
var UnionFind = (function () {
    function UnionFind(total) {
        this.parents = new Array(total);
        for (var i = 0; i < total; i++) {
            this.parents[i] = i;
        }
    }
    UnionFind.prototype.union = function (i, j) {
        var ip = this.find(i);
        var jp = this.find(j);
        if (ip != jp)
            this.parents[ip] = jp;
    };
    UnionFind.prototype.find = function (i) {
        if (this.parents[i] != i) {
            this.parents[i] = this.find(this.parents[i]);
        }
        return this.parents[i];
    };
    UnionFind.prototype.print = function () {
        for (var i = 0; i < this.parents.length; i++) {
            console.log(this.find(i));
        }
    };
    return UnionFind;
})();
var Edge = (function () {
    function Edge(from, to, weight) {
        this.from = from;
        this.to = to;
        this.weight = weight;
    }
    return Edge;
})();
var Vertex = (function () {
    function Vertex(i, j, rows, cols) {
        this.i = i;
        this.j = j;
        this.id = this.i * cols + this.j;
    }
    return Vertex;
})();
//# sourceMappingURL=mazegen.js.map