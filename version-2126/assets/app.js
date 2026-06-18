(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initCarousel() {
    var root = document.querySelector("[data-carousel]");

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === current;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide") || 0));
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach(function (value) {
      if (!value) {
        return;
      }

      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var results = document.querySelector("[data-filter-results]");

    if (!panel || !results) {
      return;
    }

    var cards = Array.prototype.slice.call(results.querySelectorAll(".movie-card"));
    var input = panel.querySelector("[data-filter-input]");
    var category = panel.querySelector("[data-filter-category]");
    var year = panel.querySelector("[data-filter-year]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    fillSelect(year, unique(cards.map(function (card) {
      return card.getAttribute("data-year");
    })).sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-Hans-CN");
    }));

    fillSelect(region, unique(cards.map(function (card) {
      return card.getAttribute("data-region");
    })).sort(function (a, b) {
      return String(a).localeCompare(String(b), "zh-Hans-CN");
    }));

    fillSelect(type, unique(cards.map(function (card) {
      return card.getAttribute("data-type");
    })).sort(function (a, b) {
      return String(a).localeCompare(String(b), "zh-Hans-CN");
    }));

    if (input && query) {
      input.value = query;
    }

    function unique(values) {
      var seen = {};
      var list = [];

      values.forEach(function (value) {
        if (value && !seen[value]) {
          seen[value] = true;
          list.push(value);
        }
      });

      return list;
    }

    function apply() {
      var words = input ? input.value.trim().toLowerCase() : "";
      var selectedCategory = category ? category.value : "";
      var selectedYear = year ? year.value : "";
      var selectedRegion = region ? region.value : "";
      var selectedType = type ? type.value : "";

      cards.forEach(function (card) {
        var searchable = (card.getAttribute("data-search") || "").toLowerCase();
        var matched = true;

        if (words && searchable.indexOf(words) === -1) {
          matched = false;
        }

        if (selectedCategory && card.getAttribute("data-category") !== selectedCategory) {
          matched = false;
        }

        if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
          matched = false;
        }

        if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
          matched = false;
        }

        if (selectedType && card.getAttribute("data-type") !== selectedType) {
          matched = false;
        }

        card.classList.toggle("is-hidden", !matched);
      });
    }

    [input, category, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function initPlayer(options) {
    ready(function () {
      var video = document.getElementById(options.videoId);
      var overlay = document.getElementById(options.overlayId);
      var button = document.getElementById(options.buttonId);
      var source = options.source;
      var loaded = false;
      var hls = null;

      if (!video || !overlay || !button || !source) {
        return;
      }

      function setError() {
        overlay.classList.remove("is-hidden");
        button.textContent = "!";
      }

      function load() {
        if (loaded) {
          return;
        }

        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setError();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          setError();
        }
      }

      function play() {
        load();
        overlay.classList.add("is-hidden");
        video.controls = true;

        var attempt = video.play();

        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }

      button.addEventListener("click", function (event) {
        event.stopPropagation();
        play();
      });

      overlay.addEventListener("click", play);
      overlay.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          play();
        }
      });

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initCarousel();
    initFilters();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
})();
