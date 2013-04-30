define(["jquery", 'StateGeneration', "EventDispatcher", "WebSocket"], function ($, StateGeneration, eventDispatcher, Socket) {
    var game = function(Universe) {
        this.Universe = Universe;
    };
    game.prototype ={
        ui: {
            content: $('#content'),
            toolbar: $('#content-toolbar'),
            clear: $('#clear'),
            startOrStop: $('#startOrStop'),
            verticalOrHorizontalBox: $('#verticalOrHorizontalBox'),
            gameArea: $('#content-game'),
            board: $('#board'),
            error: $('#error'),
            info: $('#info'),
            draw: $('#draw'),
            erase: $('#erase'),
            zoomIn: $('#zoomIn'),
            zoomOut: $('#zoomOut'),
            multiUser: $('#multiUser')
        },
        board: null,
        socket: null,
        stateGeneration:null,
        crtControlStateFunction: null,
        isEvolving: false,
        messages: {
            goToGameInfo: 'See game description',
            start: 'Start evolution from current state',
            pause: 'Pause evolution',
            toHorizontal: 'Switch layout to horizontal',
            toVertical: 'Switch layout to vertical',
            clear: 'Clear state',
            noSupport: 'Unfortunately, your browser cannot run this version of Game of Life. Try to upgrade or access the game from another browser.'
        },
        onNewState:function(data) {
            //this.board.state = data.nextState;
            //this.board.removed = data.elementsRemoved;
            this.board.draw(false);
        },
        onSocketData: function (socketData) {
            this.board.addNewCell(socketData);
        },
        initialize: function() {
            /* page initialization */
            
            eventDispatcher.listen("Game", "State:newState", this.onNewState, this);
            eventDispatcher.listen("Game", "Socket:newData", this.onSocketData, this);
            this.socket = new Socket();
            this.board = new this.Universe(this.ui.board[0],
                {
                    squareSize: 18,
                    zoomFactor: 3,
                    gridColor: 'hsla(0, 0%, 0%, 0.3)',
                    fillColor: 'hsla(0, 0%, 0%, 0.4)',
                    backgroundColor: '#DEFA7C'
                });
            
            this.stateGeneration = new StateGeneration(this.board);
            this.initializeControlStates();
            this.adjustElementsToAvailableSpace();

            /* END page initialization */

            /* event binding */
            var self = this;
            window.onresize = function() {
                self.adjustElementsToAvailableSpace();
            };

            this.ui.clear.bind('click', function() {
                self.board.reset();
            });

            this.ui.startOrStop.bind('click', function () {
                self.toggleStartOrStopButtonState();
            });

            this.ui.verticalOrHorizontalBox.bind('click', function () {
                self.toggleBoxOrientation();
            });

            this.ui.info.bind('click', function () {
                window.open('http://en.wikipedia.org/wiki/Conway%27s_Game_of_Life', '_blank');
            });

            this.ui.draw.bind('click', function () {
                self.activateDraw();
            });

            this.ui.erase.bind('click', function () {
                self.activateErase();
            });

            this.ui.zoomIn.bind('click', function () {
                self.activateZoomIn();
            });

            this.ui.zoomOut.bind('click', function () {
                self.activateZoomOut();
            });

            this.ui.multiUser.bind('click', function () {
                self.toggleMultiUserState();
            });
        },
        start: function() {
            this.activateEvolutionState();
            this.stateGeneration.startWorker();
        },

        stop: function() {
            this.activateEvolutionStoppedState();
            this.stateGeneration.stopWorker();
            this.board.save();
        },

        toggleBoxOrientation: function() {
            if (this.ui.verticalOrHorizontalBox.hasClass('toVertical')) {
                this.activateVerticalLayout();
            } else {
                this.activateHorizontalLayout();
            }
            this.adjustElementsToAvailableSpace();
        },

        replaceClass: function(jQueryObject, oldClass, newClass) {
            jQueryObject.removeClass(oldClass).addClass(newClass);
        },

        toggleStartOrStopButtonState: function() {
            if (this.ui.startOrStop.hasClass('start')) {
                this.start();
            } else if (this.ui.startOrStop.hasClass('stop')) {
                this.stop();
            }
        },

        toggleMultiUserState: function() {
            if (this.ui.multiUser.hasClass('active')) {
                this.turnOffMultiUserMode();
            } else {
                this.turnOnMultiUserMode();
            }
        },

        turnOnMultiUserMode: function() {
            this.ui.multiUser.addClass('active');
            this.socket.openWebSocket('ws://localhost:4521/');
        },

        turnOffMultiUserModem: function() {
            this.ui.multiUser.removeClass('active');
            this.socket.close();
        },

        bindBoardClickEvent: function(handler, source) {
            this.ui.board.unbind();
            var self = this;
            this.ui.board.bind('click', function (event) {
                handler.call(source,event);
            });
            this.ui.crtBoardEventHandler = handler;
        },

        bindDrawingHandler: function(isDrawing) {
            var self = this;
            this.ui.board.bind('mousedown', function (event) {
                var cell = self.getSourceCell(event, isDrawing);
                self.board.startDrawing(cell);
                self.broadcast(cell);
            });

            this.ui.board.bind('mouseup', function (event) {
                self.board.stopDrawing(self.getSourceCell(event, isDrawing));
            });

            this.ui.board.bind('mouseout', function (event) {
                var cell = self.getSourceCell(event, isDrawing);
                self.board.stopDrawing(cell);
                self.broadcast(cell);
            });

            this.ui.board.bind('mousemove', function (event) {
                var cell = self.getSourceCell(event, isDrawing);
                self.board.drawingCells(cell);
                self.broadcast(cell);
            });
        },
        broadcast:function(cell) {
            this.socket.broadcast(cell);
        },
        zoomIn: function(event) {
            var cell = this.getSourceCell(event);
            this.board.zoom(1, cell);

            if (this.isEvolving) {
                this.startWorker();
            }
        },

        zoomOut: function(event) {
            var cell = this.getSourceCell(event);
            this.board.zoom(-1, cell);

            if (this.isEvolving) {
                this.startWorker();
            }
        },

        getSourceCell: function(event, isAlive) {
            return this.board.getSourceCell(event, isAlive);
        },

        adjustElementsToAvailableSpace: function() {
            var horizontalOuterWidth = parseInt(this.ui.board.css('margin-left')) + parseInt(this.ui.board.css('border-left-width')) +
                parseInt(this.ui.board.css('margin-right')) + parseInt(this.ui.board.css('border-right-width'));
            var verticalOuterWidth = parseInt(this.ui.board.css('margin-top')) + parseInt(this.ui.board.css('border-top-width')) +
                parseInt(this.ui.board.css('margin-bottom')) + parseInt(this.ui.board.css('border-bottom-width'));

            if (this.ui.content.hasClass('horizontalBox')) {
                this.ui.toolbar.width(parseInt(this.ui.clear.css('width')) +
                    parseInt(this.ui.clear.css('margin-right')) + parseInt(this.ui.clear.css('margin-left')));
                this.ui.toolbar.height(window.innerHeight);
                this.board.adjustSize(Math.floor((window.innerWidth - this.ui.toolbar.width() - horizontalOuterWidth) / this.board.settings.squareSize),
                    Math.floor((window.innerHeight - verticalOuterWidth) / this.board.settings.squareSize));
            } else {
                this.ui.toolbar.width(window.innerWidth);
                this.ui.toolbar.height(parseInt(this.ui.clear.css('height')) +
                    parseInt(this.ui.clear.css('margin-top')) + parseInt(this.ui.clear.css('margin-bottom')));
                this.board.adjustSize(Math.floor((window.innerWidth - horizontalOuterWidth) / this.board.settings.squareSize),
                    Math.floor((window.innerHeight - this.ui.toolbar.height() - verticalOuterWidth) / this.board.settings.squareSize));
            }
        },

        initializeControlStates: function() {
            if (window.Worker) {
                this.activateHorizontalLayout();
                this.activateDraw();
                this.activateEvolutionStoppedState();
                this.ui.error.hide();
            } else {
                this.ui.error.text(messages.noSupport);
                this.ui.error.show();
                $('button').attr('disabled', 'disabled');
                this.ui.info.removeAttr('disabled');
            }
            this.ui.info.attr('title', this.messages.goToGameInfo);
        },

        activateDraw: function() {
            this.ui.board.unbind();
            this.bindDrawingHandler(true);

            if (this.crtControlStateFunction == this.activateDraw)
                return;

            this.crtControlStateFunction = this.activateDraw;
            this.ui.draw.addClass('active');
            this.ui.erase.removeClass('active');
            this.ui.zoomIn.removeClass('active');
            this.ui.zoomOut.removeClass('active');
            this.replaceClass(this.ui.board, 'zooming', 'drawing');
        },

        activateErase: function() {
            this.ui.board.unbind();
            this.bindDrawingHandler(false);

            if (this.crtControlStateFunction == this.activateErase)
                return;

            this.crtControlStateFunction = this.activateErase;
            this.ui.draw.removeClass('active');
            this.ui.erase.addClass('active');
            this.ui.zoomIn.removeClass('active');
            this.ui.zoomOut.removeClass('active');
            this.replaceClass(this.ui.board, 'zooming', 'drawing');
        },

        activateZoomIn: function() {
            this.ui.board.unbind();
            this.bindBoardClickEvent(this.zoomIn, this);

            if (this.crtControlStateFunction == this.activateZoomIn)
                return;

            this.crtControlStateFunction = this.activateZoomIn;
            this.ui.zoomIn.addClass('active');
            this.ui.draw.removeClass('active');
            this.ui.erase.removeClass('active');
            this.ui.zoomOut.removeClass('active');
            this.replaceClass(this.ui.board, 'drawing', 'zooming');
        },

        activateZoomOut: function() {
            this.ui.board.unbind();
            this.bindBoardClickEvent(this.zoomOut, this);

            if (this.crtControlStateFunction == this.activateZoomOut)
                return;

            this.crtControlStateFunction = this.activateZoomOut;
            this.ui.zoomOut.addClass('active');
            this.ui.draw.removeClass('active');
            this.ui.erase.removeClass('active');
            this.ui.zoomIn.removeClass('active');
            this.replaceClass(this.ui.board, 'drawing', 'zooming');

        },

        activateEvolutionState: function() {
            if (this.crtControlStateFunction != this.activateZoomIn && this.crtControlStateFunction != this.activateZoomOut) {
                this.ui.board.unbind();
            }

            this.isEvolving = true;
            this.ui.clear.attr('disabled', 'disabled');
            this.ui.draw.attr('disabled', 'disabled');
            this.ui.erase.attr('disabled', 'disabled');
            this.ui.startOrStop.attr('title', this.messages.pause);
            this.replaceClass(this.ui.startOrStop, 'start', 'stop');
        },

        activateEvolutionStoppedState: function() {
            this.isEvolving = false;
            this.ui.clear.attr('title', this.messages.clear);
            this.ui.clear.removeAttr('disabled');
            this.ui.draw.removeAttr('disabled');
            this.ui.erase.removeAttr('disabled');
            this.ui.startOrStop.attr('title', this.messages.start);
            this.replaceClass(this.ui.startOrStop, 'stop', 'start');
            this.crtControlStateFunction();
        },

        activateHorizontalLayout: function() {
            this.replaceClass(this.ui.verticalOrHorizontalBox, 'toHorizontal', 'toVertical');
            this.replaceClass(this.ui.content, 'verticalBox', 'horizontalBox');
            this.replaceClass(this.ui.toolbar, 'horizontalToolbar', 'verticalToolbar');
            this.ui.verticalOrHorizontalBox.attr('title', this.messages.toVertical);
        },

        activateVerticalLayout: function() {
            replaceClass(this.ui.verticalOrHorizontalBox, 'toVertical', 'toHorizontal');
            replaceClass(this.ui.content, 'horizontalBox', 'verticalBox');
            replaceClass(this.ui.toolbar, 'verticalToolbar', 'horizontalToolbar');
            ui.verticalOrHorizontalBox.attr('title', this.messages.toHorizontal);
        },
    };
    return game;
});

