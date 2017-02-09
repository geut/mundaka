const renderer = require('inferno').createRenderer();
const h = require('inferno-hyperscript');
const mundaka = require('../index');
const flyd = require('flyd');

const mun = mundaka({
    state: require('./state')
});

window.mun = mun;

function view() {
    const books$ = require('./components/books')(mun.state);
    const count$ = mun.state.count$.map(count => h('h1', count));

    return () => {
        return h('div', [
            count$(),
            books$()
        ]);
    };
}

const vnode$ = mun.map(view());

window.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.id = 'app';
    document.body.insertBefore(container, document.body.firstChild);

    flyd.scan(renderer, container, vnode$);

    let i = 0;
    setInterval(() => {
        mun.state.count$(i);
        i++;
    }, 1);
});

