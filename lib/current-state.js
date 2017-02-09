const RecursiveIterator = require('recursive-iterator');
const isStream = require('flyd').isStream;
const toString = Object.prototype.toString;

const types = {
    Object: () => ({}),
    Array: () => [],
    Date: any => new Date(any),
    RegExp: any => new RegExp(any)
};

function shallowCopy(any) {
    if (isStream(any)) {
        return any();
    }

    const type = types[toString.call(any).slice(8, -1)];

    if (type) {
        return type(any);
    }

    return any;
}

module.exports = function (state) {
    const map = new Map();
    const rootNode = shallowCopy(state);
    map.set(state, rootNode);

    for (const {parent, node, key} of new RecursiveIterator(state, 1, true)) {
        const parentNode = map.get(parent);
        const cloneNode = shallowCopy(node);
        parentNode[key] = cloneNode;
        map.set(node, cloneNode);
    }

    map.clear();

    return rootNode;
};
