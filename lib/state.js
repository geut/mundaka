const RecursiveIterator = require('recursive-iterator');
const flyd = require('flyd');
const currentState = require('./current-state');
const BLOCK = Symbol('block');

function eachStateStream(state, cb) {
    for (const {node, path} of new RecursiveIterator(state)) {
        if (path[path.length - 1].indexOf('$') !== -1) {
            cb(node, path);
        }
    }
}

function updateStreams(set$, paths, streams) {
    eachStateStream(set$(), (node, path) => {
        const idx = paths.indexOf(path.join('.'));
        const stream = streams[idx];
        stream(node);
    });

    set$(BLOCK);
}

function combineStreams(paths, streams) {
    const set$ = flyd.stream();

    const stream$ = flyd.immediate(flyd.combine((set$, ...args) => {
        const changed = args[args.length - 1];
        const setIsChanged = changed.indexOf(set$) !== -1;

        if (set$() !== undefined) {
            if (set$() === BLOCK) {
                if (setIsChanged) {
                    set$(undefined);
                }
                return;
            }
            updateStreams(set$, paths, streams);
            return;
        }

        if (!setIsChanged && changed.length > 0) {
            const p = streams.indexOf(changed[0]);
            return {
                path: paths[p],
                data: streams[p]()
            };
        }

        return {
            init: true
        };
    }, [set$, ...streams]));

    return {
        set$,
        stream$
    };
}

function createState(opts) {
    const state = opts.state;
    const onCreateEachStream = opts.onCreateEachStream || (stream$ => stream$);
    const onCreateState = opts.onCreateState || (stream$ => stream$);
    const streams = [];
    const paths = [];

    eachStateStream(state, (node, path) => {
        const stream = path.reduce((last, prop, index) => {
            const stream = onCreateEachStream(flyd.stream(node));

            if (index === path.length - 1) {
                last[prop] = stream;
            }

            return last[prop];
        }, state);

        streams.push(stream);
        paths.push(path.join('.'));
    });

    const {set$, stream$} = onCreateState(combineStreams(paths, streams));

    return {
        state,
        stream$,
        setState(newState) {
            set$(newState);
        }
    };
}

module.exports = {
    createState,
    currentState
};

