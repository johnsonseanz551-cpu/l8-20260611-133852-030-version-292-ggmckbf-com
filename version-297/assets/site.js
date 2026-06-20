function qs(selector, root) {
  return (root || document).querySelector(selector);
}

function qsa(selector, root) {
  return Array.from((root || document).querySelectorAll(selector));
}

function initMenu() {
  var button = qs('.menu-toggle');
  var menu = qs('.mobile-menu');
  if (!button || !menu) {
    return;
  }
  button.addEventListener('click', function () {
    var next = menu.hasAttribute('hidden');
    if (next) {
      menu.removeAttribute('hidden');
    } else {
      menu.setAttribute('hidden', '');
    }
    button.setAttribute('aria-expanded', next ? 'true' : 'false');
  });
}

function initHero() {
  var hero = qs('[data-hero]');
  if (!hero) {
    return;
  }
  var slides = qsa('[data-hero-slide]', hero);
  var dots = qsa('[data-hero-dot]', hero);
  var index = 0;
  var timer = null;
  function show(next) {
    if (!slides.length) {
      return;
    }
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === index);
    });
  }
  function restart() {
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(function () {
      show(index + 1);
    }, 5000);
  }
  var prev = qs('[data-hero-prev]', hero);
  var next = qs('[data-hero-next]', hero);
  if (prev) {
    prev.addEventListener('click', function () {
      show(index - 1);
      restart();
    });
  }
  if (next) {
    next.addEventListener('click', function () {
      show(index + 1);
      restart();
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      show(i);
      restart();
    });
  });
  show(0);
  restart();
}

function initGlobalSearch() {
  var root = qs('[data-global-search]');
  if (!root || !window.SEARCH_INDEX) {
    return;
  }
  var input = qs('[data-global-input]', root);
  var results = qs('[data-global-results]', root);
  if (!input || !results) {
    return;
  }
  function render(items) {
    if (!items.length) {
      results.innerHTML = '';
      results.setAttribute('hidden', '');
      return;
    }
    results.innerHTML = items.slice(0, 12).map(function (item) {
      return '<a class="search-result" href="' + item.file + '"><img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '"><span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span></span></a>';
    }).join('');
    results.removeAttribute('hidden');
  }
  input.addEventListener('input', function () {
    var value = input.value.trim().toLowerCase();
    if (!value) {
      render([]);
      return;
    }
    var parts = value.split(/\s+/).filter(Boolean);
    var found = window.SEARCH_INDEX.filter(function (item) {
      var hay = item.search;
      return parts.every(function (part) {
        return hay.indexOf(part) !== -1;
      });
    });
    render(found);
  });
  document.addEventListener('click', function (event) {
    if (!root.contains(event.target)) {
      results.setAttribute('hidden', '');
    }
  });
}

function initLocalFilters() {
  qsa('[data-local-filter]').forEach(function (panel) {
    var list = panel.parentElement.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    var input = qs('[data-filter-input]', panel);
    var region = qs('[data-region-filter]', panel);
    var year = qs('[data-year-filter]', panel);
    var cards = qsa('[data-title]', list);
    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var y = year ? year.value : '';
      cards.forEach(function (card) {
        var hay = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.tags].join(' ').toLowerCase();
        var ok = true;
        if (q && hay.indexOf(q) === -1) {
          ok = false;
        }
        if (r && card.dataset.region !== r) {
          ok = false;
        }
        if (y && card.dataset.year !== y) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
      });
    }
    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });
}

function initPlayer(streamUrl) {
  var video = document.getElementById('video-player');
  var shell = qs('[data-player]');
  var button = qs('.play-overlay');
  if (!video || !shell || !button) {
    return;
  }
  var ready = false;
  var hls = null;
  function prepare() {
    if (ready) {
      return Promise.resolve();
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        setTimeout(resolve, 1200);
      });
    }
    video.src = streamUrl;
    return Promise.resolve();
  }
  function start() {
    prepare().then(function () {
      shell.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
  }
  button.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      shell.classList.remove('is-playing');
    }
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

window.initPlayer = initPlayer;
document.addEventListener('DOMContentLoaded', function () {
  initMenu();
  initHero();
  initGlobalSearch();
  initLocalFilters();
});
