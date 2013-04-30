/**
 * Main module of the application
 * Configure the require library and creates the main view of the application
 * 
 *  @module main
 */
require.config({
    paths: {
        jquery: 'http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min',
        game: 'Game',
        Universe: "Universe2D"
    },
    shim: {
        game: {

            // Depends on underscore/lodash and jQuery
            deps: ["jquery"],

            // Exports the global window.Backbone object
            exports: "Game"
        }
    }
});

/**
 * Load the main view
 * 
 */
require(["jquery", "game", "Universe"], function ($, Game, Universe) {
    $(function () {
        var game = new Game(Universe);
        $(function () { game.initialize(); });
    });
});
