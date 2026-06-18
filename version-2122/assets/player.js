(function () {
  function initPlayer(root) {
    var video = root.querySelector('video');
    var overlay = root.querySelector('.player-overlay');
    var source = root.getAttribute('data-src');
    var loaded = false;
    var hls = null;

    function attachSource() {
      if (!video || !source || loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute('controls', 'controls');
    }

    function playVideo() {
      attachSource();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove('hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (loaded && video.currentTime === 0 && overlay) {
          overlay.classList.remove('hidden');
        }
      });
      video.addEventListener('error', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  }

  document.querySelectorAll('.js-player').forEach(initPlayer);
})();
