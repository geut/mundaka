const RecursiveIterator = require('recursive-iterator');
const flyd = require('flyd');
const currentState = require('./current-state');
const noop = (stream$ => stream$);

function eachStateStream(state, cb) {
    for (const {node, path} of new RecursiveIterator(state)) {
        if (path[path.length - 1].indexOf('$') !== -1) {
            cb(node, path);
        }
    }
}

function combineStreams(paths, streams) {
    return flyd.immediate(flyd.combine((...args) => {
        const changed = args[args.length - 1];

        // check if the update was for only one stream or for the entire rootState
        if (changed.length === 1) {
            const p = streams.indexOf(changed[0]);
            return {
                path: paths[p],
                data: streams[p]()
            };
        }

        return {
            init: true
        };
    }, streams));
 }

function createState(opts) {
    const {
        state,
        onCreateEachStream = noop,
        onCreateState = noop
    } = opts;
    const streams = [];
    const paths = [];
    const rootState$ = flyd.stream(state);

    eachStateStream(state, (node, path) => {
        const stream = path.reduce((last, prop, index) => {
            if (index === path.length - 1) {
                last[prop] = onCreateEachStream(
                    flyd.combine(rootState$ => {
                        return path.reduce((last, prop) => last[prop], rootState$());
                    }, [rootState$])
                );
            }

            return last[prop];
        }, state);

        streams.push(stream);
        paths.push(path.join('.'));
    });

    const stream$ = onCreateState(combineStreams(paths, streams));

    return {
        state,
        stream$,
        setState(newState) {
            rootState$(newState);
        }
    };
}

module.exports = {
    createState,
    currentState
};

