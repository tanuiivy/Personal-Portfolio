// About page interactions: photo carousel, bio highlights, Professional/Personal
// switcher and music player. Relies on js/cursor.js for the cursor.
(function () {
  var page = document.querySelector('.page');
  if (!page) return;
  var $ = function (sel, root) { return (root || page).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || page).querySelectorAll(sel)); };

  // Remember the last pointer type so click handlers can tell taps from mouse clicks.
  var lastPointer = 'mouse';
  page.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType; }, true);
  function isMouse(e) { return (e.pointerType || lastPointer) === 'mouse'; }

  /* ---------------------------------------------------------------------
     Photo carousel: auto-advances every 3.5s unless hovered
     --------------------------------------------------------------------- */
  (function () {
    var root = $('.carousel'), slides = $$('.carousel__slide', root), count = $('.carousel__count', root);
    var slide = 0, hover = false;
    function show(i) {
      slide = (i + slides.length) % slides.length;
      slides.forEach(function (el, j) { el.classList.toggle('is-active', j === slide); });
      count.textContent = '0' + (slide + 1) + ' / 0' + slides.length;
    }
    root.addEventListener('pointerenter', function () { hover = true; });
    root.addEventListener('pointerleave', function () { hover = false; });
    $('.carousel__prev', root).addEventListener('click', function () { show(slide - 1); });
    $('.carousel__next', root).addEventListener('click', function () { show(slide + 1); });
    setInterval(function () { if (!hover) show(slide + 1); }, 3500);
  })();

  /* ---------------------------------------------------------------------
     Bio highlights: sweep in on mouse hover, toggle on tap
     --------------------------------------------------------------------- */
  (function () {
    var bio = $('.bio');
    bio.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') bio.classList.add('is-on'); });
    bio.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') bio.classList.remove('is-on'); });
    bio.addEventListener('click', function (e) { if (!isMouse(e)) bio.classList.toggle('is-on'); });
  })();

  /* ---------------------------------------------------------------------
     Professional / Personal switcher
     --------------------------------------------------------------------- */
  (function () {
    var sw = $('.switch'), hint = $('.sides__hint');
    $$('.switch__side', sw).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var side = btn.dataset.side;
        sw.dataset.side = side;
        sw.classList.remove('is-open');
        hint.textContent = 'SWITCH SIDES ANYTIME';
        $$('.switch__side', sw).forEach(function (b) {
          var on = b === btn;
          b.setAttribute('aria-expanded', on);
          document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
        });
      });
    });
  })();

  /* ---------------------------------------------------------------------
     Music player (30s Spotify previews)
     --------------------------------------------------------------------- */
  (function () {
    var TRACKS = [
      { title: 'Sonini', artist: 'Sun-El Musician, Simmy, Lelo Kamau', color: '#F2D21B', id: '7uorcEb4It46F3KkWhnjwb', cover: 'ab67616d0000b273bb00024467b367bc5d1b809a', preview: '827277e828e54d2b4991ec32611f635cd9a18d52' },
      { title: 'BODYGUARD', artist: 'Beyoncé', color: '#B22234', id: '6Y4rniIxibegzsg8cdWAWV', cover: 'ab67616d0000b273208e593c3565dae1295b5a26', preview: '8138560bb5a1ce76a00eabd304d22b89bf3efc6d' },
      { title: 'Dollar And A Dream III', artist: 'J. Cole', color: '#9A6A44', id: '1Yl4UBgyoHPgyne7rEsFZp', cover: 'ab67616d0000b27399da48a530f6ca2ef86da3cc', preview: '8a9e4930bd992c099c21dd2841ae26c8eafd70ed' },
      { title: 'As', artist: 'Stevie Wonder', color: '#E8642C', id: '13toFl1UwJPsRxDiD9jgtn', cover: 'ab67616d0000b2732fee61bfec596bb6f5447c50', preview: '61c2cd8a2a552a5c528e9eff51a5b3e2307a9b03' }
    ];

    var player = $('.player'), list = $('.tracks', player);
    var playing = 0, isPlaying = false, audio = null;

    var rows = TRACKS.map(function (t, i) {
      var li = document.createElement('li');
      li.innerHTML =
        '<button type="button" class="track" data-cur="1">' +
          '<span class="track__n">0' + (i + 1) + '</span>' +
          '<span class="track__title"></span>' +
          '<span><span class="eq"><span></span><span></span><span></span></span></span>' +
        '</button>';
      $('.track__title', li).textContent = t.title + ' · ' + t.artist;
      $('.track', li).addEventListener('click', function () { play(i); });
      list.appendChild(li);
      return $('.track', li);
    });

    function render() {
      var t = TRACKS[playing];
      player.style.setProperty('--np', t.color);
      player.classList.toggle('is-playing', isPlaying);
      player.style.setProperty('--cover', 'url("https://i.scdn.co/image/' + t.cover + '")');
      $('.player__status', player).textContent = isPlaying ? 'NOW PLAYING' : 'ON REPEAT';
      $('.player__title', player).textContent = t.title;
      $('.player__artist', player).textContent = t.artist;
      $('.player__link', player).href = 'https://open.spotify.com/track/' + t.id;
      var btn = $('.player__play', player);
      btn.textContent = isPlaying ? 'II' : '▶';
      btn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
      rows.forEach(function (row, i) {
        row.style.color = i === playing ? TRACKS[i].color : '#FFFFFF';
        $('.eq', row).classList.toggle('is-on', i === playing && isPlaying);
      });
    }

    function getAudio() {
      if (!audio) {
        audio = new Audio();
        audio.preload = 'none';
        audio.addEventListener('ended', function () { play((playing + 1) % TRACKS.length); });
        audio.addEventListener('pause', function () { if (isPlaying && !audio.ended) { isPlaying = false; render(); } });
        audio.addEventListener('play', function () { if (!isPlaying) { isPlaying = true; render(); } });
      }
      return audio;
    }

    function fail() { isPlaying = false; render(); }

    function play(i) {
      var au = getAudio();
      if (i === playing && au.src) {
        if (au.paused) au.play().catch(fail); else au.pause();
        return;
      }
      au.src = 'https://p.scdn.co/mp3-preview/' + TRACKS[i].preview;
      playing = i;
      isPlaying = true;
      render();
      au.play().catch(fail);
    }

    $('.player__play', player).addEventListener('click', function () { play(playing); });
    $('.player__prev', player).addEventListener('click', function () { play((playing + TRACKS.length - 1) % TRACKS.length); });
    $('.player__next', player).addEventListener('click', function () { play((playing + 1) % TRACKS.length); });
    render();
  })();
})();
