(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
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
  }

  function initSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
    if (!inputs.length) {
      return;
    }
    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        var scope = input.closest('main') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-text]'));
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search-text') || '').toLowerCase();
          card.classList.toggle('is-hidden', value && text.indexOf(value) === -1);
        });
      });
    });
  }

  function initFilters() {
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-filter-row]'));
    rows.forEach(function (row) {
      var buttons = Array.prototype.slice.call(row.querySelectorAll('[data-filter]'));
      var section = row.closest('section');
      var nextSection = section ? section.nextElementSibling : document;
      var cards = Array.prototype.slice.call(nextSection.querySelectorAll('[data-filter-values]'));
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var filter = button.getAttribute('data-filter') || '';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          cards.forEach(function (card) {
            var values = card.getAttribute('data-filter-values') || '';
            card.classList.toggle('is-hidden', filter && values.indexOf(filter) === -1);
          });
        });
      });
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback(window.Hls);
      return;
    }
    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', function () {
        callback(window.Hls);
      });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', function () {
      callback(window.Hls);
    });
    document.head.appendChild(script);
  }

  function initPlayer(streamUrl) {
    var video = document.querySelector('.player-video');
    var overlay = document.querySelector('.player-overlay');
    if (!video || !overlay || !streamUrl) {
      return;
    }
    var initialized = false;
    var hlsInstance = null;

    function setOverlay(hidden) {
      overlay.classList.toggle('is-hidden', hidden);
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setOverlay(false);
        });
      }
    }

    function setupAndPlay() {
      setOverlay(true);
      if (initialized) {
        playVideo();
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
        return;
      }
      loadHls(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setOverlay(false);
            }
          });
        } else {
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          video.load();
        }
      });
    }

    overlay.addEventListener('click', setupAndPlay);
    video.addEventListener('click', function () {
      if (!initialized || video.paused) {
        setupAndPlay();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  window.MovieSite = {
    initPlayer: initPlayer
  };

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initFilters();
    if (window.MovieStreamUrl) {
      initPlayer(window.MovieStreamUrl);
    }
  });
})();
