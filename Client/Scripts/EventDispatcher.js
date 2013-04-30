/*
    This object is used to trigger events globaly into the system.
    Triggered events (Important!!! this has to be filled in with new events):
    -stopPagination - used to inform the pagination object that it has to ignore scroll events.
    -request:updateAlerts - raised when a request state is acknowledge.
*/
define([], function () {
    GlobalEventClass = function () {
        this.listner = {};
    };
    /*
        Add a listner to the global events list
    */
    GlobalEventClass.prototype.listen = function (nameSpace, name, callback, context) {
        if (!this.listner[name]) {
            this.listner[name] = {};
        }
        this.remove(nameSpace, name);
        this.listner[name][nameSpace] = { callback: callback, context: context };
    };
    /*
        Remove a listner from the glibal events list.
    */
    GlobalEventClass.prototype.remove = function (nameSpace, name) {

        var self = this;
        var clearCallBack = function (nameSpaceToClear, nameToClear) {
            if (self.listner[nameToClear]) {
                var callObjectToDelete = self.listner[nameToClear][nameSpaceToClear];
                if (callObjectToDelete) {
                    callObjectToDelete.context = null;
                    callObjectToDelete.callback = null;
                    delete self.listner[nameToClear][nameSpaceToClear];
                }
            }
        };

        if (name) {
            clearCallBack(nameSpace, name);
            return;
        }

        for (var listnerName in this.listner) {
            clearCallBack(nameSpace, listnerName);
        }

        this.listner[name][nameSpace] = { callback: callback, context: context };
    };

    /*
        Trigger globaly an event.
    */
    GlobalEventClass.prototype.trigger = function (name) {
        for (var namespace in this.listner[name]) {
            var callObject = this.listner[name][namespace];
            if (arguments.length > 1) {
                var args = [];
                for (var i = 1; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }                
                callObject.callback.apply(callObject.context, args);
            } else {
                callObject.callback.apply(callObject.context);
            }

        }
    };
    return new GlobalEventClass();
})


