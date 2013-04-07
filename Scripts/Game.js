(function () {

	var board;
	var worker;
	var ui;
	var isPlaying = false;
	var messages = {
		goToGameInfo: 'See game description',
		start: 'Start evolution from current state',
		pause: 'Pause evolution',
		toHorizontal: 'Switch layout to horizontal',
		toVertical: 'Switch layout to vertical',
		clear: 'Clear state',
		noSupport: 'Unfortunately, this browser cannot run this version of Game of Life. Try to upgrade or access the game from another browser.'
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
			zoomIn: $('#zoomIn'),
			zoomOut: $('#zoomOut'),
			crtBoardEventHandler: togglePopulationMember
		};

		board = new Board(ui.board[0], { squareSize: 18, zoomFactor: 3, gridColor: 'hsla(0, 0%, 0%, 0.2)', fillColor: 'hsla(0, 0%, 0%, 0.4)'});

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

		ui.zoomIn.bind('click', function () {
			activateZoomIn();
		});

		ui.zoomOut.bind('click', function () {
			activateZoomOut();
		});

		/* END event binding */
	});  /* END document ready*/

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

	function start() {
		if (board.state.length == 0)
			return;

		activateGamePlayingState();
		startWorker();
	}

	function stop() {
		activateGameStoppedState();
		worker.terminate();
		board.save();
	}

	function nextStateReceived(event) {
		board.state = event.data.nextState;

		if (board.state.length == 0) { 
			stop();
		}

		board.draw();
		sendMessageToWorker();
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

	function bindBoardClickEvent(handler) {
		ui.board.unbind('click');
		ui.board.bind('click', function (event) {
			handler(event);
		});
		ui.crtBoardEventHandler = handler;
	}

	function getClickSourceCell(event) {
		return new Cell(
			Math.floor((event.pageX - event.target.offsetLeft) / board.settings.squareSize),
			Math.floor((event.pageY - event.target.offsetTop) / board.settings.squareSize));
	}

	function togglePopulationMember(event) {
		var cell = getClickSourceCell(event);
		board.togglePopulationMember(cell);
	}

	function zoomIn(event) {
		var cell = getClickSourceCell(event);
		board.zoom(1, cell);

		if (isPlaying) {
			startWorker();
		}
	}

	function zoomOut(event) {
		var cell = getClickSourceCell(event);
		board.zoom(-1, cell);

		if (isPlaying) {			
			startWorker();
		}
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
			activateGameStoppedState();
			activateDraw();
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
		ui.draw.addClass('active');
		ui.zoomIn.removeClass('active');
		ui.zoomOut.removeClass('active');
		replaceClass(ui.board, 'zooming', 'drawing');
		bindBoardClickEvent(togglePopulationMember);
	}

	function activateZoomIn() {
		ui.zoomIn.addClass('active');
		ui.draw.removeClass('active');
		ui.zoomOut.removeClass('active');
		replaceClass(ui.board, 'drawing', 'zooming');
		bindBoardClickEvent(zoomIn);
	}

	function activateZoomOut() {
		ui.zoomOut.addClass('active');
		ui.draw.removeClass('active');
		ui.zoomIn.removeClass('active');
		replaceClass(ui.board, 'drawing', 'zooming');
		bindBoardClickEvent(zoomOut);
	}

	function activateGamePlayingState() {
		isPlaying = true;
		ui.clear.attr('disabled', 'disabled');
		ui.draw.attr('disabled', 'disabled');
		ui.startOrStop.attr('title', messages.pause);
		ui.board.unbind();
		replaceClass(ui.startOrStop, 'start', 'stop');
	}

	function activateGameStoppedState() {
		isPlaying = false;
		ui.clear.attr('title', messages.clear);
		ui.clear.removeAttr('disabled');
		ui.draw.removeAttr('disabled');
		ui.startOrStop.attr('title', messages.start);
		replaceClass(ui.startOrStop, 'stop', 'start');
		bindBoardClickEvent(ui.crtBoardEventHandler);
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

})(); //END namespace