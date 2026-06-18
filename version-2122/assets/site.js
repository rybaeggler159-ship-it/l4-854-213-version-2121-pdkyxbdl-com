(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var siteNav = document.querySelector('[data-site-nav]');

  if (menuButton && siteNav) {
    menuButton.addEventListener('click', function () {
      siteNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  var searchInput = document.querySelector('.js-search');
  var regionSelect = document.querySelector('.js-filter-region');
  var typeSelect = document.querySelector('.js-filter-type');
  var yearSelect = document.querySelector('.js-filter-year');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var chipValue = '';

  function normalized(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardText(card) {
    return normalized([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalized(searchInput ? searchInput.value : '');
    var region = normalized(regionSelect ? regionSelect.value : '');
    var type = normalized(typeSelect ? typeSelect.value : '');
    var year = normalized(yearSelect ? yearSelect.value : '');
    var chip = normalized(chipValue);
    var visible = 0;

    cards.forEach(function (card) {
      var text = cardText(card);
      var matches = true;

      if (query && text.indexOf(query) === -1) {
        matches = false;
      }
      if (region && normalized(card.getAttribute('data-region')) !== region) {
        matches = false;
      }
      if (type && normalized(card.getAttribute('data-type')) !== type) {
        matches = false;
      }
      if (year && normalized(card.getAttribute('data-year')) !== year) {
        matches = false;
      }
      if (chip && text.indexOf(chip) === -1) {
        matches = false;
      }

      card.classList.toggle('is-hidden', !matches);
      if (matches) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (item) {
        item.classList.remove('active');
      });
      chip.classList.add('active');
      chipValue = chip.getAttribute('data-filter-chip') || '';
      applyFilters();
    });
  });
})();
