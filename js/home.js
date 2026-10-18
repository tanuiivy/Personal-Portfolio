// Home page interactions: project hover previews, rotating greeting / word.
// Relies on js/cursor.js for the custom cursor and party mode.
(function () {
  var GREETS = ['Hey', 'Habari', 'Hola', 'Salut', 'Ciao', 'Hallo', 'Oi'];
  var WORDS = [['Design', '#E0368A'], ['Code', '#0098A6'], ['Tinker', '#D4FF3A'], ['Make', '#7B5CFF']];
  var IVY_PREVIEW = { color: '#F6F4F1', img: 'assets/images/ivy-photo.jpeg', ivy: true };

  var page = document.querySelector('.page');
  var cur = window.IvyCursor;
  if (!page || !cur) return;

  var preview = page.querySelector('.preview');
  var greetEl = page.querySelector('.hero-greet');
  var wordEl = page.querySelector('.hero-word');
  var ivyEl = page.querySelector('.hero-ivy');
  var rows = Array.prototype.slice.call(page.querySelectorAll('.work-row'));

  var state = { greet: 0, word: 0, row: null, ivy: false };

  function set(patch) {
    for (var k in patch) state[k] = patch[k];
    cur.render();
  }

  function activePreview() {
    if (state.ivy) return IVY_PREVIEW;
    if (state.row == null) return null;
    var el = rows[state.row];
    return { color: el.dataset.previewColor, img: el.dataset.preview };
  }

  // The cursor hides while a preview card is showing; party hue follows the word.
  cur.hidden = function () { return !!activePreview(); };
  cur.hueIndex = function () { return state.word; };

  cur.onChange(function (C) {
    var row = activePreview(), w = WORDS[state.word];

    greetEl.textContent = GREETS[state.greet] + ',';
    wordEl.textContent = w[0];
    wordEl.style.color = w[1];

    var ps = preview.style;
    var rot = row ? (row.ivy ? -6 : (state.row % 2 ? 4 : -4)) : 0;
    ps.left = (C.x + 40) + 'px';
    ps.top = C.y + 'px';
    ps.width = (row && row.ivy ? 260 : (row && row.img ? 420 : 300)) + 'px';
    ps.height = (row && row.ivy ? 260 : (row && row.img ? 238 : 220)) + 'px';
    ps.backgroundColor = row ? row.color : '#333';
    ps.backgroundImage = row && row.img ? 'url("' + row.img + '")' : 'none';
    ps.opacity = row ? 1 : 0;
    ps.transform = 'rotate(' + rot + 'deg) scale(' + (row ? 1 : 0.6) + ')';
    preview.textContent = row && row.img ? '' : 'project preview';
  });

  function nextWord() { set({ word: (state.word + 1) % WORDS.length }); }
  cur.onTick(nextWord);

  page.addEventListener('pointerleave', function () { set({ row: null }); });

  greetEl.addEventListener('click', function () { set({ greet: (state.greet + 1) % GREETS.length }); });

  wordEl.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') nextWord(); });
  wordEl.addEventListener('click', nextWord);

  // Hovering "Ivy" shows a photo; on touch, tapping toggles it.
  var lastPointer = 'mouse';
  page.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType; }, true);
  ivyEl.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') set({ ivy: true }); });
  ivyEl.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') set({ ivy: false }); });
  ivyEl.addEventListener('click', function (e) {
    if ((e.pointerType || lastPointer) !== 'mouse') set({ ivy: !state.ivy });
  });

  rows.forEach(function (el, i) {
    el.addEventListener('pointerenter', function () { set({ row: i }); });
    el.addEventListener('pointerleave', function () { set({ row: null }); });
  });

  // Preload the preview images so the first hover isn't blank.
  [IVY_PREVIEW.img].concat(rows.map(function (el) { return el.dataset.preview; })).forEach(function (src) {
    new Image().src = src;
  });

  cur.render();
})();
