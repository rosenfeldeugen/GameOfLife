define(["Cell"], function (Cell) {
    

    var Position2D = function (x, y) {
        this.x = x;
        this.y = y;
    };

    Position2D.prototype.isNeighbor = function (position) {
        var xDiff = Math.abs(this.x - position.x);
        var yDiff = Math.abs(this.y - position.y);
        return xDiff <= 1 && yDiff <= 1;
    };

    Position2D.prototype.toString = function () {
        return this.x + "|" + this.y;
    };

    Position2D.prototype.neighbours = function () {
        var neighbours = [];
        for (var x = this.x - 1; x <= this.x + 1; x++) {
            for (var y = this.y - 1; y <= this.y + 1; y++) {
                if (x != this.x || y != this.y) {
                    neighbours.push(new Position2D(x, y));
                }
            }
        }
        return neighbours;
    };

    var Univers2D = function (canvas, settings) {
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

    Univers2D.prototype.adjustSize = function (width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = this.width * this.settings.squareSize;
        this.canvas.height = this.height * this.settings.squareSize;
        this.draw(true);
    };

    Univers2D.prototype.load = function () {
        this.state = localStorage.lastBoard ? JSON.parse(localStorage.lastBoard) : [];
        for (var pos in this.state) {
            if (!this.state[pos]) {
                delete this.state[pos];
            }
        }
        this.removed = [];
    };

    Univers2D.prototype.draw = function (redrawGrid) {
        if (redrawGrid)
            this.drawGridLines();
        this.populateGrid();
        this.removedDeadCells();
    };

    Univers2D.prototype.drawCell = function (cell) {
        if (cell.isAlive) {
            this.add(cell);
        } else {
            this.remove(cell);
        }
    };

    Univers2D.prototype.reset = function () {
        this.clear();
        this.draw(true);
    };

    Univers2D.prototype.restore = function () {
        this.load();
        this.draw(true);
    };

    Univers2D.prototype.clear = function () {
        this.state = [];
        localStorage.lastBoard = null;
    };

    Univers2D.prototype.save = function () {
        localStorage.lastBoard = JSON.stringify(this.state);
    };

    Univers2D.prototype.drawGridLines = function () {
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                this.drawDeadCell(new Cell(new Position2D(i, j), false));
            }
        }
    };

    Univers2D.prototype.populateGrid = function () {
        for (var position in this.state) {
            if (this.state[position].position.x < this.width || this.state[position].position.y < this.height) {
                this.drawAliveCell(this.state[position]);
            }
        }
    };

    Univers2D.prototype.removedDeadCells = function () {
        for (var i = 0; i < this.removed.length; i++) {
            this.drawDeadCell(this.removed[i]);
        }
    };

    Univers2D.prototype.drawAliveCell = function (cell) {

        this.drawDeadCell(cell);
        var squareSize = this.settings.squareSize;
        this.drawingContext.fillStyle = this.settings.fillColor;
        this.drawingContext.fillRect(cell.position.x * squareSize, cell.position.y * squareSize, squareSize, squareSize);

    };

    Univers2D.prototype.drawDeadCell = function (cell) {
        var squareSize = this.settings.squareSize;

        this.drawingContext.clearRect(cell.position.x * squareSize, cell.position.y * squareSize, squareSize, squareSize);

        this.drawingContext.strokeStyle = this.settings.backgroundColor;
        this.drawingContext.strokeRect(cell.position.x * squareSize, cell.position.y * squareSize, squareSize, squareSize);

        this.drawingContext.strokeStyle = this.settings.gridColor;
        this.drawingContext.strokeRect(cell.position.x * squareSize, cell.position.y * squareSize, squareSize, squareSize);
    };

    Univers2D.prototype.add = function (cell) {
        this.state[cell.position] = cell;
        this.drawAliveCell(cell);
    };

    Univers2D.prototype.remove = function (cell) {
        if (this.state[cell.position]) {
            delete this.state[cell.position];
            this.drawDeadCell(cell);
        }
    };

    Univers2D.prototype.zoom = function (type, cell) {
        if (!this.isZoomable(type)) {
            return;
        }

        this.settings.squareSize += type * this.settings.zoomFactor;
        this.width = this.canvas.width / this.settings.squareSize;
        this.height = this.canvas.height / this.settings.squareSize;
        this.translateElements(cell);
        this.draw(true);
    };

    Univers2D.prototype.isZoomable = function (type) {
        if (type < 0) {
            return this.settings.squareSize >= 2 * this.settings.zoomFactor;
        }

        return this.settings.squareSize < (this.canvas.width / 4) && this.settings.squareSize < (this.canvas.height / 4);
    };

    Univers2D.prototype.translateElements = function (cell) {
        var shiftHorizontally = Math.floor(this.width / 2) - cell.position.x;
        var shiftVertically = Math.floor(this.height / 2) - cell.position.y;
        this.state.forEach(function (elem) {
            elem.position.x += shiftHorizontally;
            elem.position.y += shiftVertically;
        });
    };

    Univers2D.prototype.startDrawing = function (cell) {
        this.isDrawing = true;
        this.drawCell(cell);
    };

    Univers2D.prototype.drawingCells = function (cell) {
        if (this.isDrawing) {
            this.drawCell(cell);
            
        }
    };

    Univers2D.prototype.stopDrawing = function (cell) {
        if (this.isDrawing) {
            this.drawCell(cell);
            
        }
        this.save();
        this.isDrawing = false;
    };

    Univers2D.prototype.getSourceCell = function(event, isAlive) {
        return new Cell(
            new Position2D(Math.floor((event.pageX - event.target.offsetLeft) / this.settings.squareSize),
                Math.floor((event.pageY - event.target.offsetTop) / this.settings.squareSize)),
            isAlive);
    };
    Univers2D.prototype.getNoOfNeighbors = function(cell) {
        var length = 0;
        var neighbours = cell.position.neighbours();
        for (var i in neighbours) {
            if (this.state[neighbours[i]] && this.state[neighbours[i]].isAlive) {
                length += 1;
            }
        }
        return length;
    };

    Univers2D.prototype.isAlive = function (cell) {
        return this.state[cell.position] && this.state[cell.position].isAlive;
    };
    Univers2D.prototype.addNewCell = function (data) {
        var cell = new Cell(new Position2D(data.x, data.y), data.isAlive);
        this.drawCell(cell);    
    }
    return Univers2D;
});