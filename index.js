const assert = require('assert');
const {createState, currentState} = require('./lib/state');

function mundaka(opts) {
    assert.equal(typeof opts, 'object', 'mundaka: options must be an object.');
    assert.equal(typeof opts.state, 'object', 'mundaka: the state must be an object');
    assert.ok(opts.onCreateEachStream === undefined || typeof opts.onCreateEachStream === 'function', 'mundaka: onCreateEachStream must be undefined or a function');

    let {state, setState, stream$} = createState(opts);

    stream$.state = state;
    stream$.currentState = () => currentState(state);
    stream$.setState = setState;

    return stream$;
}

module.exports = mundaka;
