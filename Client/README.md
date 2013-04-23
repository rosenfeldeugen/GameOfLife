Conway's Game of Life
---------------------

This is an implementation of Conway's Game of Life (see http://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) as a HTML 5 web application.

Current Implementation
----------------------

As the description says, the game space is infinite. There is an initial board which acts as kind of a viewport on the game space. You can use the zoom in and zoom out in order to view more/less from the game space or to navigate in it. The clicked portion will be always in the central zone of the board.

You may draw anything on board by choosing the pencil from the menu and dragging lines with the mouse onto the board. Erasing works in the same way as drawing, but for this you need to choose the pencil which is crossed. After you are happy with the seed (i.e., the state on the board), the evolution can be started. At any moment, it can be stopped. While the automata is evolving, it is not possible to toggle the states of the grid cells.

In order to see how the game in multi-player mode works, you need to run the Server project, which is a console application. Once started, all the clients will be connected to the same server and will see what the all the others draw.

Some further next steps
-----------------------

- Making the multiplayer mode fully functional

- Warning about elements which are outside of the viewport

- Different coloring of conencted elements

- Step by step running

- Game statistics

- Save/load patterns

- Offline operation mode

- Performance tuning & code maintenane (getting rid of smells)

Browser Support
-----------------------	

This application only runs in browsers with canvas, local storage and web workers support (minimum version: IE 10, Firefox 3.5, Chrome 3, Safari 4, Opera 10.6).	

If you are using Chrome, you need to run the application from a web server so that the cells on the board can evolve.