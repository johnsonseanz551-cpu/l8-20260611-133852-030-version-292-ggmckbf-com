(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var mobileMenu = document.querySelector(".mobile-menu");
        if (toggle && mobileMenu) {
            toggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1) {
            var current = 0;
            var activate = function (index) {
                current = index;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("hero-slide-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    activate(index);
                });
            });
            window.setInterval(function () {
                activate((current + 1) % slides.length);
            }, 5200);
        }

        var searchForms = Array.prototype.slice.call(document.querySelectorAll(".search-box"));
        searchForms.forEach(function (form) {
            var grid = document.querySelector(form.getAttribute("data-target"));
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".searchable-card"));
            var keyword = form.querySelector("[data-filter='keyword']");
            var region = form.querySelector("[data-filter='region']");
            var type = form.querySelector("[data-filter='type']");
            var year = form.querySelector("[data-filter='year']");
            var empty = document.querySelector(form.getAttribute("data-empty"));
            var apply = function () {
                var kw = keyword ? keyword.value.trim().toLowerCase() : "";
                var regionValue = region ? region.value : "";
                var typeValue = type ? type.value : "";
                var yearValue = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var matched = true;
                    if (kw && haystack.indexOf(kw) === -1) {
                        matched = false;
                    }
                    if (regionValue && (card.getAttribute("data-region") || "").indexOf(regionValue) === -1) {
                        matched = false;
                    }
                    if (typeValue && (card.getAttribute("data-type") || "").indexOf(typeValue) === -1) {
                        matched = false;
                    }
                    if (yearValue && card.getAttribute("data-year") !== yearValue) {
                        matched = false;
                    }
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            };
            [keyword, region, type, year].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });
        });
    });

    window.initMoviePlayer = function (videoId, sourceUrl, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !sourceUrl) {
            return;
        }
        var hls = null;
        var shouldStart = false;
        var attached = false;
        var attachSource = function () {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                video.load();
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (shouldStart) {
                        var promise = video.play();
                        if (promise && typeof promise.catch === "function") {
                            promise.catch(function () {});
                        }
                    }
                });
            } else {
                video.src = sourceUrl;
                video.load();
            }
        };
        var start = function () {
            shouldStart = true;
            attachSource();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        };
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
}());
