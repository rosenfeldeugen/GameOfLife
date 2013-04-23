var worker;

function sendMessageToWorker() {
	worker.postMessage({
		currentState: board.state
	});
}

function startWorker() {
	if (worker) {
		worker.terminate();
	}
	worker = new Worker('Scripts/GameWorker.js');
	worker.onmessage = nextStateReceived;
	sendMessageToWorker();
}

function nextStateReceived(event) {
	board.state = event.data.nextState;
	board.removed = event.data.elementsRemoved;

	if (board.state.length == 0) {
		stop();
	}

	board.draw(false);
	sendMessageToWorker();
}