importScripts('CellularAutomata.js');

var automata;

onmessage = function (event) {
	automata = new CellularAutomata(event.data.currentState);
	setInterval(tick, event.data.speed);
};

function tick() {
	automata.tick();
	postMessage({ nextState: automata.state });
}