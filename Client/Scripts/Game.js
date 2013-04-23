var board;
var socket;

(function ($) {
	
	var ui;
	var socket;
	var crtControlStateFunction;
	var isEvolving = false;
	var messages = {
		goToGameInfo: 'See game description',
		start: 'Start evolution from current state',
		pause: 'Pause evolution',
		toHorizontal: 'Switch layout to horizontal',
		toVertical: 'Switch layout to vertical',
		clear: 'Clear state',
		noSupport: 'Unfortunately, your browser cannot run this version of Game of Life. Try to upgrade or access the game from another browser.'
	};

	/* document ready */
	$(function () {
		
		/* page initialization */
		ui = {
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
		};

		board = new Board(ui.board[0],
			{
				squareSize: 18, 
				zoomFactor: 3, 
				gridColor: 'hsla(0, 0%, 0%, 0.3)', 
				fillColor: 'hsla(0, 0%, 0%, 0.4)', 
				backgroundColor: '#DEFA7C'
			});

		initializeControlStates();
		adjustElementsToAvailableSpace();
		
		/* END page initialization */
		
		/* event binding */

		window.onresize = function () {
			adjustElementsToAvailableSpace();
		};

		ui.clear.bind('click', function () {
			board.reset();
		});

		ui.startOrStop.bind('click', function () {
			toggleStartOrStopButtonState();
		});

		ui.verticalOrHorizontalBox.bind('click', function () {
			toggleBoxOrientation();
		});

		ui.info.bind('click', function () {
			window.open('http://en.wikipedia.org/wiki/Conway%27s_Game_of_Life', '_blank');
		});

		ui.draw.bind('click', function () {
			activateDraw();
		});

		ui.erase.bind('click', function () {
			activateErase();
		});

		ui.zoomIn.bind('click', function () {
			activateZoomIn();
		});

		ui.zoomOut.bind('click', function () {
			activateZoomOut();
		});

		ui.multiUser.bind('click', function () {
			toggleMultiUserState();
		});
		/* END event binding */
	});  /* END document ready*/

	function start() {
		if (board.state.length == 0)
			return;

		activateEvolutionState();
		startWorker();
	}

	function stop() {
		activateEvolutionStoppedState();
		worker.terminate();
		board.save();
	}

	function toggleBoxOrientation() {
		if (ui.verticalOrHorizontalBox.hasClass('toVertical')) {
			activateVerticalLayout();
		} else {
			activateHorizontalLayout();
		}
		
		adjustElementsToAvailableSpace();
	}

	function replaceClass(jQueryObject, oldClass, newClass) {
		jQueryObject.removeClass(oldClass).addClass(newClass);
	}

	function toggleStartOrStopButtonState() {
		if (ui.startOrStop.hasClass('start')) {
			start();
		} else if (ui.startOrStop.hasClass('stop')) {
			stop();
		}
	}

	function toggleMultiUserState() {
		if (ui.multiUser.hasClass('active')) {
			turnOffMultiUserMode();
		} else {
			turnOnMultiUserMode();
		}
	}
	
	function turnOnMultiUserMode() {
		ui.multiUser.addClass('active');
		socket = openWebSocket('ws://localhost:4521/');
	}

	function turnOffMultiUserMode() {
		ui.multiUser.removeClass('active');
		socket.close();
	}

	function bindBoardClickEvent(handler) {
		ui.board.unbind();
		ui.board.bind('click', function (event) {
			handler(event);
		});
		ui.crtBoardEventHandler = handler;
	}

	function bindDrawingHandler(isDrawing) {

		ui.board.bind('mousedown', function (event) {
			board.startDrawing(getSourceCell(event, isDrawing));
		});

		ui.board.bind('mouseup', function (event) {
			board.stopDrawing(getSourceCell(event, isDrawing));
		});

		ui.board.bind('mouseout', function(event) {
			board.stopDrawing(getSourceCell(event, isDrawing));
		});

		ui.board.bind('mousemove', function (event) {
			board.drawingCells(getSourceCell(event, isDrawing));
		});
	}

	function zoomIn(event) {
		var cell = getSourceCell(event);
		board.zoom(1, cell);

		if (isEvolving) {
			startWorker();
		}
	}

	function zoomOut(event) {
		var cell = getSourceCell(event);
		board.zoom(-1, cell);

		if (isEvolving) {			
			startWorker();
		}
	}
	
	function getSourceCell(event, isAlive) {
		return new Cell(
			Math.floor((event.pageX - event.target.offsetLeft) / board.settings.squareSize),
			Math.floor((event.pageY - event.target.offsetTop) / board.settings.squareSize),
			isAlive);
	}

	function adjustElementsToAvailableSpace() {
		var horizontalOuterWidth = parseInt(ui.board.css('margin-left')) + parseInt(ui.board.css('border-left-width')) +
			parseInt(ui.board.css('margin-right')) + parseInt(ui.board.css('border-right-width'));
		var verticalOuterWidth = parseInt(ui.board.css('margin-top')) + parseInt(ui.board.css('border-top-width')) +
			parseInt(ui.board.css('margin-bottom')) + parseInt(ui.board.css('border-bottom-width'));

		if (ui.content.hasClass('horizontalBox')) {
			ui.toolbar.width(parseInt(ui.clear.css('width')) +
				parseInt(ui.clear.css('margin-right')) + parseInt(ui.clear.css('margin-left')));
			ui.toolbar.height(window.innerHeight);
			board.adjustSize(Math.floor((window.innerWidth - ui.toolbar.width() - horizontalOuterWidth) / board.settings.squareSize),
				Math.floor((window.innerHeight - verticalOuterWidth) / board.settings.squareSize));
		} else {
			ui.toolbar.width(window.innerWidth);
			ui.toolbar.height(parseInt(ui.clear.css('height')) +
				parseInt(ui.clear.css('margin-top')) + parseInt(ui.clear.css('margin-bottom')));
			board.adjustSize(Math.floor((window.innerWidth - horizontalOuterWidth) / board.settings.squareSize),
				Math.floor((window.innerHeight - ui.toolbar.height() - verticalOuterWidth) / board.settings.squareSize));
		}
	}

	function initializeControlStates() {
		if (window.Worker) {
			activateHorizontalLayout();
			activateDraw();
			activateEvolutionStoppedState();
			ui.error.hide();
		} else {
			ui.error.text(messages.noSupport);
			ui.error.show();
			$('button').attr('disabled', 'disabled');
			ui.info.removeAttr('disabled');
		}
		ui.info.attr('title', messages.goToGameInfo);
	}

	function activateDraw() {
		ui.board.unbind();
		bindDrawingHandler(true);

		if (crtControlStateFunction == activateDraw)
			return;
		
		crtControlStateFunction = activateDraw;
		ui.draw.addClass('active');
		ui.erase.removeClass('active');
		ui.zoomIn.removeClass('active');
		ui.zoomOut.removeClass('active');
		replaceClass(ui.board, 'zooming', 'drawing');
	}

	function activateErase() {
		ui.board.unbind();
		bindDrawingHandler(false);
		
		if (crtControlStateFunction == activateErase)
			return;

		crtControlStateFunction = activateErase;
		ui.draw.removeClass('active');
		ui.erase.addClass('active');
		ui.zoomIn.removeClass('active');
		ui.zoomOut.removeClass('active');
		replaceClass(ui.board, 'zooming', 'drawing');
	}

	function activateZoomIn() {
		ui.board.unbind();
		bindBoardClickEvent(zoomIn);
		
		if (crtControlStateFunction == activateZoomIn)
			return;

		crtControlStateFunction = activateZoomIn;
		ui.zoomIn.addClass('active');
		ui.draw.removeClass('active');
		ui.erase.removeClass('active');
		ui.zoomOut.removeClass('active');
		replaceClass(ui.board, 'drawing', 'zooming');
	}

	function activateZoomOut() {
		ui.board.unbind();
		bindBoardClickEvent(zoomOut);
		
		if (crtControlStateFunction == activateZoomOut)
			return;

		crtControlStateFunction = activateZoomOut;
		ui.zoomOut.addClass('active');
		ui.draw.removeClass('active');
		ui.erase.removeClass('active');
		ui.zoomIn.removeClass('active');
		replaceClass(ui.board, 'drawing', 'zooming');
	}

	function activateEvolutionState() {
		if (crtControlStateFunction != activateZoomIn && crtControlStateFunction != activateZoomOut) {
			ui.board.unbind();
		}
		
		isEvolving = true;
		ui.clear.attr('disabled', 'disabled');
		ui.draw.attr('disabled', 'disabled');
		ui.erase.attr('disabled', 'disabled');
		ui.startOrStop.attr('title', messages.pause);
		replaceClass(ui.startOrStop, 'start', 'stop');
	}

	function activateEvolutionStoppedState() {
		isEvolving = false;
		ui.clear.attr('title', messages.clear);
		ui.clear.removeAttr('disabled');
		ui.draw.removeAttr('disabled');
		ui.erase.removeAttr('disabled');
		ui.startOrStop.attr('title', messages.start);
		replaceClass(ui.startOrStop, 'stop', 'start');
		crtControlStateFunction();
	}

	function activateHorizontalLayout() {
		replaceClass(ui.verticalOrHorizontalBox, 'toHorizontal', 'toVertical');
		replaceClass(ui.content, 'verticalBox', 'horizontalBox');
		replaceClass(ui.toolbar, 'horizontalToolbar', 'verticalToolbar');
		ui.verticalOrHorizontalBox.attr('title', messages.toVertical);
	}

	function activateVerticalLayout() {
		replaceClass(ui.verticalOrHorizontalBox, 'toVertical', 'toHorizontal');
		replaceClass(ui.content, 'horizontalBox', 'verticalBox');
		replaceClass(ui.toolbar, 'verticalToolbar', 'horizontalToolbar');
		ui.verticalOrHorizontalBox.attr('title', messages.toHorizontal);
	}

})(jQuery); //END namespace