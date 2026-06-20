(function () {
  window.startMoviePlayer = function (videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var initialized = false;
    var hlsInstance = null;

    if (!video || !overlay || !source) {
      return;
    }

    function localModuleUrl() {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; i -= 1) {
        var src = scripts[i].getAttribute('src') || '';
        if (src.indexOf('player.js') !== -1) {
          return new URL('hls.js', scripts[i].src).href;
        }
      }
      return './assets/hls.js';
    }

    function attachWithHls(HlsClass) {
      hlsInstance = new HlsClass({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    }

    async function bindSource() {
      if (initialized) {
        return;
      }
      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        attachWithHls(window.Hls);
        return;
      }

      try {
        var module = await import(localModuleUrl());
        var HlsClass = module.H;
        if (HlsClass && HlsClass.isSupported()) {
          attachWithHls(HlsClass);
          return;
        }
      } catch (error) {
        video.src = source;
        return;
      }

      video.src = source;
    }

    async function playVideo() {
      await bindSource();
      overlay.classList.add('is-hidden');
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  };
}());
