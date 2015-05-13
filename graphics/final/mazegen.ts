module MazeGen {
  // uses kruskal algorithm
  export function kruskal(rows : number, cols : number) : Array<Edge> {
    var cells : Array<Array<Vertex>> = new Array();
    // make a matrix of cells
    for (var i = 0; i < rows; i++) {
      var tmp : Array<Vertex> = new Array();
      for (var j = 0; j < cols; j++) {
        tmp.push(new Vertex(i, j, rows, cols));
      }
      cells.push(tmp);
    }

    // make the edges
    var edges : Array<Edge> = new Array();
    for (var i = 0; i < rows - 1; i++) {
      for (var j = 0; j < cols - 1; j++) {
        edges.push(new Edge(cells[i][j], cells[i+1][j], Math.random()));
        edges.push(new Edge(cells[i][j], cells[i][j+1], Math.random()));
      }
    }
    for (var i = 0; i < rows - 1; i++) {
      edges.push(new Edge(cells[i][cols-1], cells[i+1][cols-1], Math.random()));
    }
    for (var j = 0; j < cols - 1; j++) {
      edges.push(new Edge(cells[rows-1][j], cells[rows-1][j+1], Math.random()));
    }
    // shuffle edges randomly
    edges.sort(function(a: Edge, b: Edge) {return a.weight - b.weight;});

    console.log(edges.length);
    // kruskal
    var union = new UnionFind(rows * cols);
    var result : Array<Edge> = new Array();
    for (var i : number = 0; i < edges.length; i++) {
      if (union.find(edges[i].from.id) != union.find(edges[i].to.id)) {
        result.push(edges[i]);
        union.union(edges[i].from.id, edges[i].to.id);
      }
    } 
    union.print();
    return result;
  }

  class UnionFind {
    parents : number[];
    constructor(total: number) {
      this.parents = new Array(total);
      for (var i : number = 0; i < total; i++) {
        this.parents[i] = i;
      }
    }
    union(i : number, j : number) : void {
      var ip : number = this.find(i);
      var jp : number = this.find(j);
      if (ip != jp) this.parents[ip] = jp;
    }
    find(i : number) : number {
      if (this.parents[i] != i) {
        this.parents[i] = this.find(this.parents[i]);
      }
      return this.parents[i];
    }
    print() : void {
      for (var i = 0; i < this.parents.length; i++) {
        console.log(this.find(i));
      }
    }
  }


  class Edge {
    from : Vertex;
    to : Vertex;
    weight : number;
    constructor(from : Vertex, to : Vertex, weight : number) {
      this.from = from;
      this.to = to;
      this.weight = weight;
    }
  }

  class Vertex {
    /// coord: (i, j)
    i : number;
    j : number;
    id : number;
    constructor(i : number, j : number, rows : number, cols: number) {
      this.i = i; this.j = j;
      this.id = this.i * cols + this.j;
    }
  }
}
