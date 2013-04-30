/*
* CellularAutomata
*/
define(["Cell"], function (Cell) {

    var CellularAutomata = function(universe) {
        this.universe = universe;
    };

    CellularAutomata.prototype.tick = function() {
        var nextState = [];
        
        for (var cellIndex in this.universe.state) {
            var cell = this.universe.state[cellIndex];
            var neighbors = cell.position.neighbours();
            neighbors.push(cell.position);
            for (var i in neighbors) {
                var newCell = new Cell(neighbors[i], true);
                var numberOfneighbors = this.universe.getNoOfNeighbors(newCell);
                if (numberOfneighbors == 3 || numberOfneighbors == 2 && this.universe.isAlive(newCell)) {
                    nextState[newCell.position] = newCell;
                } else if (this.universe.state[newCell.position]) {
                    this.universe.removed.push(newCell);
                }
            }
        }
        this.universe.state = nextState;
    };
    return CellularAutomata;
});



