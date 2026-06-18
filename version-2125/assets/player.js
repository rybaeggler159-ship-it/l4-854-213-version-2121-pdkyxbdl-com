function initMoviePlayer(sourceUrl) {
  var video = document.querySelector('[data-video-player]');
  var cover = document.querySelector('[data-player-cover]');
  var playButton = document.querySelector('[data-player-button]');
  var ready = false;
  var hls = null;

  if (!video || !sourceUrl) {
    return;
  }

  function mountPlayer() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function startPlayer() {
    mountPlayer();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {});
    }
  }

  if (cover) {
    cover.addEventListener('click', startPlayer);
  }

  if (playButton) {
    playButton.addEventListener('click', function(event) {
      event.stopPropagation();
      startPlayer();
    });
  }

  video.addEventListener('click', function() {
    if (video.paused) {
      startPlayer();
    }
  });

  video.addEventListener('play', function() {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function() {
    if (hls) {
      hls.destroy();
    }
  });
}
