function openWebSocket(url) {
	if (!'WebSocket' in window) {
		alert('No support for web sockets.');
		return;
	}

	try {
		socket = new WebSocket(url);
		socket.onopen = connectionOpened;
		socket.onmessage = messageReceived;
		socket.onerror = errorOccured;
		socket.onclose = connectionClosed;
		return socket;
	} catch (exception) {
		alert('Unexpected error occured. WebSocket could not be opened.');
	}
}

function connectionOpened() {
	alert('Connected to ws://localhost:4521/');
}

function messageReceived(event) {
	var response = JSON.parse(event.data);
	var cell = new Cell(response.x, response.y, response.isAlive);
	board.drawCell(cell);
}

function errorOccured() {
	alert('WebSocket error occurred.');
}

function connectionClosed() {
	alert('Connection to ws://localhost:4521/ has been closed');
}

function broadcast(cell) {
	if (!socket || socket.readyState != 1)
		return;
	
	var message = JSON.stringify(cell);
	socket.send(message);
}