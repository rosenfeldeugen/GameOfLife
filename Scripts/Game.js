(function() {
	
	var ui = {
		squareSize: 18,
		gridColor: 'hsla(0, 0%, 0%, 0.2)',
		fillColor: 'hsla(0, 0%, 0%, 0.4)',
		
		/* these properties are assigned in the initialization phase */
		elems: null,
		drawingContext: null,
		boardWidth: null,
		boardHeight: null
	};
	
	/* document ready */
	$(function () {
		
		/* page initialization */

		ui.elems = {
			content: $('#content'),
			toolbar: $('#content-toolbar'),
			clear: $('#clear'),
			startOrStop: $('#startOrStop'),
			verticalOrHorizontalBox: $('#verticalOrHorizontalBox'),
			gameArea: $('#content-game'),
			board: $('#board'),
			error: $('#error'),
			info: $('#info')
		};

		initializeControlStates();
		initializeBoard();
		
		/* END page initialization */
		
		/* event binding */

		window.onresize = function () {
			initializeBoard();
		};

		ui.elems.clear.bind('click', function () {
			reset();
		});

		ui.elems.startOrStop.bind('click', function () {
			toggleStartOrStopButtonState();
		});

		ui.elems.verticalOrHorizontalBox.bind('click', function () {
		    toggleBoxOrientation();
		});

		ui.elems.info.bind('click', function () {
			window.open('http://en.wikipedia.org/wiki/Conway%27s_Game_of_Life', '_blank');
		});

		/* END event binding */
	});  /* END document ready*/

    // It seems currentState keeps the state of the board/universe
    // It should be named more descriptive.
	var currentState;

	function reset() {
		localStorage.lastState = currentState = [];
		drawBoard();
	}

	function restore() {
		currentState = localStorage.lastState ? JSON.parse(localStorage.lastState) : [];
		drawBoard();
	}

	var worker;

	function stop() {
		activateGameStoppedState();
		worker.terminate();
		storeLastState();
	}

	function start() {
		if (currentState.length == 0)
			return;

		activateGamePlayingState();

		worker = new Worker('Scripts/GameWorker.js');
		worker.onmessage = nextStateReceived;

		worker.postMessage({
			currentState: currentState,
			speed: 500
		});
	}
	
	function storeLastState() {
		localStorage.lastState = JSON.stringify(currentState);
	}

	function nextStateReceived(event) {
		currentState = event.data.nextState;

		if (currentState.length == 0) { 
			stop();
		}

		drawBoard();
	}

	function togglePopulationMember(event) {
		var cell = new Cell(
			Math.floor((event.pageX - event.target.offsetLeft) / ui.squareSize),
			Math.floor((event.pageY - event.target.offsetTop) / ui.squareSize));
		
		var index = cell.getIndex(currentState);
		if (index == -1) {
			currentState.push(cell);
			drawAliveCell(cell);
		} else {
			currentState.splice(index, 1);
			drawDeadCell(cell);
		}

		storeLastState();
	}

	function toggleBoxOrientation() {
		if (ui.elems.verticalOrHorizontalBox.hasClass('toVertical')) {
		    activateVerticalLayout();
	    } else {
		    activateHorizontalLayout();
	    }
	    
	    initializeBoard();
	}

	function replaceClass(jQueryObject, oldClass, newClass) {
	    jQueryObject.removeClass(oldClass).addClass(newClass);
	}

	function toggleStartOrStopButtonState() {
		if (ui.elems.startOrStop.hasClass('start')) {
			start();
		} else if (ui.elems.startOrStop.hasClass('stop')) {
			stop();
		}
	}

	function bindBoardEvents() {
		ui.elems.board.bind('click', function (event) {
			togglePopulationMember(event);
		});
	}

	function initializeBoard() {
		computeAvailableBoardSpace();
		
		var canvas = ui.elems.board[0]; //get JavaScript object from jQuery object
		canvas.width = ui.boardWidth * ui.squareSize;
		canvas.height = ui.boardHeight * ui.squareSize;
		ui.drawingContext = canvas.getContext('2d');
		
		try {
			restore();
		} catch (e) {
			reset();
		}
	}
	
	function drawBoard() {
		drawGridLines();

		if (currentState && currentState.length > 0) {
			populateGrid();
		}
	}

	function drawGridLines() {
		for (var i = 0; i < ui.boardWidth; i++) {
			for (var j = 0; j < ui.boardHeight; j++) {
				drawDeadCell(new Cell(i, j));
			}
		}
	}

	function populateGrid() {
		for (var i = 0; i < currentState.length; i++) {
			if (currentState[i].x < ui.boardWidth || currentState[i].y < ui.boardHeight) {
				drawAliveCell(currentState[i]);
			}
		}
	}

	function drawAliveCell(cell) {
		ui.drawingContext.fillStyle = ui.fillColor;
		ui.drawingContext.strokeStyle = ui.gridColor;
		
		ui.drawingContext.fillRect(cell.x * ui.squareSize, cell.y * ui.squareSize, ui.squareSize, ui.squareSize);
		ui.drawingContext.stroke();
	}

	function drawDeadCell(cell) {
		ui.drawingContext.strokeStyle = ui.gridColor;
		
		ui.drawingContext.clearRect(cell.x * ui.squareSize, cell.y * ui.squareSize, ui.squareSize, ui.squareSize);
		ui.drawingContext.strokeRect(cell.x * ui.squareSize, cell.y * ui.squareSize, ui.squareSize, ui.squareSize);
		ui.drawingContext.stroke();
	}
	
	function computeAvailableBoardSpace() {
		var horizontalOuterWidth = parseInt(ui.elems.board.css('margin-left')) + parseInt(ui.elems.board.css('border-left-width')) +
			parseInt(ui.elems.board.css('margin-right')) + parseInt(ui.elems.board.css('border-right-width'));
		var verticalOuterWidth = parseInt(ui.elems.board.css('margin-top')) + parseInt(ui.elems.board.css('border-top-width')) +
			parseInt(ui.elems.board.css('margin-bottom')) + parseInt(ui.elems.board.css('border-bottom-width'));

		if (ui.elems.content.hasClass('horizontalBox')) {
			ui.elems.toolbar.width(parseInt(ui.elems.clear.css('width')) +
				parseInt(ui.elems.clear.css('margin-right')) + parseInt(ui.elems.clear.css('margin-left')));
			ui.elems.toolbar.height(window.innerHeight);
			ui.boardWidth = Math.floor((window.innerWidth - ui.elems.toolbar.width() - horizontalOuterWidth)
				/ ui.squareSize);
			ui.boardHeight = Math.floor((window.innerHeight - verticalOuterWidth) / ui.squareSize);
		} else {
			ui.elems.toolbar.width(window.innerWidth);
			ui.elems.toolbar.height(parseInt(ui.elems.clear.css('height')) +
				parseInt(ui.elems.clear.css('margin-top')) + parseInt(ui.elems.clear.css('margin-bottom')));
			ui.boardWidth = Math.floor((window.innerWidth - horizontalOuterWidth) / ui.squareSize);
			ui.boardHeight = Math.floor((window.innerHeight - ui.elems.toolbar.height() - verticalOuterWidth)
                / ui.squareSize);
		}
	}

	var messages = {
		goToGameInfo: 'See game description',
		start: 'Start evolution from current state',
		pause: 'Pause evolution',
		toHorizontal: 'Switch layout to horizontal',
		toVertical: 'Switch layout to vertical',
		clear: 'Clear board',
		noSupport: 'Unfortunately, this browser cannot run this version of Game of Life. Try to upgrade or access the game from another browser.'
	};
	
	function initializeControlStates() {
		if (window.Worker) {
			activateHorizontalLayout();
			activateGameStoppedState();
			ui.elems.error.hide();
		} else {
			ui.elems.error.text(messages.noSupport);
			ui.elems.error.show();
			$('button').attr('disabled', 'disabled');
			ui.elems.info.removeAttr('disabled');
		}
		ui.elems.info.attr('title', messages.goToGameInfo);
	}

	function activateGamePlayingState() {
		ui.elems.clear.attr('disabled', 'disabled');
		ui.elems.startOrStop.attr('title', messages.pause);
		ui.elems.board.unbind();
		replaceClass(ui.elems.startOrStop, 'start', 'stop');
	}

	function activateGameStoppedState() {
		ui.elems.clear.attr('title', messages.clear);
		ui.elems.clear.removeAttr('disabled');
		ui.elems.startOrStop.attr('title', messages.start);
		replaceClass(ui.elems.startOrStop, 'stop', 'start');
		bindBoardEvents();
	}

	function activateHorizontalLayout() {
		replaceClass(ui.elems.verticalOrHorizontalBox, 'toHorizontal', 'toVertical');
		replaceClass(ui.elems.content, 'verticalBox', 'horizontalBox');
		replaceClass(ui.elems.toolbar, 'horizontalToolbar', 'verticalToolbar');
		ui.elems.verticalOrHorizontalBox.attr('title', messages.toVertical);
	}

	function activateVerticalLayout() {
		replaceClass(ui.elems.verticalOrHorizontalBox, 'toVertical', 'toHorizontal');
		replaceClass(ui.elems.content, 'horizontalBox', 'verticalBox');
		replaceClass(ui.elems.toolbar, 'verticalToolbar', 'horizontalToolbar');
		ui.elems.verticalOrHorizontalBox.attr('title', messages.toHorizontal);
	}

})(); //END namespace