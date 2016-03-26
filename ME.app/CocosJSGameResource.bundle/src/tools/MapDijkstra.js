function PriorityQueue () {
	this._nodes = [];

	this.enqueue = function (priority, key) {
		this._nodes.push({key: key, priority: priority });
		this.sort();
	}
	this.dequeue = function () {
		return this._nodes.shift().key;
	}
	this.sort = function () {
		this._nodes.sort(function (a, b) {
			return a.priority - b.priority;
		});
	}
	this.isEmpty = function () {
		return !this._nodes.length;
	}
}

/**
 * Pathfinding starts here
 */
function Graph(){
	var INFINITY = 1/0;
	this.vertices = {};

	this.addVertex = function(name, edges){
		if(this.vertices[name])
		{
//			MU.logObj({before:name,value:this.vertices[name]});
			for(value in edges)
			{
//				MU.logObj({name:name,value:value,edges:edges[value]});
				this.vertices[name][value] = edges[value];
			}
//			MU.logObj({after1:name,value:this.vertices[name]});
		}else
		{
			this.vertices[name] = edges;
//			MU.logObj({after2:name,value:this.vertices[name]});
		}
	},

	this.concatGraph = function(g2){
		var g1 = new Graph();
		for(v1 in this.vertices){
//			MU.logObj({v1:v1,value:this.vertices[v1]});
			g1.vertices[v1] = this.vertices[v1];
		}
		for(v2 in g2.vertices){
			g1.addVertex(v2,g2.vertices[v2]);
		}
		return g1;
	},

	this.shortestPath = function (start, finish) {
		var nodes = new PriorityQueue(),
		distances = {},
		previous = {},
		path = [],
		smallest, vertex, neighbor, alt;

		for(vertex in this.vertices) {
			if(vertex === start) {
				distances[vertex] = 0;
				nodes.enqueue(0, vertex);
			}
			else {
				distances[vertex] = INFINITY;
				nodes.enqueue(INFINITY, vertex);
			}

			previous[vertex] = null;
		}

		while(!nodes.isEmpty()) {
			smallest = nodes.dequeue();

			if(smallest === finish) {
				path;

				while(previous[smallest]) {
					path.push(smallest);
					smallest = previous[smallest];
				}

				break;
			}

			if(!smallest || distances[smallest] === INFINITY){
				continue;
			}

			for(neighbor in this.vertices[smallest]) {
				alt = distances[smallest] + this.vertices[smallest][neighbor];

				if(alt < distances[neighbor]) {
					distances[neighbor] = alt;
					previous[neighbor] = smallest;

					nodes.enqueue(alt, neighbor);
				}
			}
		}

		return path;
	}
}