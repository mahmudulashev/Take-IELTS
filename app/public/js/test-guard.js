/**
 * test-guard.js — statik test sahifalari uchun xato himoyasi
 * ---------------------------------------------------------------
 * Statik test sahifalari React emas, shuning uchun ErrorBoundary
 * ularni himoya qilmaydi. Test 60 daqiqa davom etadi va o'rtada
 * xato chiqsa foydalanuvchi hamma javobini yo'qotadi.
 *
 * Bu skript uchta ish qiladi:
 *   1. Javoblarni doimiy ravishda localStorage'ga qoralama qilib saqlaydi
 *   2. Xato yuz berganda ogohlantirish ko'rsatadi (sahifani buzmasdan)
 *   3. Sahifa qayta yuklanganda qoralamani tiklashni taklif qiladi
 *
 * Har bir test sahifasining <head> qismiga qo'shiladi:
 *   <script src="/js/test-guard.js" defer></script>
 *
 * Mavjud kodga aralashmaydi: hamma narsa IIFE ichida, global
 * o'zgaruvchi yaratmaydi, hech qanday element stilini o'zgartirmaydi.
 */
(function () {
  'use strict';

  var DRAFT_KEY = 'ielts_draft_' + location.pathname;
  var MAX_AGE_MS = 4 * 60 * 60 * 1000;   // 4 soat — undan eski qoralama tiklanmaydi
  var AUTOSAVE_MS = 10000;               // har 10 soniyada
  var TOTAL_Q = 40;

  // ---------------------------------------------------------------
  // Javoblarni yig'ish
  // ---------------------------------------------------------------
  function collectAnswers() {
    var out = {};
    for (var i = 1; i <= TOTAL_Q; i++) {
      try {
        var radio = document.querySelector('input[name="q' + i + '"]:checked');
        if (radio) { out[i] = radio.value; continue; }

        var el = document.getElementById('q' + i);
        if (el && typeof el.value === 'string' && el.value.trim() !== '') {
          out[i] = el.value;
        }
      } catch (e) { /* bitta savol xato bersa qolganlari to'xtamasin */ }
    }
    return out;
  }

  function answerCount(obj) {
    var n = 0;
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) n++;
    return n;
  }

  // Test topshirilganmi? (natija rejimi yoqilgan bo'lsa — ha)
  function isSubmitted() {
    return !!(
      document.querySelector('.main-container.results-mode') ||
      document.body.classList.contains('results-mode') ||
      document.querySelector('.results-mode')
    );
  }

  // ---------------------------------------------------------------
  // Qoralamani saqlash / o'qish
  // ---------------------------------------------------------------
  function saveDraft(reason) {
    if (isSubmitted()) return;
    try {
      var answers = collectAnswers();
      if (answerCount(answers) === 0) return;
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        answers: answers,
        savedAt: Date.now(),
        reason: reason || 'auto'
      }));
    } catch (e) { /* localStorage to'lgan yoki o'chirilgan bo'lishi mumkin */ }
  }

  function readDraft() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || !d.answers) return null;
      if (Date.now() - (d.savedAt || 0) > MAX_AGE_MS) {
        localStorage.removeItem(DRAFT_KEY);
        return null;
      }
      return d;
    } catch (e) { return null; }
  }

  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
  }

  function applyDraft(answers) {
    var restored = 0;
    for (var q in answers) {
      if (!Object.prototype.hasOwnProperty.call(answers, q)) continue;
      var val = answers[q];
      try {
        var radio = document.querySelector('input[name="q' + q + '"][value="' + String(val).replace(/"/g, '\\"') + '"]');
        if (radio) { radio.checked = true; restored++; continue; }

        var el = document.getElementById('q' + q);
        if (el && !el.disabled) {
          el.value = val;
          // Mavjud kod input/change hodisalarini tinglayotgan bo'lsa xabar beramiz
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          restored++;
        }
      } catch (e) { /* bitta javob tiklanmasa qolganlari davom etsin */ }
    }
    return restored;
  }

  // ---------------------------------------------------------------
  // Ogohlantirish paneli (sahifa dizayniga tegmaydi — fixed overlay)
  // ---------------------------------------------------------------
  var bannerShown = false;

  function showBanner(title, message, actionLabel, onAction) {
    if (bannerShown) return;
    bannerShown = true;

    var bar = document.createElement('div');
    bar.setAttribute('role', 'alert');
    bar.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:2147483647',
      'background:#FFF0F0', 'border-bottom:2px solid #FF3131',
      'color:#1a1a1a', 'padding:12px 16px',
      'font-family:"Plus Jakarta Sans",Arial,sans-serif', 'font-size:13px',
      'display:flex', 'align-items:center', 'gap:12px',
      'box-shadow:0 2px 12px rgba(0,0,0,.12)'
    ].join(';');

    var text = document.createElement('div');
    text.style.cssText = 'flex:1;line-height:1.5';
    text.innerHTML = '<strong style="color:#FF3131">' + title + '</strong> ' + message;
    bar.appendChild(text);

    if (actionLabel) {
      var btn = document.createElement('button');
      btn.textContent = actionLabel;
      btn.style.cssText = [
        'flex-shrink:0', 'background:#FF3131', 'color:#fff', 'border:none',
        'padding:8px 16px', 'border-radius:8px', 'font-weight:700',
        'font-size:12px', 'cursor:pointer', 'font-family:inherit'
      ].join(';');
      btn.onclick = function () {
        try { onAction && onAction(); } finally { bar.remove(); bannerShown = false; }
      };
      bar.appendChild(btn);
    }

    var close = document.createElement('button');
    close.textContent = '✕';
    close.setAttribute('aria-label', 'Yopish');
    close.style.cssText = [
      'flex-shrink:0', 'background:transparent', 'border:none',
      'font-size:16px', 'cursor:pointer', 'color:#666', 'padding:4px 8px'
    ].join(';');
    close.onclick = function () { bar.remove(); bannerShown = false; };
    bar.appendChild(close);

    document.body.appendChild(bar);
  }

  // ---------------------------------------------------------------
  // Xatolarni tutish
  // ---------------------------------------------------------------
  function handleError(err) {
    console.error('[test-guard] xato tutildi:', err);
    saveDraft('error');

    var n = answerCount(collectAnswers());
    showBanner(
      'Texnik xato yuz berdi.',
      n > 0
        ? 'Belgilangan ' + n + ' ta javobingiz saqlandi. Sahifani yangilasangiz ular tiklanadi.'
        : 'Sahifani yangilab ko\'ring.',
      'Sahifani yangilash',
      function () { location.reload(); }
    );
  }

  window.addEventListener('error', function (e) {
    // Rasm/audio yuklanmasligi ham 'error' beradi — ularni ajratamiz
    if (e.target && e.target !== window && e.target.tagName) {
      if (e.target.tagName === 'AUDIO' || e.target.tagName === 'SOURCE') {
        showBanner(
          'Audio yuklanmadi.',
          'Internet aloqangizni tekshiring va sahifani yangilang.',
          'Yangilash',
          function () { location.reload(); }
        );
      }
      return;
    }
    if (e.error) handleError(e.error);
  }, true);

  window.addEventListener('unhandledrejection', function (e) {
    handleError(e.reason);
  });

  // ---------------------------------------------------------------
  // Avtosaqlash
  // ---------------------------------------------------------------
  setInterval(function () { saveDraft('auto'); }, AUTOSAVE_MS);

  document.addEventListener('change', function () { saveDraft('change'); }, true);

  // Sahifa yopilishi/yashirilishi oldidan oxirgi marta saqlaymiz
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') saveDraft('hidden');
  });
  window.addEventListener('pagehide', function () { saveDraft('pagehide'); });

  // Tasodifan tabni yopishdan ogohlantirish
  window.addEventListener('beforeunload', function (e) {
    if (isSubmitted()) return;
    if (answerCount(collectAnswers()) === 0) return;
    e.preventDefault();
    e.returnValue = '';
  });

  // ---------------------------------------------------------------
  // Yuklanishda qoralamani tiklashni taklif qilish
  // ---------------------------------------------------------------
  function offerRestore() {
    var draft = readDraft();
    if (!draft) return;
    if (isSubmitted()) { clearDraft(); return; }

    // Sahifada allaqachon javoblar bo'lsa — aralashmaymiz
    if (answerCount(collectAnswers()) > 0) return;

    var n = answerCount(draft.answers);
    if (n === 0) { clearDraft(); return; }

    var mins = Math.round((Date.now() - draft.savedAt) / 60000);
    var when = mins < 1 ? 'hozirgina' : mins + ' daqiqa oldin';

    showBanner(
      'Tugallanmagan test topildi.',
      when + ' saqlangan ' + n + ' ta javobingiz bor.',
      'Javoblarni tiklash',
      function () {
        var r = applyDraft(draft.answers);
        console.info('[test-guard] tiklandi:', r, '/', n);
      }
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(offerRestore, 600); });
  } else {
    setTimeout(offerRestore, 600);
  }

  // Test topshirilgach qoralama keraksiz
  document.addEventListener('click', function () {
    setTimeout(function () { if (isSubmitted()) clearDraft(); }, 400);
  }, true);

})();
