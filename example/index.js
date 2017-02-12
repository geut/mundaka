const renderer = require('inferno').createRenderer();
const flyd = require('flyd');
const h = require('inferno-hyperscript');
const cache = require('./cache');
const mundaka = require('../index');

const mun = mundaka({
    state: require('./state')
});

window.mun = mun;

function view() {
    const books$ = cache(require('./components/books')(mun.state));
    const count$ = cache(mun.state.count$.map(count => h('h1', count)));

    return () => {
        return h('div', [
            h(count$),
            h(books$)
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

