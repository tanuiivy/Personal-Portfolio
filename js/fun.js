// Easter eggs: click sparkles, logo clicks, typed words ("ivy", "hello", "books"),
// konami code, idle nudge, tab title, and the scratch-to-reveal footer pill.
(function () {
  if (window.__ivyFun) return; window.__ivyFun = true;
  var C = ['#E0368A', '#0098A6', '#7B5CFF', '#D4FF3A', '#E85D00'];
  var mono = "'JetBrains Mono',monospace";
  function el(css, txt) { var d = document.createElement('div'); d.style.cssText = css; if (txt) d.textContent = txt; document.body.appendChild(d); return d; }
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) toastEl = el('position:fixed;left:50%;bottom:32px;transform:translate(-50%,120px);background:#121212;color:#FFFFFF;font-family:' + mono + ';font-size:14px;padding:14px 22px;border-radius:999px;border:2px solid #121212;box-shadow:4px 4px 0 #D4FF3A;z-index:10000;pointer-events:none;transition:transform .35s cubic-bezier(.3,1.6,.5,1);white-space:nowrap;');
    toastEl.textContent = msg;
    requestAnimationFrame(function () { toastEl.style.transform = 'translate(-50%,0)'; });
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.style.transform = 'translate(-50%,120px)'; }, 2600);
  }
  function burst(x, y, n, big) {
    for (var i = 0; i < n; i++) (function (i) {
      var a = Math.random() * Math.PI * 2, r = (big ? 140 : 60) + Math.random() * (big ? 160 : 50), s = (big ? 22 : 12) + Math.random() * (big ? 26 : 12);
      var d = el('position:fixed;left:' + x + 'px;top:' + y + 'px;font-size:' + s + 'px;line-height:1;color:' + C[i % C.length] + ';pointer-events:none;z-index:9999;transform:translate(-50%,-50%) scale(.2);transition:transform .7s cubic-bezier(.2,.8,.3,1),opacity .7s;-webkit-text-stroke:1px #121212;', '\u2726');
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        d.style.transform = 'translate(calc(-50% + ' + Math.cos(a) * r + 'px),calc(-50% + ' + Math.sin(a) * r + 'px)) scale(1) rotate(' + (Math.random() * 180 - 90) + 'deg)';
        d.style.opacity = '0';
      }); });
      setTimeout(function () { d.remove(); }, 750);
    })(i);
  }
  // ivy head rain
  var heads = false;
  function headRain() {
    if (heads) return; heads = true;
    for (var i = 0; i < 28; i++) (function (i) { setTimeout(function () {
      var w = 50 + Math.random() * 60, x = Math.random() * innerWidth, dur = 1.8 + Math.random() * 1.4, rot = Math.random() * 40 - 20, spin = Math.random() * 120 - 60;
      var d = document.createElement('img'); d.src = 'assets/images/ivy-head-2.png'; d.alt = '';
      d.style.cssText = 'position:fixed;left:' + (x - w / 2) + 'px;top:' + (-w * 1.4) + 'px;width:' + w + 'px;height:auto;pointer-events:none;z-index:9999;filter:drop-shadow(3px 4px 0 rgba(18,18,18,.3));transform:rotate(' + rot + 'deg);';
      document.body.appendChild(d);
      var a = d.animate([
        { transform: 'translateY(0) rotate(' + rot + 'deg)' },
        { transform: 'translateY(' + (innerHeight + w * 2.8) + 'px) rotate(' + (rot + spin) + 'deg)' }
      ], { duration: dur * 1000, easing: 'cubic-bezier(.45,0,.9,.6)', fill: 'forwards' });
      a.onfinish = function () { d.remove(); };
    }, i * 120 + Math.random() * 100); })(i);
    setTimeout(function () { heads = false; }, 6500);
    toast('hi, it\'s me \u2726');
  }
  // "coming soon" buttons: <button data-soon="message">
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-soon]');
    if (b) toast(b.getAttribute('data-soon'));
  });
  // click sparkles
  document.addEventListener('pointerdown', function (e) { burst(e.clientX, e.clientY, 7, false); });
  // logo: 5 quick clicks
  var logoN = 0, logoT;
  document.addEventListener('click', function (e) {
    var logo = e.target.closest && e.target.closest('a[aria-label="Ivy, home"]');
    if (!logo) return;
    logoN++; clearTimeout(logoT); logoT = setTimeout(function () { logoN = 0; }, 900);
    if (logoN >= 3) e.preventDefault();
    if (logoN === 5) { logoN = 0; burst(e.clientX, e.clientY, 28, true); toast('okay okay, you found me \u2726'); }
  }, true);
  // typed words + konami
  var buf = '', kon = [], K = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'];
  function root() { return document.querySelector('.page') || document.body; }
  document.addEventListener('keydown', function (e) {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    var k = (e.key || '').toLowerCase();
    kon.push(k); kon = kon.slice(-10);
    if (kon.join() === K.join()) {
      kon = []; var r = root(); r.style.transition = 'filter .6s'; r.style.filter = 'invert(1) hue-rotate(180deg)';
      toast('cheat code unlocked: night mode \u263e'); setTimeout(function () { r.style.filter = ''; }, 6000);
    }
    if (k.length !== 1) return;
    buf = (buf + k).slice(-8);
    if (/hello$/.test(buf) || /habari$/.test(buf)) { var hb = /habari$/.test(buf); buf = ''; toast(hb ? 'nzuri sana! \u2726' : 'hello to you too \u2726'); burst(innerWidth / 2, innerHeight / 2, 24, true); }
    if (/ivy$/.test(buf)) { buf = ''; headRain(); }
    if (/books$/.test(buf)) { buf = ''; toast('currently reading: I See Buildings Fall Like Lightning'); }
  });
  // idle nudge
  var idleT; function idle() { clearTimeout(idleT); idleT = setTimeout(function () { toast('still there? try typing "ivy"'); }, 25000); }
  ['pointermove', 'keydown', 'scroll'].forEach(function (ev) { addEventListener(ev, idle, { passive: true }); }); idle();
  // tab title
  var t0 = document.title;
  document.addEventListener('visibilitychange', function () { document.title = document.hidden ? 'come back! \u2726' : t0; });
  try { console.log('%chi, curious dev \u2726 say hi: ivycherop0@gmail.com', 'font:600 14px monospace;background:#D4FF3A;color:#121212;padding:6px 10px;border-radius:6px;'); } catch (e) {}

  // scratch-to-reveal
  function scratch(host) {
    host.__scr = true;
    var cv = document.createElement('canvas'), r = host.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    var w = host.offsetWidth, h = host.offsetHeight; if (!w || !h) { host.__scr = false; return; }
    cv.width = w * dpr; cv.height = h * dpr;
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border-radius:999px;cursor:none;touch-action:none;transition:opacity .5s;';
    var x = cv.getContext('2d'); x.scale(dpr, dpr);
    x.fillStyle = '#E0368A'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#FFFFFF'; x.font = "600 12px 'JetBrains Mono',monospace"; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('\u2726 SCRATCH ME \u2726', w / 2, h / 2 + 1);
    x.globalCompositeOperation = 'destination-out';
    var down = false, last = null, done = false;
    function at(e) { var b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * w / b.width, (e.clientY - b.top) * h / b.height]; }
    function draw(e) {
      if (done) return; var p = at(e);
      x.lineWidth = 22; x.lineCap = 'round'; x.beginPath(); x.moveTo((last || p)[0], (last || p)[1]); x.lineTo(p[0], p[1]); x.stroke(); last = p;
      var d = x.getImageData(0, 0, cv.width, cv.height).data, c = 0; for (var i = 3; i < d.length; i += 16) if (d[i] < 10) c++;
      if (c / (d.length / 16) > 0.5) { done = true; cv.style.opacity = '0'; cv.style.pointerEvents = 'none'; var b = cv.getBoundingClientRect(); burst(b.left + b.width / 2, b.top + b.height / 2, 16, true); }
    }
    cv.addEventListener('pointermove', function (e) { draw(e); });
    cv.addEventListener('pointerleave', function () { last = null; });
    host.appendChild(cv);
  }
  setInterval(function () { document.querySelectorAll('[data-scratch]').forEach(function (h) { if (!h.__scr || !h.querySelector('canvas')) scratch(h); }); }, 600);
})();
