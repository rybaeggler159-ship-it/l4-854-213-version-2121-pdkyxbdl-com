(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll(".movie-player").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-player-toggle]");
      var status = player.querySelector("[data-player-status]");
      var source = player.getAttribute("data-video");
      var hls = null;
      var initialized = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function initialize() {
        if (initialized || !video || !source) {
          return;
        }

        initialized = true;
        setStatus("正在加载");

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);

          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("准备播放");
          });

          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("视频加载失败");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          setStatus("准备播放");
        } else {
          setStatus("当前浏览器不支持 HLS 播放");
        }
      }

      function playOrPause() {
        initialize();

        if (!video) {
          return;
        }

        if (video.paused) {
          var playPromise = video.play();

          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
              setStatus("再次点击播放");
            });
          }
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener("click", playOrPause);
      }

      if (video) {
        video.addEventListener("click", playOrPause);
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
          setStatus("播放中");
        });
        video.addEventListener("pause", function () {
          player.classList.remove("is-playing");
          setStatus("已暂停");
        });
        video.addEventListener("waiting", function () {
          setStatus("缓冲中");
        });
        video.addEventListener("canplay", function () {
          if (!video.paused) {
            setStatus("播放中");
          } else {
            setStatus("准备播放");
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });

      initialize();
    });
  });
})();
