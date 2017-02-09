const currentState = require('./current-state');
const flyd = require('flyd');

module.exports = function (state, stream$) {
    const timeline = new Map();
    const time$ = flyd.stream();

    const result$ = flyd.combine((time$, stream$) => {
        if (time$() !== undefined) {
            return;
        }

        const update = stream$();

        if (update.time) {
            return update;
        }

        const snapshot = Object.assign({
            state: currentState(state),
            time: Date.now()
        }, update);

        timeline.set(snapshot.time, snapshot);

        return snapshot;
    }, [time$, stream$]);

    result$.time$ = time$;

    return flyd.immediate(result$);
};
