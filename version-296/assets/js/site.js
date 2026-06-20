document.addEventListener("DOMContentLoaded", function () {
    initializeMenu();
    initializeHero();
    initializeSearchForms();
    initializeCardFilters();
    initializeImageFallbacks();
    initializePlayers();
    initializeLiveSearch();
});

function siteBase() {
    return document.body.dataset.base || "";
}

function initializeMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
        return;
    }

    button.addEventListener("click", function () {
        nav.classList.toggle("is-open");
    });
}

function initializeHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function schedule() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            show(current + 1);
        }, 5000);
    }

    if (previous) {
        previous.addEventListener("click", function () {
            show(current - 1);
            schedule();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            show(current + 1);
            schedule();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            show(Number(dot.dataset.heroDot));
            schedule();
        });
    });

    show(0);
    schedule();
}

function initializeSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");

    forms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            var query = input ? input.value.trim() : "";
            var url = siteBase() + "search.html";

            if (query) {
                url += "?q=" + encodeURIComponent(query);
            }

            window.location.href = url;
        });
    });
}

function initializeCardFilters() {
    var inputs = document.querySelectorAll("[data-card-filter]");

    inputs.forEach(function (input) {
        var section = input.closest("section") || document;
        var grid = section.querySelector("[data-filter-grid]");

        if (!grid) {
            grid = document.querySelector("[data-filter-grid]");
        }

        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

        function applyFilter() {
            var query = input.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var haystack = card.dataset.search || "";
                card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
            });
        }

        input.addEventListener("input", applyFilter);

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (initialQuery && !input.value) {
            input.value = initialQuery;
            applyFilter();
        }
    });
}

function initializeImageFallbacks() {
    var images = document.querySelectorAll("img");

    images.forEach(function (image) {
        image.addEventListener("error", function () {
            var shell = image.closest(".poster-shell, .aside-card, .category-card");

            if (shell) {
                shell.classList.add("is-missing");
            }
        }, { once: true });
    });
}

function initializePlayers() {
    var players = document.querySelectorAll("[data-player]");

    players.forEach(function (frame) {
        var video = frame.querySelector("video");
        var button = frame.querySelector("[data-play-button]");
        var message = frame.querySelector("[data-player-message]");
        var source = frame.dataset.src;
        var hls = null;

        function showMessage(text) {
            if (!message) {
                return;
            }

            message.textContent = text;
            message.classList.add("is-visible");
        }

        function attachSource() {
            if (!video || !source) {
                showMessage("当前播放器缺少播放源。");
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        showMessage("网络加载出现波动，正在尝试重新连接播放源。");
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        showMessage("媒体解析出现波动，正在尝试恢复播放。");
                        hls.recoverMediaError();
                    } else {
                        showMessage("播放器暂时无法加载该 m3u8 播放源。");
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                showMessage("当前浏览器不支持 HLS 播放，可尝试使用 Chrome、Edge 或 Safari。播放源：" + source);
            }
        }

        function play() {
            frame.classList.add("is-playing");

            if (!video.src && !hls) {
                attachSource();
            }

            var attempt = video.play();

            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    showMessage("浏览器阻止了自动播放，请再次点击视频控制栏播放。");
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }

        video.addEventListener("play", function () {
            frame.classList.add("is-playing");
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                frame.classList.remove("is-playing");
            }
        });
    });

    var scrollButtons = document.querySelectorAll("[data-scroll-player]");

    scrollButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            var target = document.querySelector(".player-section");

            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
}

function initializeLiveSearch() {
    var form = document.querySelector("[data-live-search-form]");
    var input = document.querySelector("[data-live-search-input]");
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");

    if (!form || !input || !results) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var movies = [];

    if (initialQuery) {
        input.value = initialQuery;
    }

    fetch(siteBase() + "data/search-index.json")
        .then(function (response) {
            return response.json();
        })
        .then(function (items) {
            movies = items;
            renderSearch(input.value.trim());
        })
        .catch(function () {
            if (status) {
                status.textContent = "搜索索引加载失败，请检查 data/search-index.json 是否存在。";
            }
        });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        renderSearch(input.value.trim());
    });

    input.addEventListener("input", function () {
        renderSearch(input.value.trim());
    });

    function renderSearch(query) {
        results.innerHTML = "";

        if (!query) {
            if (status) {
                status.textContent = "请输入关键词开始搜索。";
            }
            return;
        }

        var lowered = query.toLowerCase();
        var matched = movies.filter(function (movie) {
            return movie.search.indexOf(lowered) !== -1;
        }).slice(0, 120);

        if (status) {
            status.textContent = "找到 " + matched.length + " 条相关结果，最多显示前 120 条。";
        }

        matched.forEach(function (movie) {
            results.appendChild(createSearchCard(movie));
        });
    }

    function createSearchCard(movie) {
        var article = document.createElement("article");
        article.className = "movie-card";
        article.dataset.card = "";
        article.innerHTML = [
            '<a class="poster-shell" href="' + movie.detail + '">',
            '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
            '    <span class="poster-fallback">' + escapeHtml(movie.title) + '</span>',
            '    <span class="poster-badge">高清</span>',
            '</a>',
            '<div class="movie-card-body">',
            '    <div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
            '    <h3><a href="' + movie.detail + '">' + escapeHtml(movie.title) + '</a></h3>',
            '    <p>' + escapeHtml(movie.one_line) + '</p>',
            '</div>'
        ].join("");

        var image = article.querySelector("img");
        image.addEventListener("error", function () {
            var shell = image.closest(".poster-shell");
            if (shell) {
                shell.classList.add("is-missing");
            }
        }, { once: true });

        return article;
    }
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
