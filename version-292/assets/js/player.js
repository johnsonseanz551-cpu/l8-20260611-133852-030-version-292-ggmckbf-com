(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function attachStream(video, source, shell) {
        if (video.dataset.ready === 'true') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            shell._hls = hls;
        } else {
            video.src = source;
        }

        video.dataset.ready = 'true';
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('.js-play-button');
            var source = shell.getAttribute('data-source');

            if (!video || !source) {
                return;
            }

            function play() {
                attachStream(video, source, shell);
                if (button) {
                    button.hidden = true;
                }
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        if (button) {
                            button.hidden = false;
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }

            shell.addEventListener('click', function (event) {
                if (event.target === video) {
                    return;
                }
                if (button && !button.hidden) {
                    play();
                }
            });
        });
    });
})();
