(function () {
    function attachVideo(video, url) {
        if (!video || !url || video.getAttribute("data-ready") === "1") {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video.hlsInstance = hls;
        } else {
            video.src = url;
        }
        video.setAttribute("data-ready", "1");
    }

    function start(root) {
        var video = root.querySelector("video");
        var overlay = root.querySelector("[data-play-trigger]");
        if (!video) {
            return;
        }
        attachVideo(video, video.getAttribute("data-url"));
        video.controls = true;
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    document.querySelectorAll("[data-player-root]").forEach(function (root) {
        var overlay = root.querySelector("[data-play-trigger]");
        var video = root.querySelector("video");
        if (overlay) {
            overlay.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                start(root);
            });
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start(root);
                }
            });
        }
    });

    window.addEventListener("beforeunload", function () {
        document.querySelectorAll("video").forEach(function (video) {
            if (video.hlsInstance && typeof video.hlsInstance.destroy === "function") {
                video.hlsInstance.destroy();
            }
        });
    });
})();
