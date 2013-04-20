var Board = function (canvas, settings) {
	this.settings = settings;
	this.canvas = canvas;
	this.drawingContext = canvas.getContext('2d');
	this.isDrawing = false;

	try {
		this.load();
	} catch (e) {
		this.clear();
	}
};

Board.prototype.adjustSize = function(width, height) {
	this.width = width;
	this.height = height;
	this.canvas.width = this.width * this.settings.squareSize;
	this.canvas.height = this.height * this.settings.squareSize;
	this.draw();
};

Board.prototype.load = function () {
	this.state = localStorage.lastBoard ? JSON.parse(localStorage.lastBoard) : [];
};

Board.prototype.draw = function () {
	this.drawGridLines();

	if (this.state && this.state.length > 0) {
		this.populateGrid();
	}
};

Board.prototype.drawCell = function (cell, isAlive) {
	if (isAlive) {
		this.add(cell);
	} else {
		this.remove(cell);
	}

	if (socket && socket.readyState == 1)
		socket.send(getJsonMessage('draw', 'draw'));
};

Board.prototype.reset = function() {
	this.clear();
	this.draw();
};

Board.prototype.restore = function() {
	this.load();
	this.draw();
};

Board.prototype.clear = function() {
	this.state = localStorage.lastBoard = [];
};

Board.prototype.save = function() {
	localStorage.lastBoard = JSON.stringify(this.state);
};

Board.prototype.drawGridLines = function() {
	for (var i = 0; i < this.width; i++) {
		for (var j = 0; j < this.height; j++) {
			this.drawDeadCell(new Cell(i, j));
		}
	}
};

Board.prototype.populateGrid = function() {
	for (var i = 0; i < this.state.length; i++) {
		if (this.state[i].x < this.width || this.state[i].y < this.height) {
			this.drawAliveCell(this.state[i]);
		}
	}
};

Board.prototype.drawAliveCell = function (cell) {
	this.drawingContext.fillStyle = this.settings.fillColor;
	this.drawingContext.strokeStyle = this.settings.gridColor;

	this.drawingContext.fillRect(cell.x * this.settings.squareSize, cell.y * this.settings.squareSize, this.settings.squareSize, this.settings.squareSize);
	this.drawingContext.stroke();
};

Board.prototype.drawDeadCell = function (cell) {
	this.drawingContext.strokeStyle = this.settings.gridColor;

	this.drawingContext.clearRect(cell.x * this.settings.squareSize, cell.y * this.settings.squareSize, this.settings.squareSize, this.settings.squareSize);
	this.drawingContext.strokeRect(cell.x * this.settings.squareSize, cell.y * this.settings.squareSize, this.settings.squareSize, this.settings.squareSize);
	this.drawingContext.stroke();
};

Board.prototype.add = function (cell) {
	if (cell.getIndex(this.state) == -1) {
		this.state.push(cell);
		this.drawAliveCell(cell);
	}
};

Board.prototype.remove = function (cell) {
	var index = cell.getIndex(this.state);
	if (index > -1) {
		this.state.splice(index, 1);
		this.drawDeadCell(cell);
	}
};

Board.prototype.zoom = function (type, cell) {
	if (!this.isZoomable(type)) {
		return;
	}

	this.settings.squareSize += type * this.settings.zoomFactor;
	this.width = this.canvas.width / this.settings.squareSize;
	this.height = this.canvas.height / this.settings.squareSize;
	this.translateElements(cell);
	this.draw();
};

Board.prototype.isZoomable = function (type) {
	if (type < 0) {
		return this.settings.squareSize >= 2 * this.settings.zoomFactor;
	}
	
	return this.settings.squareSize < (this.canvas.width / 4) && this.settings.squareSize < (this.canvas.height / 4);
};

Board.prototype.translateElements = function (cell) {
	var shiftHorizontally = Math.floor(this.width/2) - cell.x;
	var shiftVertically = Math.floor(this.height/2) - cell.y;
	this.state.forEach(function (elem) {
		elem.x += shiftHorizontally;
		elem.y += shiftVertically;
	});
};

Board.prototype.startDrawing = function (cell, isAlive) {
	this.isDrawing = true;
	this.drawCell(cell, isAlive);
};

Board.prototype.drawAdjacentCells = function (cell, isAlive) {
	if (this.isDrawing) {
		this.drawCell(cell, isAlive);
	}
};

Board.prototype.stopDrawing = function (cell, isAlive) {
	if (this.isDrawing) {
		this.drawCell(cell, isAlive);
	}
	this.save();
	this.isDrawing = false;
};
