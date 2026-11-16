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
     Currently reading (live from the reading corner; static HTML is the fallback)
     --------------------------------------------------------------------- */
  (function () {
    fetch('https://cheropsreadingcorner-13fm.vercel.app/api/currently-reading')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (d) {
        var b = d.books && d.books[0];
        if (!b) return;
        document.getElementById('reading-title').textContent = b.title;
        document.getElementById('reading-author').textContent = b.author;
        document.getElementById('reading-bar').style.width = b.progress + '%';
        window.__reading = b.title;
      })
      .catch(function () {});
  })();

  /* ---------------------------------------------------------------------
     Albums shelf: drag to scroll with a mouse
     --------------------------------------------------------------------- */
  (function () {
    var shelf = document.querySelector('.albums__grid');
    if (!shelf) return;
    var down = false, moved = false, startX = 0, startLeft = 0;
    shelf.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = shelf.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 5) { moved = true; shelf.style.scrollSnapType = 'none'; }
      if (moved) shelf.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false; shelf.style.scrollSnapType = '';
    });
    shelf.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  })();

  /* ---------------------------------------------------------------------
     Music player (30s Spotify previews)
     --------------------------------------------------------------------- */
  (function () {
    var TRACKS = [
      { title: 'Sonini', artist: 'Sun-El Musician, Simmy, Lelo Kamau', color: '#FFD21F', id: '7uorcEb4It46F3KkWhnjwb', cover: 'ab67616d0000b273bb00024467b367bc5d1b809a', preview: '827277e828e54d2b4991ec32611f635cd9a18d52' },
      { title: 'BODYGUARD', artist: 'Beyoncé', color: '#2B4FE0', id: '6Y4rniIxibegzsg8cdWAWV', cover: 'ab67616d0000b273208e593c3565dae1295b5a26', preview: '8138560bb5a1ce76a00eabd304d22b89bf3efc6d' },
      { title: 'I Love You', artist: 'Snoh Aalegra', color: '#9B6BFF', id: '0yXMe310dgpquMTa7OmHKk', cover: 'ab67616d0000b273e2d08741179d2f68a41b1cb4', preview: '258757c2df00c954c07417fc3a3f1d9f09347d7c' },
      { title: 'world is yours.', artist: 'Brent Faiyaz', color: '#F0443A', id: '61LIrROTdBzB2wOsgFNODa', cover: 'ab67616d0000b273d8acadd7be5455ea09c06cf9', preview: '92f3ca939ccf9af990bc14feaaefa5fa30bb3001' },
      { title: 'White Noise', artist: 'Disclosure, AlunaGeorge', color: '#1FA8FF', id: '5EWFuo4ObEnfndc57sTuIo', cover: 'ab67616d0000b273786201dca187d2b0c956c24b', preview: '6271ceeefdd17d8180fb1823704acf8943bdfce3' }
    ];

    var player = $('.player'), list = $('.tracks', player);
    var playing = 0, isPlaying = false, audio = null;

    var rows = TRACKS.map(function (t, i) {
      var li = document.createElement('li');
      li.innerHTML = '<button type="button" class="track" data-cur="1"></button>';
      var btn = $('.track', li);
      btn.style.setProperty('--dot', t.color);
      btn.setAttribute('aria-label', t.title + ' · ' + t.artist);
      btn.addEventListener('click', function () { play(i); });
      list.appendChild(li);
      return btn;
    });

    function render() {
      var t = TRACKS[playing];
      player.style.setProperty('--np', t.color);
      player.classList.toggle('is-playing', isPlaying);
      player.style.setProperty('--cover', 'url("https://i.scdn.co/image/' + t.cover + '")');
      $('.player__status', player).textContent = '0' + (playing + 1) + ' / 0' + TRACKS.length + ' · ' + (isPlaying ? 'NOW PLAYING' : 'ON REPEAT');
      $('.player__title', player).textContent = t.title;
      $('.player__artist', player).textContent = t.artist;
      $('.player__link', player).href = 'https://open.spotify.com/track/' + t.id;
      var btn = $('.player__play', player);
      btn.textContent = isPlaying ? 'II' : '▶';
      btn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
      rows.forEach(function (row, i) {
        row.classList.toggle('is-current', i === playing);
        row.setAttribute('aria-current', i === playing);
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
