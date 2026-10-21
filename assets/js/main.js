/* Picoteo's — interacción y animaciones */
(function () {
  'use strict';

  const doc = document.documentElement;
  doc.classList.add('js');

  const mqMobile = window.matchMedia('(max-width: 899px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------------------------------------------------------
     Datos: "Top ventas" (selección del diseño móvil)
     --------------------------------------------------------- */
  const TOP_VENTAS = [
    { n: 'Croquetas de la casa', d: 'Jamón ibérico · bechamel cremosa · 8 uds', r: '1/4', p: '7,50€', img: 'assets/img/m-foto-croquetas.jpg' },
    { n: 'Paella de verduras', d: 'Arroz, verduras frescas y alioli de la casa', r: '1/4', p: '7,50€', img: 'assets/img/m-foto-paella.jpg' },
    { n: 'Tortilla de patatas', d: 'Jamón ibérico · bechamel cremosa · 8 uds', r: '1/4', p: '7,50€', img: 'assets/img/m-foto-tortilla.jpg' },
    { n: 'Croquetas de la casa', d: 'Jamón ibérico · bechamel cremosa · 8 uds', r: '1/4', p: '7,50€', img: 'assets/img/m-foto-croquetas2.jpg' },
    { n: 'Patatas fritas', d: 'Corte fino, doradas y recién hechas', r: '1/4', p: '7,50€', img: 'assets/img/m-foto-patatas.jpg' },
    { n: 'Croquetas de la casa', d: 'Bechamel suave, nuez moscada y jamón', r: '1/4', p: '7,50€', img: 'assets/img/m-foto-croquetas3.jpg' },
    { n: 'Tortilla de patatas', d: 'Patata, cebolla y huevo de corral', r: '1/4', p: '7,50€', img: 'assets/img/m-foto-tortilla2.jpg' },
    { n: 'Serranito', d: 'Lomo ibérico · pimiento · jamón y patatas', r: '1/4', p: '7,50€', img: 'assets/img/m-foto-serranito.jpg' }
  ];

  const OPINIONES = [
    { a: 'M', n: 'María G.' },
    { a: 'P', n: 'Pablo S.' },
    { a: 'M', n: 'Marta G.' },
    { a: 'A', n: 'Ana R.' }
  ];
  const OPINION_TXT = 'Las croquetas son de las mejores que he probado. Llamo siempre y en quince minutos lo tengo todo.';

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------------------------------------------------
     Carta con fotos (pestañas)
     --------------------------------------------------------- */
  function initCartaFotos() {
    const tabsEl = $('[data-tabs]');
    const grid = $('[data-platos]');
    if (!tabsEl || !grid || !window.CARTA_FOTOS) return;
    const catTitle = $('[data-cat-title]');
    const ink = $('.tabs__ink', tabsEl);

    const cats = [{ cat: 'Top Ventas', items: TOP_VENTAS }].concat(window.CARTA_FOTOS);
    const mobileLabel = (s) => s.charAt(0) + s.slice(1).toLowerCase();

    cats.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tab';
      b.id = 'tab-' + i;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', 'false');
      b.setAttribute('aria-controls', 'platos');
      b.tabIndex = -1;
      b.dataset.index = i;
      b.innerHTML = '<span class="d">' + esc(c.cat) + '</span><span class="m">' + esc(mobileLabel(c.cat)) + '</span>';
      tabsEl.appendChild(b);
    });
    grid.id = 'platos';
    const tabs = $$('.tab', tabsEl);

    const cardHTML = (it, i) =>
      '<article class="plato" style="--i:' + i + '">' +
        '<div class="plato__img"><img class="is-loading" src="' + esc(it.img) + '" alt="' + esc(it.n) + '" loading="lazy" decoding="async"></div>' +
        '<div class="plato__info">' +
          '<h4 class="plato__name">' + esc(it.n) + '</h4>' +
          (it.d ? '<p class="plato__desc">' + esc(it.d) + '</p>' : '') +
          '<div class="plato__meta">' +
            (it.r ? '<span class="plato__rac">' + esc(it.r) + '</span>' : '') +
            '<span class="plato__price">' + esc(it.p) + '</span>' +
          '</div>' +
        '</div>' +
      '</article>';

    function placeInk(tab, instant) {
      if (!ink || !tab) return;
      if (instant) ink.style.transition = 'none';
      ink.style.width = tab.offsetWidth + 'px';
      ink.style.height = tab.offsetHeight + 'px';
      ink.style.transform = 'translate(' + tab.offsetLeft + 'px,' + tab.offsetTop + 'px)';
      if (instant) { void ink.offsetWidth; ink.style.transition = ''; }
    }

    let current = -1;
    function select(i, opts = {}) {
      if (i === current) return;
      const first = current === -1;
      current = i;
      tabs.forEach((t, k) => {
        const on = k === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      grid.setAttribute('aria-labelledby', tabs[i].id);
      placeInk(tabs[i], first);
      const render = () => {
        grid.innerHTML = cats[i].items.map(cardHTML).join('');
        $$('img', grid).forEach((img) => {
          if (img.complete) img.classList.remove('is-loading');
          else img.addEventListener('load', () => img.classList.remove('is-loading'), { once: true });
        });
        if (catTitle) catTitle.textContent = cats[i].cat;
        grid.classList.remove('is-leaving');
      };
      if (first || reduceMotion) render();
      else {
        grid.classList.add('is-leaving');
        setTimeout(render, 220);
      }
      if (opts.focus) tabs[i].focus();
    }

    tabsEl.addEventListener('click', (e) => {
      const t = e.target.closest('.tab');
      if (t) select(+t.dataset.index);
    });
    tabsEl.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (e.key in keys) {
        e.preventDefault();
        select((current + keys[e.key] + tabs.length) % tabs.length, { focus: true });
      } else if (e.key === 'Home') { e.preventDefault(); select(0, { focus: true }); }
      else if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, { focus: true }); }
    });

    // Estado inicial tal y como aparece en cada diseño
    const pescado = cats.findIndex((c) => /pescado/i.test(c.cat));
    select(mqMobile.matches ? 0 : Math.max(pescado, 0));

    const reflow = () => placeInk(tabs[current], true);
    window.addEventListener('resize', reflow);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reflow);
  }

  /* ---------------------------------------------------------
     Opiniones
     --------------------------------------------------------- */
  function initOpiniones() {
    const track = $('[data-marquee-track]');
    if (track) {
      const star = '<img src="assets/svg/star-review.svg" alt="">';
      const card = (o) =>
        '<figure class="review">' +
          '<div class="review__top"><span class="review__stars" aria-label="5 de 5 estrellas">' + star.repeat(5) + '</span><span class="review__q" aria-hidden="true">"</span></div>' +
          '<blockquote class="review__text">"' + esc(OPINION_TXT) + '"</blockquote>' +
          '<figcaption class="review__author"><span class="review__avatar">' + esc(o.a) + '</span><span class="review__name">' + esc(o.n) + '</span></figcaption>' +
        '</figure>';
      const set = OPINIONES.concat(OPINIONES.slice(0, 2)).map(card).join('');
      track.innerHTML = set + set.replace(/<figure class="review">/g, '<figure class="review" aria-hidden="true">');
    }
    const list = $('[data-opiniones]');
    if (list) {
      list.innerHTML = OPINIONES.map((o, i) =>
        '<figure class="opinion" data-reveal style="--d:' + (i * 80) + 'ms">' +
          '<div class="opinion__top"><span class="opinion__stars" aria-label="5 de 5 estrellas">★★★★★</span><span class="opinion__q" aria-hidden="true">”</span></div>' +
          '<blockquote class="opinion__text">“' + esc(OPINION_TXT) + '”</blockquote>' +
          '<figcaption class="opinion__author"><span class="opinion__avatar">' + esc(o.a) + '</span><span class="opinion__name">' + esc(o.n) + '</span></figcaption>' +
        '</figure>'
      ).join('');
    }
  }

  /* ---------------------------------------------------------
     Horario: resalta el día de hoy
     --------------------------------------------------------- */
  function initHorario() {
    const today = new Date().getDay();
    $$('.horario').forEach((h) => {
      $$('.horario__row', h).forEach((row, i) => {
        row.style.setProperty('--i', i);
        if (+row.dataset.day === today) row.classList.add('is-today');
      });
    });
  }

  /* ---------------------------------------------------------
     Texto dividido en palabras (revelado con máscara)
     --------------------------------------------------------- */
  function splitWords() {
    $$('[data-split]').forEach((el) => {
      let k = 0;
      const lines = $$('.line', el);
      (lines.length ? lines : [el]).forEach((line) => {
        const words = line.textContent.trim().split(/\s+/);
        line.innerHTML = words.map((w) => '<span class="w"><span class="wi" style="--d:' + (k++ * 70) + 'ms">' + esc(w) + '</span></span>').join(' ');
      });
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    });
  }

  /* ---------------------------------------------------------
     Revelado al hacer scroll
     --------------------------------------------------------- */
  function initReveal() {
    // Escalonado entre hermanos marcados
    const groups = new Map();
    $$('[data-reveal]').forEach((el) => {
      if (el.style.getPropertyValue('--d')) return;
      const p = el.parentElement;
      const n = groups.get(p) || 0;
      el.style.setProperty('--d', n * 90 + 'ms');
      groups.set(p, n + 1);
    });
    $$('.stickers .sticker').forEach((el, i) => el.style.setProperty('--d', i * 140 + 'ms'));

    const targets = $$('[data-reveal], [data-split]:not(.hero__title), [data-logo-reveal], [data-script-reveal], .horario, [data-stickers]');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }
    // Los elementos recortados con clip-path se observan a través de su contenedor
    const proxy = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          (proxy.get(en.target) || []).forEach((el) => el.classList.add('is-in'));
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    targets.forEach((el) => {
      if (el.matches('[data-logo-reveal], [data-script-reveal]')) {
        const host = el.parentElement;
        proxy.set(host, (proxy.get(host) || []).concat(el));
        io.observe(host);
      } else io.observe(el);
    });
  }

  /* ---------------------------------------------------------
     Hero: entrada y parallax con el puntero
     --------------------------------------------------------- */
  function initHero() {
    $$('[data-hero-item]').forEach((el, i) => el.style.setProperty('--d', 380 + i * 110 + 'ms'));
    const start = () => {
      doc.classList.add('is-loaded');
      const t = $('.hero__title');
      if (t) requestAnimationFrame(() => t.classList.add('is-in'));
    };
    if (document.readyState === 'complete') requestAnimationFrame(start);
    else window.addEventListener('load', start, { once: true });
    // por si alguna imagen tarda: no esperar más de 1.2s
    setTimeout(start, 1200);

    const root = $('[data-parallax-root]');
    if (!root || !finePointer || reduceMotion) return;
    const hero = root.closest('.hero');
    const items = $$('[data-depth]', root);
    let raf = 0, tx = 0, ty = 0;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    hero.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(apply); });
    function apply() {
      raf = 0;
      root.classList.add('is-tracking');
      items.forEach((el) => {
        const d = parseFloat(el.dataset.depth) || 1;
        el.style.setProperty('--mx', (tx * d * -14).toFixed(2) + 'px');
        el.style.setProperty('--my', (ty * d * -12).toFixed(2) + 'px');
      });
    }
  }

  /* ---------------------------------------------------------
     Parallax ligado al scroll (fondos y pegatinas)
     --------------------------------------------------------- */
  function initScrollFx() {
    if (reduceMotion) return;
    const bgs = $$('[data-parallax-bg]');
    const stickers = $$('[data-stickers] [data-depth]');
    const logo = $('.firma__logo img');
    let ticking = false;

    function update() {
      ticking = false;
      const vh = window.innerHeight;
      bgs.forEach((el) => {
        const host = el.parentElement;
        const r = host.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / (vh + r.height); // -0.5 .. 0.5
        el.style.transform = 'translate3d(0,' + (p * -14).toFixed(2) + '%,0)';
      });
      if (stickers.length) {
        const host = stickers[0].parentElement;
        const r = host.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
          stickers.forEach((el) => {
            const d = parseFloat(el.dataset.depth) || 1;
            el.style.transform = 'translate3d(0,' + (p * d * 160).toFixed(1) + 'px,0)';
          });
        }
      }
      if (logo) {
        const r = logo.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const p = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1);
          logo.style.transform = 'scale(' + (0.96 + p * 0.06).toFixed(4) + ')';
        }
      }
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---------------------------------------------------------
     Navegación: se oculta al bajar, aparece al subir
     --------------------------------------------------------- */
  function initNav() {
    const nav = $('[data-nav]');
    if (!nav) return;
    let last = window.scrollY;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        if (document.body.classList.contains('menu-open')) return;
        const down = y > last && y > 160;
        nav.classList.toggle('is-hidden', down);
        last = y;
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Menú móvil
     --------------------------------------------------------- */
  function initMenu() {
    const btn = $('[data-menu-toggle]');
    const menu = $('[data-menu]');
    if (!btn || !menu) return;
    $$('.mmenu__links a', menu).forEach((a, i) => a.style.setProperty('--i', i));
    const set = (open) => {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.classList.toggle('menu-open', open);
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add('is-open'));
      } else {
        menu.classList.remove('is-open');
        setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 800);
      }
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    $$('[data-menu-link]', menu).forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
    mqMobile.addEventListener('change', (e) => { if (!e.matches) set(false); });
  }

  /* ---------------------------------------------------------
     Carta en listas (página carta.html)
     --------------------------------------------------------- */
  function initCartaLista() {
    const root = $('[data-carta-lista]');
    if (!root || !window.CARTA_LISTA) return;
    const chips = $('[data-lista-chips]', root);
    const panel = $('[data-lista-panel]', root);
    const data = window.CARTA_LISTA;
    const icon = 'assets/svg/icon-restaurant.svg';
    const label = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    chips.innerHTML = data.map((c, i) =>
      '<button type="button" class="lchip" role="tab" id="lchip-' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" aria-controls="lista-panel" data-i="' + i + '">' + esc(label(c.cat)) + '</button>'
    ).join('');
    const btns = $$('.lchip', chips);

    const item = (it, i) =>
      '<div class="litem" style="--i:' + i + '">' +
        '<div class="litem__main"><p class="litem__name">' + esc(it.n) + '</p>' + (it.d ? '<p class="litem__desc">' + esc(it.d) + '</p>' : '') + '</div>' +
        '<p class="litem__price">' + esc(it.p) + '</p>' +
      '</div>';

    let cur = -1;
    function select(i, focus) {
      if (i === cur) return;
      const first = cur === -1;
      cur = i;
      btns.forEach((b, k) => { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; });
      panel.setAttribute('aria-labelledby', btns[i].id);
      const render = () => {
        const c = data[i];
        panel.innerHTML =
          '<div class="lsec__title"><img src="' + icon + '" width="32" height="34" alt=""><h3>' + esc(label(c.cat)) + '</h3></div>' +
          '<div class="lgrid">' + c.items.map(item).join('') + '</div>';
        panel.classList.remove('is-leaving');
      };
      if (first || reduceMotion) render(); else { panel.classList.add('is-leaving'); setTimeout(render, 200); }
      if (focus) btns[i].focus();
    }
    chips.addEventListener('click', (e) => { const b = e.target.closest('.lchip'); if (b) select(+b.dataset.i); });
    chips.addEventListener('keydown', (e) => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); select((cur + k + btns.length) % btns.length, true); }
    });
    select(0);
  }

  /* ---------------------------------------------------------
     Formulario de contacto (carta.html)
     --------------------------------------------------------- */
  function initForm() {
    const form = $('[data-contact-form]');
    if (!form) return;
    const status = $('[data-form-status]', form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      $$('[required]', form).forEach((f) => {
        const bad = !f.checkValidity();
        f.closest('.field').classList.toggle('is-invalid', bad);
        if (bad && ok) { f.focus(); ok = false; }
      });
      if (!ok) { status.textContent = 'Revisa los campos marcados, por favor.'; status.className = 'form__status is-error'; return; }
      const btn = $('button[type="submit"]', form);
      btn.classList.add('is-sending');
      btn.disabled = true;
      setTimeout(() => {
        btn.classList.remove('is-sending');
        btn.classList.add('is-sent');
        status.textContent = '¡Gracias! Hemos recibido tu mensaje y te responderemos muy pronto.';
        status.className = 'form__status is-ok';
        form.reset();
        setTimeout(() => { btn.classList.remove('is-sent'); btn.disabled = false; }, 2600);
      }, 900);
    });
    form.addEventListener('input', (e) => {
      const f = e.target.closest('.field');
      if (f && f.classList.contains('is-invalid') && e.target.checkValidity()) f.classList.remove('is-invalid');
    });
  }

  /* --------------------------------------------------------- */
  splitWords();
  initCartaFotos();
  initCartaLista();
  initOpiniones();
  initHorario();
  initReveal();
  initHero();
  initScrollFx();
  initNav();
  initMenu();
  initForm();
})();
