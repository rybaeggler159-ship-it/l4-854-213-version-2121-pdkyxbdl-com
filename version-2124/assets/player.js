(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function setupPlayer(box) {
    var video = box.querySelector("video[data-stream]");
    var button = box.querySelector(".video-play-button");
    var message = box.querySelector(".player-message");
    var stream = video ? video.getAttribute("data-stream") : "";
    var attached = false;
    var hls = null;

    if (!video || !button || !stream) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;
      setMessage("视频加载中");

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage("点击播放");
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage("视频加载失败，请稍后再试");
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage("视频播放异常，正在恢复");
            hls.recoverMediaError();
          } else {
            setMessage("无法播放视频");
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        setMessage("点击播放");
      } else {
        setMessage("无法播放视频");
        button.disabled = true;
      }
    }

    function playVideo() {
      attachStream();
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          setMessage("点击播放");
        });
      }
    }

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", toggleVideo);
    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      box.classList.remove("is-playing");
      setMessage("点击播放");
    });
    video.addEventListener("ended", function () {
      box.classList.remove("is-playing");
      setMessage("重新播放");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.forEach.call(document.querySelectorAll("[data-player]"), setupPlayer);
  });
})();
