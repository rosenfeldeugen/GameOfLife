var socket;

function openWebSocket() {
	if (!'WebSocket' in window) {
		console.log('this brosocketer does not support web sockets');
		return;
	}

	try {
		socket = new WebSocket('ws://echo.websocket.org/');

		socket.onopen = connectionOpened;
		socket.onmessage = messageReceived;
		socket.onerror = errorOccured;
		socket.onclose = connectionClosed;

		console.log('ready state ' + socket.readyState);
		
	} catch (exception) {
		console.log('exception encountered:  ' + exception);
	}
	
}

function connectionOpened() {
	console.log('connecion opened');
}

function messageReceived(event) {
	console.log('message: ' + event.data);
}

function errorOccured() {
	console.log('error');
}

function connectionClosed() {
	console.log('connection closed');
}

function getJsonMessage(action, message) {
	var jsonMessage = '{"Action":"' + action + '","Message":"' + message + '"}';
	return jsonMessage;
}