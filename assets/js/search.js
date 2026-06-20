(function () {
    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function createCard(movie) {
        var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<a class="movie-card movie-card-default" href="./' + escapeHtml(movie.url) + '">',
            '    <span class="poster-frame">',
            '        <img src="./' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
            '    </span>',
            '    <span class="movie-card-body">',
            '        <strong>' + escapeHtml(movie.title) + '</strong>',
            '        <em>' + escapeHtml(movie.oneLine) + '</em>',
            '        <span class="movie-card-meta">',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '        </span>',
            '        <span class="movie-tags">' + tags + '</span>',
            '    </span>',
            '</a>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function render() {
        var query = getQuery();
        var status = document.querySelector('[data-search-status]');
        var results = document.querySelector('[data-search-results]');
        var input = document.querySelector('.large-search input[name="q"]');
        var movies = window.MOVIE_SEARCH_INDEX || [];

        if (input) {
            input.value = query;
        }

        if (!status || !results) {
            return;
        }

        if (!query) {
            status.textContent = '请输入关键词后查看结果。';
            results.innerHTML = '';
            return;
        }

        var normalized = normalize(query);
        var matched = movies.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                movie.oneLine,
                (movie.tags || []).join('')
            ].join(' '));
            return haystack.indexOf(normalized) !== -1;
        }).slice(0, 120);

        status.textContent = '“' + query + '” 找到 ' + matched.length + ' 条相关影片。';
        results.innerHTML = matched.map(createCard).join('');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }
})();
