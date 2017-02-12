const h = require('inferno-hyperscript');
const flyd = require('flyd');

function li(book) {
    return h('li', [
        h('p', `Title: ${book.title}`),
        h('p', `Author: ${book.author}`),
        h('p', `Category: ${book.category}`)
    ]);
}

function filter(book, filter) {
    if (filter === 'show-all') {
        return true;
    }

    return book.category === filter;
}

module.exports = function (state) {
    const list$ = state.books.list$;
    const filter$ = state.books.filter$;

    return flyd
        .combine((list, filter) => {
            return {
                list: list(),
                filter: filter()
            };
        }, [list$, filter$])
        .map(books => {
            if (books.list.length === 0) {
                return h('p', 'not found');
            }

            return h('#books', [
                h('h2', 'Books'),
                h('ul', books
                    .list
                    .filter(book => filter(book, books.filter))
                    .map(li)
                )
            ]);
        });
}
