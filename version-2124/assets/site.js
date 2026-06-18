(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  function cardTemplate(item) {
    return [
      '<article class="movie-card poster-card">',
      '<a class="poster-wrap" href="' + escapeHtml(item.url) + '">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="year-pill">' + escapeHtml(item.year || "") + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>',
      '<p>' + escapeHtml(item.oneLine || "") + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(item.type || "影视") + '</span><span>' + escapeHtml(item.region || "") + '</span></div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function initSearch() {
    var shell = document.querySelector("[data-search-page]");
    if (!shell || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var input = shell.querySelector("[data-search-input]");
    var typeFilter = shell.querySelector("[data-type-filter]");
    var regionFilter = shell.querySelector("[data-region-filter]");
    var yearFilter = shell.querySelector("[data-year-filter]");
    var results = shell.querySelector("[data-search-results]");
    var status = shell.querySelector("[data-search-status]");

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function match(item, query, typeValue, regionValue, yearValue) {
      var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(" ").toLowerCase();
      return (!query || text.indexOf(query) !== -1) &&
        (!typeValue || item.type === typeValue) &&
        (!regionValue || item.region === regionValue) &&
        (!yearValue || String(item.year) === yearValue);
    }

    function render() {
      var query = (input.value || "").trim().toLowerCase();
      var typeValue = typeFilter.value;
      var regionValue = regionFilter.value;
      var yearValue = yearFilter.value;
      var filtered = window.SEARCH_INDEX.filter(function (item) {
        return match(item, query, typeValue, regionValue, yearValue);
      }).slice(0, 120);
      results.innerHTML = filtered.map(cardTemplate).join("");
      status.textContent = filtered.length ? "已筛选出匹配内容" : "暂无匹配内容";
    }

    [input, typeFilter, regionFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });

    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
