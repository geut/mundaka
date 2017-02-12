const h = require('inferno-hyperscript');
const isStream = require('flyd').isStream;
const NO_OP = require('inferno').NO_OP;

module.exports = function (elem) {
    let oldVnode;
    return function () {
        if (oldVnode === elem()) {
            return NO_OP;
        }
        oldVnode = elem();
        return elem();
    };
};
