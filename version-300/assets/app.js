(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $$('[data-hero-slide]', hero);
    var dots = $$('[data-hero-dot]', hero);
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function initImageFallbacks() {
    $$('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
        image.setAttribute('aria-hidden', 'true');
      }, { once: true });
    });
  }

  function initCatalog() {
    var grid = $('[data-catalog-grid]');
    if (!grid) {
      return;
    }
    var cards = $$('.movie-card', grid);
    var input = $('[data-catalog-search]');
    var empty = $('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (input && initialQuery) {
      input.value = initialQuery;
    }
    function matches(card, query) {
      if (!query || query === '全部') {
        return true;
      }
      var haystack = card.getAttribute('data-search') || '';
      return haystack.indexOf(query.toLowerCase()) !== -1;
    }
    function apply(query) {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card, query);
        card.classList.toggle('is-hidden-by-filter', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    if (input) {
      input.addEventListener('input', function () {
        apply(input.value.trim());
      });
    }
    $$('[data-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        $$('[data-filter]').forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        var value = button.getAttribute('data-filter') || '';
        if (input) {
          input.value = value === '全部' ? '' : value;
        }
        apply(value);
      });
    });
    apply(initialQuery);
  }

  function attachStream(video, stream) {
    if (!stream || video.getAttribute('data-ready') === '1') {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.setAttribute('data-ready', '1');
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      video.setAttribute('data-ready', '1');
      return;
    }
    video.src = stream;
    video.setAttribute('data-ready', '1');
  }

  function initPlayers() {
    $$('[data-player]').forEach(function (player) {
      var video = $('video', player);
      var cover = $('[data-play-button]', player);
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream') || '';
      function play() {
        attachStream(video, stream);
        if (cover) {
          cover.classList.add('is-hidden');
        }
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            video.controls = true;
          });
        }
      }
      if (cover) {
        cover.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }
      player.addEventListener('click', function (event) {
        if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
          return;
        }
        play();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initImageFallbacks();
    initCatalog();
    initPlayers();
  });
})();
