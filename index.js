const assert = require('assert');
const {createState, currentState} = require('./lib/state');
const createTimeTravel = require('./lib/time-travel');

function mundaka(opts) {
    assert.equal(typeof opts, 'object', 'mundaka: options must be an object.');
    assert.equal(typeof opts.state, 'object', 'mundaka: the state must be an object');
    assert.ok(opts.onCreateEachStream === undefined || typeof opts.onCreateEachStream === 'function', 'mundaka: onCreateEachStream must be undefined or a function');
    assert.ok(opts.timeTravel === undefined || typeof opts.timeTravel === 'boolean', 'mundaka: timeTravel must be undefined or boolean');

    let {state, setState, stream$} = createState(opts);

    if (opts.timeTravel) {
        stream$ = createTimeTravel(state, stream$);
    }

    stream$.state = state;
    stream$.currentState = () => currentState(state);
    stream$.setState = setState;

    return stream$;
}

module.exports = mundaka;
