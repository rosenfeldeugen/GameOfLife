define(["EventDispatcher"], function (eventDispatcher) {
    var Socket = function () {
        this.socket = null;
    };

    Socket.prototype = {
        openWebSocket: function(url) {
            if (!'WebSocket' in window) {
                alert('No support for web sockets.');
                return;
            }

            try {
                this.socket = new WebSocket(url);
                this.socket.onopen = connectionOpened;
                this.socket.onmessage = messageReceived;
                this.socket.onerror = errorOccured;
                this.socket.onclose = connectionClosed;
                return true;
            } catch(exception) {
                alert('Unexpected error occured. WebSocket could not be opened.');
                return false;
            }
        },
        connectionOpened: function() {
            alert('Connected to ws://localhost:4521/');
        },
        messageReceived: function(event) {
            var response = JSON.parse(event.data);
            eventDispatcher.trigger("Socket:newData", response);
            
        },
        errorOccured: function() {
            alert('WebSocket error occurred.');
        },
        connectionClosed: function() {
            alert('Connection to ws://localhost:4521/ has been closed');
        },
        broadcast: function(cell) {
            if (!this.socket || this.socket.readyState != 1)
                return;

            var message = JSON.stringify(cell);
            this.socket.send(message);
        },
        close:function(){
            if (!this.socket || this.socket.readyState != 1)
                return;
            this.socket.close();
            this.socket = null;
        }
    };
    return Socket;
});

