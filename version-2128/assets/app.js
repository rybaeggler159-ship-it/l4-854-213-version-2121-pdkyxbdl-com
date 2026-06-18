
const HLS_SCRIPT_URLS = [
    "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js",
    "https://unpkg.com/hls.js@1.5.18/dist/hls.min.js"
];

function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

function setupMobileMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener("click", () => {
        panel.classList.toggle("is-open");
        toggle.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
}

function setupHeroCarousel() {
    const carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    const prev = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    let currentIndex = 0;
    let timer = null;

    function showSlide(index) {
        currentIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === currentIndex);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === currentIndex);
        });
    }

    function startAutoPlay() {
        stopAutoPlay();
        timer = window.setInterval(() => showSlide(currentIndex + 1), 5200);
    }

    function stopAutoPlay() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.dataset.heroDot));
            startAutoPlay();
        });
    });

    if (prev) {
        prev.addEventListener("click", () => {
            showSlide(currentIndex - 1);
            startAutoPlay();
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            showSlide(currentIndex + 1);
            startAutoPlay();
        });
    }

    carousel.addEventListener("mouseenter", stopAutoPlay);
    carousel.addEventListener("mouseleave", startAutoPlay);
    showSlide(0);
    startAutoPlay();
}

function setupFilters() {
    const input = document.querySelector("[data-filter-input]");
    const grid = document.querySelector("[data-filter-grid]");
    const count = document.querySelector("[data-filter-count]");
    const clear = document.querySelector("[data-clear-filter]");

    if (!input || !grid) {
        return;
    }

    const cards = Array.from(grid.querySelectorAll("[data-movie-card]"));
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (query && input.hasAttribute("data-search-query")) {
        input.value = query;
    }

    function applyFilter() {
        const keyword = input.value.trim().toLowerCase();
        let visible = 0;

        cards.forEach((card) => {
            const haystack = (card.dataset.search || card.textContent || "").toLowerCase();
            const matched = !keyword || haystack.includes(keyword);
            card.classList.toggle("is-hidden", !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = `${visible} 部`;
        }
    }

    input.addEventListener("input", applyFilter);

    if (clear) {
        clear.addEventListener("click", () => {
            input.value = "";
            applyFilter();
            input.focus();
        });
    }

    applyFilter();
}

function loadExternalScript(url) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${url}"]`);

        if (existing) {
            existing.addEventListener("load", resolve, { once: true });
            existing.addEventListener("error", reject, { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function getHlsLibrary() {
    if (window.Hls) {
        return window.Hls;
    }

    for (const url of HLS_SCRIPT_URLS) {
        try {
            await loadExternalScript(url);
            if (window.Hls) {
                return window.Hls;
            }
        } catch (error) {
            console.warn("HLS 脚本加载失败，尝试下一个地址：", url, error);
        }
    }

    return null;
}

function setupVideoPlayers() {
    const players = Array.from(document.querySelectorAll("[data-video-player]"));

    players.forEach((player) => {
        const video = player.querySelector("video");
        const source = player.dataset.src;
        const toggles = Array.from(player.querySelectorAll("[data-player-toggle]"));
        const muteButton = player.querySelector("[data-player-mute]");
        const fullscreenButton = player.querySelector("[data-player-fullscreen]");
        let initialized = false;
        let hlsInstance = null;

        if (!video || !source) {
            return;
        }

        async function initializeSource() {
            if (initialized) {
                return true;
            }

            initialized = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return true;
            }

            const Hls = await getHlsLibrary();

            if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.ERROR, (_, data) => {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        player.classList.add("has-error");
                    }
                });
                return true;
            }

            player.classList.add("has-error");
            return false;
        }

        async function togglePlayback() {
            const ready = await initializeSource();

            if (!ready) {
                window.alert("当前浏览器暂不支持 HLS 播放，请更换浏览器或稍后再试。 ");
                return;
            }

            if (video.paused) {
                try {
                    await video.play();
                } catch (error) {
                    console.warn("视频播放被浏览器拦截：", error);
                }
            } else {
                video.pause();
            }
        }

        toggles.forEach((toggle) => {
            toggle.addEventListener("click", togglePlayback);
        });

        video.addEventListener("click", togglePlayback);
        video.addEventListener("play", () => player.classList.add("is-playing"));
        video.addEventListener("pause", () => player.classList.remove("is-playing"));
        video.addEventListener("ended", () => player.classList.remove("is-playing"));

        if (muteButton) {
            muteButton.addEventListener("click", () => {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? "取消静音" : "静音";
            });
        }

        if (fullscreenButton) {
            fullscreenButton.addEventListener("click", () => {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (player.requestFullscreen) {
                    player.requestFullscreen();
                }
            });
        }

        window.addEventListener("beforeunload", () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}

ready(() => {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupVideoPlayers();
});
