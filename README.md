This is an implementation of Conway`s Game of Life (see http://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) as a HTML 5 web application.

Current Implementation:

As the description says, the game space is infinite. Although we have a fix sized board with no possibility yet to go outside of its borders, cells can also live beyond the space displayed to us.

The user can select/deselect each cell in the grid to be alive by clicking them. After (s)he is happy with the seed (i.e., the state on the board), the evolution can be started. At any moment, it can be stopped. While the automata is evolving, it is not possible to toggle the state of the grid cells.

This application only runs in browsers with canvas, local storage and web workers support (minimum version: IE 10, Firefox 3.5, Chrome 3, Safari 4, Opera 10.6).	

Some further next steps:

- Zoom in/out and scroll in order to show outside elements

- Step by step running

- Mark outside elements

- Quick drawing

- Save/load pattern

- Help

- Offline operation mode

- Different coloring of conencted elements

- Game statistics

	
