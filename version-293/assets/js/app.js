(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === current);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            var index = Number(dot.getAttribute("data-hero-dot"));
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function bindSearch(input) {
        var scope = input.closest("main") || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        if (!cards.length) {
            return;
        }
        var empty = scope.querySelector("#search-empty");
        input.addEventListener("input", function () {
            var keyword = normalize(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-category"),
                    card.textContent
                ].join(" "));
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll(".site-search")).forEach(bindSearch);

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
        Array.prototype.slice.call(document.querySelectorAll(".site-search")).forEach(function (input) {
            input.value = query;
            input.dispatchEvent(new Event("input"));
        });
    }
})();
