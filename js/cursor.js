// Shared custom cursor + "party" mode (type "party" to toggle).
// Pages can hook in through window.IvyCursor:
//   IvyCursor.hidden   -> function returning true to hide the cursor (e.g. while a preview shows)
//   IvyCursor.hueIndex -> function returning the number that drives the party hue
//   IvyCursor.onChange(fn) / IvyCursor.onTick(fn) -> called after every update / party tick
(function () {
  var page = document.querySelector('.page');
  var cursor = page && page.querySelector('.cursor');
  if (!cursor) return;

  var changeFns = [], tickFns = [];
  var C = window.IvyCursor = {
    x: 0, y: 0, on: false, hot: false, party: false, tick: 0,
    hidden: function () { return false; },
    hueIndex: function () { return C.tick; },
    onChange: function (fn) { changeFns.push(fn); },
    onTick: function (fn) { tickFns.push(fn); },
    render: render
  };

  function render() {
    var size = C.party ? 96 : (C.hot ? 60 : 44);
    var cs = cursor.style;
    cs.left = C.x + 'px';
    cs.top = C.y + 'px';
    cs.width = cs.height = size + 'px';
    cs.marginLeft = (-size * 0.2) + 'px';
    cs.marginTop = (-size * 0.03) + 'px';
    cs.opacity = C.on && !C.hidden() ? 1 : 0;
    cs.transform = 'rotate(' + (C.hot ? 14 : 0) + 'deg)';
    cs.filter = C.party ? 'hue-rotate(' + (C.hueIndex() * 70 % 360) + 'deg)' : 'drop-shadow(2px 3px 0 rgba(18,18,18,.25))';
    changeFns.forEach(function (fn) { fn(C); });
  }

  // Track the pointer relative to the page box (k corrects for any CSS scaling).
  function track(e) {
    var r = page.getBoundingClientRect(), k = r.width / page.offsetWidth || 1;
    var t = e.target.closest && e.target.closest('[data-cur]');
    C.x = (e.clientX - r.left) / k;
    C.y = (e.clientY - r.top) / k;
    C.on = e.pointerType === 'mouse';
    C.hot = !!t;
    render();
  }
  page.addEventListener('pointermove', track);
  // Taps don't always fire pointermove, so position on press too.
  page.addEventListener('pointerdown', track);
  page.addEventListener('pointerleave', function () { C.on = false; render(); });

  var keys = '';
  window.addEventListener('keydown', function (e) {
    keys = (keys + (e.key || '').toLowerCase()).slice(-5);
    if (keys === 'party') { keys = ''; C.party = !C.party; render(); }
  });
  setInterval(function () {
    if (!C.party) return;
    C.tick++;
    tickFns.forEach(function (fn) { fn(C); });
    render();
  }, 380);

  page.classList.add('has-cursor');
  render();
})();
