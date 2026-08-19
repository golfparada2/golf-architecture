/**
 * ROUTING — zkouska.js
 * ============================================================================
 * Vykreslení a vyhodnocení testu. Jeden modul pro všech 18 lekcí — každá
 * lekce mu jen dodá vlastní sadu otázek a vlastní slovník s texty.
 *
 * SKLADBA (zadání, část 10): šest otázek, dohromady vždy rovných 100 bodů.
 * Tři typy:
 *   'obrazek' — obrázková volba (miniatury), 20 bodů, nejméně dvě na lekci
 *   'jedna'   — jedna správná ze čtyř, 15 bodů
 *   'vice'    — více správných s částečnými body, 15 bodů, nejvýš jedna na lekci
 *
 * PRŮBĚH: student odpoví na všech šest (tlačítko Odevzdat je do té doby
 * neaktivní), teprve po odevzdání se odhalí správná řešení — nikdy
 * průběžně. Po odevzdání se uloží pokus přes `js/vysledky.js` (počítá se
 * jen `pokus === 1`, ale ukládají se všechny).
 *
 * POZOR na past ze zadání, část 17: nikdy `classList.add(podminka ? 'x' : '')`
 * — prázdný řetězec shodí celý skript. Tenhle modul proto všude dělá
 * `if (trida) el.classList.add(trida)`.
 *
 * TVAR OTÁZKY (dodává lekce, viz `lekce/01/index.html`):
 *   {
 *     typ: 'jedna' | 'vice' | 'obrazek',
 *     body: 20, tema: 'strategie',            // tema = jeden z kanonických tagů, zadání část 10
 *     textKlic: 'zkouska.q1.text',              // klíč do slovníku pro znění otázky
 *     hintKlic: 'zkouska.q1.hint',              // nepovinné
 *     vysvetleniKlic: 'zkouska.q1.why',
 *     zpetKlic: 'zkouska.q1.back',
 *     moznosti: [
 *       // 'jedna'/'vice': { id:'a', textKlic:'zkouska.q1.a', ok?:true }
 *       // 'obrazek':      { id:'a', kresli: (svg) => void }
 *     ],
 *     spravna: 'b',        // jen 'jedna'/'obrazek'
 *   }
 * ============================================================================
 */

import { t } from './jazyk.js';
import { ulozPokus, pasmo } from './vysledky.js';

/**
 * @param {{
 *   lekce: number,
 *   otazky: Array<Object>,
 *   slovnik: Object,
 *   jazyk: { lang: 'cs'|'en', on: (fn:(lang:string)=>void) => void, t: (klic:string) => any },
 *   el: { meter: Element, quiz: Element, submit: HTMLButtonElement,
 *         again: HTMLButtonElement, note: Element, result: Element },
 * }} cfg
 */
export function vytvorZkousku(cfg) {
  const { lekce, otazky, slovnik, jazyk, el } = cfg;
  const CELKEM = otazky.reduce((s, q) => s + q.body, 0);

  let odpovedi = prazdneOdpovedi();
  let hotovo = false;

  function prazdneOdpovedi() {
    return otazky.map(q => (q.typ === 'vice' ? [] : null));
  }

  function zodpovezena(i) {
    return otazky[i].typ === 'vice' ? odpovedi[i].length > 0 : odpovedi[i] !== null;
  }

  function body(i) {
    const q = otazky[i];
    if (q.typ === 'vice') {
      const spravnych = q.moznosti.filter(m => m.ok).length;
      let s = 0;
      q.moznosti.forEach(m => {
        const vybrano = odpovedi[i].includes(m.id);
        if (m.ok && vybrano) s += q.body / spravnych;
        if (!m.ok && vybrano) s -= q.body / spravnych;
      });
      return Math.max(0, Math.round(s));
    }
    return odpovedi[i] === q.spravna ? q.body : 0;
  }

  function textMoznosti(q, id) {
    if (id == null) return jazyk.t('zkouska.spolecne.nicNevybrano');
    const m = q.moznosti.find(x => x.id === id);
    if (!m) return '—';
    if (q.typ === 'obrazek') return jazyk.t('zkouska.spolecne.moznost') + ' ' + id.toUpperCase();
    return jazyk.t(m.textKlic);
  }

  function odpovedText(i) {
    const q = otazky[i];
    if (q.typ === 'vice') {
      if (!odpovedi[i].length) return jazyk.t('zkouska.spolecne.nicNevybrano');
      return q.moznosti.filter(m => odpovedi[i].includes(m.id))
        .map(m => jazyk.t(m.textKlic)).join(' · ');
    }
    return textMoznosti(q, odpovedi[i]);
  }

  function spravneText(i) {
    const q = otazky[i];
    if (q.typ === 'vice') return q.moznosti.filter(m => m.ok).map(m => jazyk.t(m.textKlic)).join(' · ');
    return textMoznosti(q, q.spravna);
  }

  function vykresliOtazku(q, i) {
    const sec = document.createElement('div');
    sec.className = 'q';
    // Připoj `sec` do živého dokumentu HNED — obrázkové otázky uvnitř kreslí
    // do SVG přes `V()`/`getComputedStyle()` (js/platy.js), a to na
    // odpojeném uzlu vrátí prázdné hodnoty vlastních CSS proměnných (žádná
    // barva → černé tvary). Viz stejná past u karet jamek, poznamky.md krok 4.
    el.quiz.appendChild(sec);
    const hlava = document.createElement('div');
    hlava.className = 'qhead';
    hlava.innerHTML = `<span>${jazyk.t('zkouska.spolecne.otazka')} ${i + 1}</span><span>${q.body} ${jazyk.t('zkouska.spolecne.bodu')}</span>`;
    sec.appendChild(hlava);

    const text = document.createElement('p');
    text.className = 'qtext';
    text.innerHTML = jazyk.t(q.textKlic);
    sec.appendChild(text);

    if (q.hintKlic) {
      const hint = document.createElement('p');
      hint.className = 'qhint';
      hint.innerHTML = jazyk.t(q.hintKlic);
      sec.appendChild(hint);
    }

    if (q.typ === 'obrazek') {
      const wrap = document.createElement('div');
      wrap.className = 'picks';
      sec.appendChild(wrap);
      q.moznosti.forEach(m => {
        const b = document.createElement('button');
        b.className = 'pick';
        b.type = 'button';
        b.setAttribute('aria-pressed', String(odpovedi[i] === m.id));
        wrap.appendChild(b);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 120 220');
        /* Miniatura je uvnitř tlačítka, které už má vlastní jméno („Jamka A"),
           takže se pro čtečku označí jako dekorativní — jinak by ji čtečka
           ohlásila jako druhý, bezejmenný obrázek. Že se obrázková otázka
           nedá zodpovědět bez zraku, je vlastnost typu otázky, ne značkování;
           je to zapsané v `poznamky.md`. */
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        b.appendChild(svg);
        m.kresli(svg, jazyk.lang);
        const span = document.createElement('span');
        span.textContent = m.id.toUpperCase();
        b.appendChild(span);
        b.setAttribute('aria-label', `${jazyk.t('zkouska.spolecne.moznost')} ${m.id.toUpperCase()}`);
        if (hotovo) {
          const trida = m.id === q.spravna ? 'right' : (odpovedi[i] === m.id ? 'wrong' : '');
          if (trida) b.classList.add(trida);
        } else {
          b.onclick = () => { odpovedi[i] = m.id; vykresli(); };
        }
      });
    } else {
      const wrap = document.createElement('div');
      wrap.className = 'opts';
      q.moznosti.forEach((m, k) => {
        const b = document.createElement('button');
        b.className = 'opt';
        b.type = 'button';
        const vybrano = q.typ === 'vice' ? odpovedi[i].includes(m.id) : odpovedi[i] === m.id;
        b.setAttribute('aria-pressed', String(vybrano));
        b.innerHTML = `<span class="mk">${'ABCD'[k] || ''}</span><span>${jazyk.t(m.textKlic)}</span>`;
        if (hotovo) {
          const ok = q.typ === 'vice' ? !!m.ok : m.id === q.spravna;
          if (ok) {
            b.classList.add('right');
            b.insertAdjacentHTML('beforeend', `<span class="tag">${jazyk.t('zkouska.spolecne.spravne')}</span>`);
          } else if (vybrano) {
            b.classList.add('wrong');
            b.insertAdjacentHTML('beforeend', `<span class="tag">${jazyk.t('zkouska.spolecne.tvojeVolba')}</span>`);
          }
        } else {
          b.onclick = () => {
            if (q.typ === 'vice') {
              const p = odpovedi[i].indexOf(m.id);
              if (p >= 0) odpovedi[i].splice(p, 1); else odpovedi[i].push(m.id);
            } else {
              odpovedi[i] = m.id;
            }
            vykresli();
          };
        }
        wrap.appendChild(b);
      });
      sec.appendChild(wrap);
    }

    if (hotovo) {
      const w = document.createElement('div');
      const trida = body(i) === q.body ? 'why' : 'why miss';
      w.className = trida;
      w.innerHTML = jazyk.t(q.vysvetleniKlic) + (q.zpetKlic ? `<span class="back">${jazyk.t(q.zpetKlic)}</span>` : '');
      sec.appendChild(w);
    }

    return sec;
  }

  function aktualizujMeter() {
    [...el.meter.children].forEach((li, i) => {
      li.className = hotovo
        ? (body(i) === otazky[i].body ? 'done' : '')
        : (zodpovezena(i) ? 'done' : '');
    });
    const zbyva = otazky.filter((_, i) => !zodpovezena(i)).length;
    el.submit.disabled = zbyva > 0 || hotovo;
    if (!hotovo) {
      el.note.textContent = zbyva
        ? `${jazyk.t('zkouska.spolecne.zbyva')} ${zbyva}`
        : jazyk.t('zkouska.spolecne.hotovoMuzesOdevzdat');
    }
  }

  function vykresliSouhrn() {
    const zisk = otazky.reduce((s, _, i) => s + body(i), 0);
    const procenta = Math.round((zisk / CELKEM) * 100);
    const plnychBodu = otazky.filter((q, i) => body(i) === q.body).length;
    const nulovych = otazky.filter((_, i) => body(i) === 0).length;
    const pasmoKlic = pasmo(procenta);

    const otazkyZaznam = otazky.map((q, i) => ({ c: i + 1, tema: q.tema, body: body(i), max: q.body }));
    ulozPokus(lekce, otazkyZaznam, { body: zisk, maximum: CELKEM });

    el.result.hidden = false;
    /* Výsledek je pro čtečku novinka, kterou musí ohlásit sama — jinak
       klávesnicový uživatel po odevzdání netuší, že se něco stalo
       (AUDIT.md, bod 3.9). */
    el.result.setAttribute('tabindex', '-1');
    el.result.setAttribute('role', 'region');
    el.result.setAttribute('aria-label', jazyk.t('zkouska.souhrn.nadpis'));
    el.result.innerHTML = `
      <h2 class="hr"><span>${jazyk.t('zkouska.souhrn.nadpis')}</span></h2>
      <div class="score" style="margin-top:14px">
        <span class="big">${procenta}</span><span class="of">${jazyk.t('zkouska.souhrn.procentBodu').replace('{body}', zisk).replace('{max}', CELKEM)}</span>
      </div>
      <p class="band">${jazyk.t('zkouska.pasmo.' + pasmoKlic + '.nadpis')}</p>
      <p>${jazyk.t('zkouska.pasmo.' + pasmoKlic + '.text')}</p>
      <div class="tally">
        <div class="ok"><b>${plnychBodu}</b><span>${jazyk.t('zkouska.souhrn.spravne')}</span></div>
        <div class="no"><b>${otazky.length - plnychBodu}</b><span>${jazyk.t('zkouska.souhrn.chybneCastecne')}</span></div>
        <div><b style="color:var(--ink2)">${nulovych}</b><span>${jazyk.t('zkouska.souhrn.zcelaMimo')}</span></div>
      </div>
      <h3 class="hr" style="margin-top:20px"><span>${jazyk.t('zkouska.souhrn.rozpis')}</span></h3>
      <div class="review">${otazky.map((q, i) => {
        const p = body(i);
        const trida = p === q.body ? 'ok' : (p === 0 ? 'no' : 'part');
        const stejne = p === q.body;
        return `<div class="rw ${trida}">
          <div class="top"><span class="topic">${i + 1} · ${jazyk.t('temata.' + q.tema)}</span>
            <span class="pts">${p} / ${q.body} ${jazyk.t('zkouska.spolecne.zkratkaBodu')}</span></div>
          <p class="qq">${jazyk.t(q.textKlic)}</p>
          <dl>
            <dt>${jazyk.t('zkouska.souhrn.tvojeOdpoved')}</dt><dd class="${stejne ? 'good' : 'bad'}">${odpovedText(i)}</dd>
            ${stejne ? '' : `<dt>${jazyk.t('zkouska.souhrn.spravneReseni')}</dt><dd class="good">${spravneText(i)}</dd>`}
          </dl></div>`;
      }).join('')}</div>
      <p style="font-size:14px;font-style:italic;margin-top:14px;color:var(--ink2)">${jazyk.t('zkouska.souhrn.pata')}</p>`;
    el.note.textContent = jazyk.t('zkouska.spolecne.reseniUKazdeOtazky');
    el.again.hidden = false;
    el.result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.result.focus({ preventScroll: true });
  }

  function vykresli() {
    el.quiz.innerHTML = '';
    // `vykresliOtazku` teď připojuje `sec` do `el.quiz` sama (viz komentář
    // uvnitř) — nepřipojuj ji tu ještě jednou.
    otazky.forEach((q, i) => vykresliOtazku(q, i));
    aktualizujMeter();
    if (hotovo) vykresliSouhrn();
  }

  el.meter.innerHTML = '';
  otazky.forEach(() => el.meter.appendChild(document.createElement('i')));

  el.submit.addEventListener('click', () => {
    hotovo = true;
    vykresli();
  });
  el.again.addEventListener('click', () => {
    hotovo = false;
    odpovedi = prazdneOdpovedi();
    el.result.hidden = true;
    el.again.hidden = true;
    vykresli();
    window.scrollTo({ top: el.quiz.offsetTop - 40, behavior: 'smooth' });
  });

  jazyk.on(() => vykresli());

  return { vykresli };
}
