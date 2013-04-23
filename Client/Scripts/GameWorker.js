importScripts('CellularAutomata.js');

var automata;

onmessage = function (event) {
	automata = new CellularAutomata(event.data.currentState);
	setTimeout(tick, 400);
};

function tick() {
	automata.tick();
	postMessage({ nextState: automata.state, elementsRemoved: automata.elementsRemoved });
}