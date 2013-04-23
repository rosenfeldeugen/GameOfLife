/*
* CellularAutomata
*/
var CellularAutomata = function (state) {
	this.state = state;
};

CellularAutomata.prototype.isAlive = function (cell) {
	return cell.getIndex(this.state) > -1;
};

CellularAutomata.prototype.getNoOfNeighbors = function (cell) {
	return this.state.filter(function (element) {
		return cell.isNeighbor(element);
	}).length;
};

CellularAutomata.prototype.getSearchSpaceStartIndex = function (axis) {
	return this.state.reduce(function (elementA, elementB) {
		var min = Math.min(elementA[axis], elementB[axis]);
		return new Cell(min, min);
	})[axis] - 1;
};

CellularAutomata.prototype.getSearchSpaceEndIndex = function (axis) {
	return this.state.reduce(function (elementA, elementB) {
		var max = Math.max(elementA[axis], elementB[axis]);
		return new Cell(max, max);
	})[axis] + 1;
};

CellularAutomata.prototype.tick = function () {
	var minX = this.getSearchSpaceStartIndex('x');
	var maxX = this.getSearchSpaceEndIndex('x');
	var minY = this.getSearchSpaceStartIndex('y');
	var maxY = this.getSearchSpaceEndIndex('y');
		
	var nextState = [];
	this.elementsRemoved = [];
	
	for (var i = minX; i <= maxX; i++) {
		for (var j = minY; j <= maxY; j++) {
			var cell = new Cell(i, j);
			var neighbors = this.getNoOfNeighbors(cell);

			if (neighbors == 3 || neighbors == 2 && this.isAlive(cell)) {
				nextState.push(cell);
			} else if (this.isAlive(cell)) {
				this.elementsRemoved.push(cell);
			}
		}
	}

	this.state = nextState;
};

/*
* Cell
*/
var Cell = function (x, y, isAlive) {
	this.x = x;
	this.y = y;
	this.isAlive = isAlive;
};

Cell.prototype.equals = function (otherCell) {
	return this.x === otherCell.x && this.y === otherCell.y;
};

Cell.prototype.isNeighbor = function (otherCell) {
	return Math.abs(this.x - otherCell.x) <= 1 && Math.abs(this.y - otherCell.y) <= 1 && !this.equals(otherCell);
};

Cell.prototype.getIndex = function (context) {
	for (var i = 0; i < context.length; i++) {
		if (this.equals(context[i])) {
			return i;
		}
	}
	return -1;
};