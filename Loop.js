var Loop = (function() {
    var updaters = [];
    var cntUpdaters = 0;
    var state = {
        dt: 0,
        t: 0
    };
    var isRunning = true;

    return {
        addUpdater: function(f) {
            updaters.push({
                update: f
            });
            cntUpdaters++;
            return cntUpdaters - 1;
        },

        removeUpdater: function(index) {
            updaters.splice(index, 1);
        },

        start: function(t) {
            requestAnimationFrame(Loop.start);

            if (isRunning) {
                Loop.update(t);
            }
        },

        update: function(t) {
            // timer
            //Timer.update();

            //state.dt = Timer.dt;
            state.t = t;

            for (var i = 0, l = updaters.length; i < l; i++) {
                updaters[i].update(state);
            }
        },

        pause: function() {
            isRunning = false;
        },
        resume: function() {
            isRunning = true;
        }
    };
})();
