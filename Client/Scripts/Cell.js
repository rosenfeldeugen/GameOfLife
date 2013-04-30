/*
* Cell
*/
define([], function () {
    var Cell = function (position, isAlive) {
        this.position = position;
        this.isAlive = isAlive;
    };
    return Cell;
})
