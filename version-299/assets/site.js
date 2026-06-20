(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.hasAttribute('hidden') === false;
      if (isOpen) {
        mobilePanel.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
      } else {
        mobilePanel.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
      }
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        restart();
      });
    }

    restart();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  var filterList = document.querySelector('[data-filter-list]');
  if (filterPanel && filterList) {
    var keyword = filterPanel.querySelector('[data-filter-keyword]');
    var region = filterPanel.querySelector('[data-filter-region]');
    var type = filterPanel.querySelector('[data-filter-type]');
    var year = filterPanel.querySelector('[data-filter-year]');
    var items = Array.prototype.slice.call(filterList.querySelectorAll('.movie-filter-item'));

    function matchText(item, value) {
      if (!value) {
        return true;
      }
      return item.textContent.toLowerCase().indexOf(value.toLowerCase()) !== -1;
    }

    function matchAttr(item, attr, value) {
      if (!value) {
        return true;
      }
      return (item.getAttribute(attr) || '') === value;
    }

    function applyFilter() {
      var text = keyword ? keyword.value.trim() : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';

      items.forEach(function (item) {
        var visible = matchText(item, text) &&
          matchAttr(item, 'data-region', regionValue) &&
          matchAttr(item, 'data-type', typeValue) &&
          matchAttr(item, 'data-year', yearValue);
        item.hidden = !visible;
      });
    }

    [keyword, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  var searchResults = document.getElementById('searchResults');
  if (searchResults && window.MOVIE_SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var title = document.getElementById('searchTitle');
    var input = document.getElementById('searchInput');
    if (input) {
      input.value = query;
    }

    var data = window.MOVIE_SEARCH_DATA || [];
    var matched = query ? data.filter(function (item) {
      return item.text.indexOf(query.toLowerCase()) !== -1;
    }) : data.slice(0, 24);

    if (title) {
      title.textContent = query ? '“' + query + '”相关内容' : '热门内容';
    }

    searchResults.innerHTML = matched.slice(0, 96).map(function (item) {
      return '<article class="movie-card">' +
        '<a class="poster" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span>' +
        '<span class="play-chip">播放</span>' +
        '</a>' +
        '<div class="movie-info">' +
        '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.year) + '</span></div>' +
        '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
        '<p>' + escapeHtml(item.description) + '</p>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
}());
