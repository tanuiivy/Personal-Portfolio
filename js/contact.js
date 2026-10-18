// Contact page interactions: rotating "Let's ___" word, click-to-copy email.
// Relies on js/cursor.js for the custom cursor and party mode.
(function () {
  var WORDS = [['Talk', '#E0368A'], ['Build', '#0098A6'], ['Read', '#E85D00'], ['Make', '#7B5CFF'], ['Collab', '#6B8F00']];

  var page = document.querySelector('.page');
  var cur = window.IvyCursor;
  if (!page || !cur) return;

  /* Rotating word: hover (mouse) or tap to change; party mode cycles it */
  var wordEl = page.querySelector('.contact__word');
  var word = 0;
  function renderWord() {
    wordEl.textContent = WORDS[word][0] + '.';
    wordEl.style.color = WORDS[word][1];
  }
  function nextWord() { word = (word + 1) % WORDS.length; renderWord(); cur.render(); }
  wordEl.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') nextWord(); });
  wordEl.addEventListener('click', nextWord);
  cur.hueIndex = function () { return word; };
  cur.onTick(function () { word = (word + 1) % WORDS.length; renderWord(); });

  /* Email card: copy the address, flash a confirmation */
  var card = page.querySelector('.email-card');
  var hint = card.querySelector('.email-card__hint');
  var address = card.querySelector('.email-card__address');
  var email = card.dataset.email, timer;
  card.addEventListener('click', function () {
    try { navigator.clipboard && navigator.clipboard.writeText(email); } catch (e) {}
    address.textContent = 'Copied! ✦';
    hint.textContent = 'DONE ✓';
    clearTimeout(timer);
    timer = setTimeout(function () {
      address.textContent = email;
      hint.textContent = 'CLICK TO COPY';
    }, 1400);
  });

  renderWord();
})();
