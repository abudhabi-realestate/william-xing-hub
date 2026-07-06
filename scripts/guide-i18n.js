/** Bilingual markdown guide loader — shares site-lang with SiteI18n */
(function () {
  const STORAGE_KEY = 'site-lang';

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || 'zh';
  }

  function setLang(next) {
    if (next !== 'zh' && next !== 'en') return;
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next === 'en' ? 'en' : 'zh-CN';
    applyMeta();
    loadMarkdown();
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === next);
      btn.setAttribute('aria-pressed', btn.dataset.lang === next ? 'true' : 'false');
    });
  }

  function applyMeta() {
    const cfg = window.GUIDE_I18N;
    if (!cfg) return;
    const lang = getLang();
    const meta = cfg[lang] || cfg.zh;
    if (meta.pageTitle) document.title = meta.pageTitle;
    const h1 = document.querySelector('.hero h1');
    if (h1 && meta.h1) h1.textContent = meta.h1;
    const heroP = document.querySelector('.hero p');
    if (heroP && meta.desc) heroP.textContent = meta.desc;
    const label = document.querySelector('.hero-label');
    if (label && meta.label) label.textContent = meta.label;
    const back = document.querySelector('.back');
    if (back && meta.back) back.textContent = meta.back;
    const loading = document.getElementById('content');
    if (loading && loading.classList.contains('loading') && meta.loading) {
      loading.textContent = meta.loading;
    }
    const err = meta.loadError || 'Failed to load. Please refresh.';
    window.__guideLoadError = err;
  }

  function loadMarkdown() {
    const cfg = window.GUIDE_I18N;
    if (!cfg || typeof marked === 'undefined') return;
    const lang = getLang();
    const path = lang === 'en' ? cfg.pathEn : cfg.pathZh;
    const el = document.getElementById('content');
    if (!el) return;
    el.classList.add('loading');
    el.textContent = (cfg[lang] || cfg.zh).loading || 'Loading…';

    fetch(path)
      .then(function (r) {
        if (!r.ok) throw new Error('load failed');
        return r.text();
      })
      .then(function (md) {
        const body = md.replace(/^#[^\n]+\n+/m, '');
        el.innerHTML = marked.parse(body);
        el.classList.remove('loading');
      })
      .catch(function () {
        el.textContent = window.__guideLoadError || 'Load failed.';
        el.classList.remove('loading');
      });
  }

  function bindSwitch() {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        setLang(btn.dataset.lang);
      });
    });
  }

  window.GuideI18n = {
    getLang,
    setLang,
    init: function () {
      bindSwitch();
      applyMeta();
      loadMarkdown();
      const lang = getLang();
      document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
        btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
      });
    },
  };
})();
