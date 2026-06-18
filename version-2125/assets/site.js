(function() {
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('siteNav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function() {
      var isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startHero() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function() {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        showSlide(i);
        startHero();
      });
    });

    if (slides.length > 1) {
      startHero();
    }
  }

  function filterCards(input, cards) {
    var value = (input.value || '').trim().toLowerCase();
    cards.forEach(function(card) {
      var text = (card.getAttribute('data-keywords') || card.textContent || '').toLowerCase();
      card.classList.toggle('is-hidden', value && text.indexOf(value) === -1);
    });
  }

  var localInput = document.querySelector('[data-local-search]');

  if (localInput) {
    var localCards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    localInput.addEventListener('input', function() {
      filterCards(localInput, localCards);
    });
  }

  var searchInput = document.querySelector('[data-search-input]');

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var searchCards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    searchInput.value = query;
    filterCards(searchInput, searchCards);
    searchInput.addEventListener('input', function() {
      filterCards(searchInput, searchCards);
    });
  }
})();
