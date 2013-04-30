define(["jquery", "CellularAutomata","EventDispatcher"], function ($, CellularAutomata, eventDispatcher) {
    var worker;
    var StateGeneration = function (universe) {
        this.universe = universe;
    };
    StateGeneration.prototype = {
        worker: null,
        automata:null,
        sendMessageToWorker: function() {
            worker.postMessage({
                currentState: board.state
            });
        },

        startWorker: function() {
            if (this.worker) {
                this.worker.terminate();
            }
            
            //Dezactivat momentan pentru a putea face debug in chrome.
            //worker = new Worker('Scripts/GameWorker.js');
            //worker.onmessage = nextStateReceived;
            //sendMessageToWorker();
            this.automata = new CellularAutomata(this.universe);
            this.automata.isStarted = true;
            var self = this;
            window.setTimeout(function () {
                self.tick();
            }, 300);
        },

        stopWorker: function() {
            if (this.automata) {
                this.automata.isStarted = false;
            }

            if (worker) worker.terminate();
        },

        tick: function() {
            this.automata.tick();
            var self = this;
            this.nextStateReceived({ nextState: this.automata.state, elementsRemoved: this.automata.elementsRemoved });
            if (this.automata.isStarted) {
                window.setTimeout(function () {
                    self.tick();
                }, 300);
            }

        },
        nextStateReceived: function (data) {
            eventDispatcher.trigger("State:newState", data);
        }
    };
    return StateGeneration;
})
