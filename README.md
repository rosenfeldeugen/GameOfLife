Conway's Game of Life
---------------------

This is an implementation of Conway's Game of Life (see http://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) as a HTML 5 web application.

Current Implementation
----------------------

As the description says, the game space is infinite. There is an initial board which acts as kind of a viewport on the game space. You can use the zoom in and zoom out in order to view more/less from the game space or to navigate in it. The clicked portion will be always in the central zone of the board.

The user can select/deselect each cell in the grid to be alive by clicking them. After (s)he is happy with the seed (i.e., the state on the board), the evolution can be started. At any moment, it can be stopped. While the automata is evolving, it is not possible to toggle the state of the grid cells.

This application only runs in browsers with canvas, local storage and web workers support (minimum version: IE 10, Firefox 3.5, Chrome 3, Safari 4, Opera 10.6).	

Some further next steps
-----------------------

- Mark outside elements (which are not visible in the current state of the board)

- Quick drawing

- Multiplayer mode using web sockets

- Step by step running

- Save/load pattern

- Help

- Offline operation mode

- Different coloring of conencted elements

- Game statistics

	
