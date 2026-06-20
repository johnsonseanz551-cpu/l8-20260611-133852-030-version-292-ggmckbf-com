import { H as Hls } from './hls-dru42stk.js';

function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

function setupMobileMenu() {
    const button = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
        return;
    }

    button.addEventListener('click', () => {
        panel.classList.toggle('is-open');
    });
}

function setupHeroCarousel() {
    const hero = document.querySelector('[data-hero]');

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;
    let timer = null;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }

        activeIndex = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, index) => {
            slide.classList.toggle('is-active', index === activeIndex);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('is-active', index === activeIndex);
        });
    }

    function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(() => {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            startTimer();
        });
    });

    showSlide(0);
    startTimer();
}

function getQueryValue(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
}

function setupFilters() {
    const grid = document.querySelector('[data-filter-grid]');

    if (!grid) {
        return;
    }

    const searchInput = document.querySelector('[data-search-input]');
    const yearFilter = document.querySelector('[data-year-filter]');
    const typeFilter = document.querySelector('[data-type-filter]');
    const sortSelect = document.querySelector('[data-sort-select]');
    const countNode = document.querySelector('[data-result-count]');
    const emptyState = document.querySelector('[data-empty-state]');
    const cards = Array.from(grid.children);
    const initialQuery = getQueryValue('q');

    if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
    }

    function yearMatches(card, selected) {
        if (!selected) {
            return true;
        }

        const year = Number(card.dataset.year || 0);

        if (selected === '2025') {
            return year >= 2025;
        }

        if (selected === '2020') {
            return year >= 2020 && year <= 2024;
        }

        if (selected === '2010') {
            return year >= 2010 && year <= 2019;
        }

        if (selected === '2000') {
            return year >= 2000 && year <= 2009;
        }

        if (selected === '1990') {
            return year < 1990;
        }

        return true;
    }

    function typeMatches(card, selected) {
        if (!selected) {
            return true;
        }

        return (card.dataset.type || '').includes(selected);
    }

    function textMatches(card, query) {
        if (!query) {
            return true;
        }

        const haystack = [
            card.dataset.title,
            card.dataset.type,
            card.dataset.region,
            card.dataset.tags,
            card.textContent,
        ].join(' ').toLowerCase();

        return haystack.includes(query.toLowerCase());
    }

    function sortCards(visibleCards) {
        const sortValue = sortSelect ? sortSelect.value : 'year-desc';

        visibleCards.sort((a, b) => {
            if (sortValue === 'score-desc') {
                return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
            }

            if (sortValue === 'title-asc') {
                return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN');
            }

            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });

        visibleCards.forEach(card => grid.appendChild(card));
    }

    function applyFilters() {
        const query = searchInput ? searchInput.value.trim() : '';
        const selectedYear = yearFilter ? yearFilter.value : '';
        const selectedType = typeFilter ? typeFilter.value : '';
        const visibleCards = [];

        cards.forEach(card => {
            const visible = textMatches(card, query) && yearMatches(card, selectedYear) && typeMatches(card, selectedType);
            card.hidden = !visible;

            if (visible) {
                visibleCards.push(card);
            }
        });

        sortCards(visibleCards);

        if (countNode) {
            countNode.textContent = String(visibleCards.length);
        }

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visibleCards.length === 0);
        }
    }

    [searchInput, yearFilter, typeFilter, sortSelect].forEach(control => {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    applyFilters();
}

function setupPlayers() {
    const players = document.querySelectorAll('[data-player]');

    players.forEach(player => {
        const video = player.querySelector('video[data-src]');
        const startButton = player.querySelector('[data-player-start]');

        if (!video || !startButton) {
            return;
        }

        let hlsInstance = null;

        function attachSource() {
            if (video.dataset.ready === 'true') {
                return;
            }

            const source = video.dataset.src;

            if (!source) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            video.dataset.ready = 'true';
        }

        function startPlayback() {
            attachSource();
            player.querySelector('.player-shell')?.classList.add('is-playing');
            video.play().catch(() => {
                player.querySelector('.player-shell')?.classList.remove('is-playing');
            });
        }

        startButton.addEventListener('click', startPlayback);
        video.addEventListener('play', () => {
            player.querySelector('.player-shell')?.classList.add('is-playing');
        });
        video.addEventListener('pause', () => {
            if (video.currentTime === 0) {
                player.querySelector('.player-shell')?.classList.remove('is-playing');
            }
        });
        video.addEventListener('emptied', () => {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
}

function setupBackToTop() {
    const button = document.querySelector('[data-back-to-top]');

    if (!button) {
        return;
    }

    function updateVisibility() {
        button.classList.toggle('is-visible', window.scrollY > 600);
    }

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    });

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
}

function setupImageFallbacks() {
    document.querySelectorAll('.poster-frame img, .mini-poster img').forEach(image => {
        image.addEventListener('error', () => {
            const frame = image.closest('.poster-frame, .mini-poster');
            if (frame) {
                frame.classList.add('poster-missing');
            }
            image.remove();
        });
    });
}

ready(() => {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupPlayers();
    setupBackToTop();
    setupImageFallbacks();
});
