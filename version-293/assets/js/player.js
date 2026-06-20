function setupMoviePlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var ready = false;
    var loading = false;

    if (!video || !button || !source) {
        return;
    }

    function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    function loadScript(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector("script[data-hls-loader]");
        if (existing) {
            existing.addEventListener("load", callback, { once: true });
            return;
        }
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        script.async = true;
        script.setAttribute("data-hls-loader", "true");
        script.addEventListener("load", callback, { once: true });
        document.head.appendChild(script);
    }

    function attach(done) {
        if (ready || loading) {
            done();
            return;
        }
        loading = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            ready = true;
            loading = false;
            done();
            return;
        }
        loadScript(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    ready = true;
                    loading = false;
                    done();
                });
                hls.on(window.Hls.Events.ERROR, function () {
                    loading = false;
                });
            } else {
                video.src = source;
                ready = true;
                loading = false;
                done();
            }
        });
    }

    function start() {
        button.classList.add("hidden");
        attach(playVideo);
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (!ready) {
            start();
        }
    });
}
