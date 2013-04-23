function openWebSocket() {
	if (!'WebSocket' in window) {
		console.log('this brosocketer does not support web sockets');
		return;
	}

	try {
		socket = new WebSocket('ws://localhost:4521/');

		socket.onopen = connectionOpened;
		socket.onmessage = messageReceived;
		socket.onerror = errorOccured;
		socket.onclose = connectionClosed;

		console.log('ready state ' + socket.readyState);
		
	} catch (exception) {
		console.log('exception encountered:  ' + exception);
	}
}

function closeWebSocket() {
	socket.close();
}

function connectionOpened() {
	alert('connected to ws://localhost:4521/');
}

function messageReceived(event) {
	var response = JSON.parse(event.data);
	console.log(response.x + " " + response.y + " " + response.isAlive);
	board.drawCell(new Cell(response.x, response.y), response.isAlive);
}

function errorOccured() {
	alert('websocket error occurred');
}

function connectionClosed() {
	alert('connection to ws://localhost:4521/ has been closed');
}

function sendCellInfo(cell, isAlive) {
	if (!socket || socket.readyState != 1)
		return;
	
	var message = JSON.stringify({ x: cell.x, y: cell.y, isAlive: isAlive });
	socket.send(message);
}