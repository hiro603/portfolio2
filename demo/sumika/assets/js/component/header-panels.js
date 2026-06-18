const FAV_KEY = 'sumika:favs';
const HIST_KEY = 'sumika:history';
const HIST_MAX = 20;

const getFavs = () => JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
const getHistory = () => JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
const saveHistory = (history) => localStorage.setItem(HIST_KEY, JSON.stringify(history));

const esc = (str) =>
    String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const extractPropertyData = (card) => {
    const imgEl = card.querySelector('.c-property-img');
    const src = imgEl?.getAttribute('src') || '';
    const id = src.replace(/.*\/([^/]+)\.[^.]+$/, '$1');
    return {
        id,
        img: src,
        station: card.querySelector('.c-property-station')?.textContent.trim() || '',
        price: card.querySelector('.c-property-price')?.textContent.trim() || '',
        addr: card.querySelector('.c-property-addr')?.textContent.trim() || '',
        tag: card.querySelector('.c-tag')?.textContent.trim() || '',
    };
};

const renderList = (items, emptyText) => {
    if (!items.length) {
        return `<p class="l-panel-empty">${esc(emptyText)}</p>`;
    }
    return items
        .map(
            (p) => `
        <div class="l-panel-card">
          <img class="l-panel-card-img" src="${esc(p.img)}" alt="" width="80" height="56" loading="lazy">
          <div class="l-panel-card-body">
            <p class="l-panel-card-station">${esc(p.station)}</p>
            <p class="l-panel-card-price">${esc(p.price)}</p>
            <p class="l-panel-card-addr">${esc(p.addr)}</p>
          </div>
        </div>`,
        )
        .join('');
};

const closeSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>`;

const createPanel = (label, title) => {
    const dialog = document.createElement('dialog');
    dialog.className = 'l-panel';
    dialog.setAttribute('aria-label', label);
    dialog.innerHTML = `
      <div class="l-panel-inner">
        <div class="l-panel-header">
          <h2 class="l-panel-title">${esc(title)}</h2>
          <button class="l-panel-close" type="button" aria-label="パネルを閉じる">${closeSvg}</button>
        </div>
        <div class="l-panel-body"></div>
      </div>`;
    document.body.appendChild(dialog);

    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
    });
    dialog.querySelector('.l-panel-close').addEventListener('click', () => dialog.close());

    return dialog;
};

const updateBadge = (button, count) => {
    let badge = button.querySelector('.l-header-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'l-header-badge';
        badge.setAttribute('aria-hidden', 'true');
        button.querySelector('svg')?.insertAdjacentElement('afterend', badge) ??
            button.prepend(badge);
    }
    badge.textContent = count > 0 ? String(count) : '';
    badge.hidden = count === 0;
};

export const initializeHeaderPanels = () => {
    const favBtn = document.querySelector('.js-header-fav');
    const histBtn = document.querySelector('.js-header-history');
    if (!favBtn && !histBtn) return;

    const favPanel = createPanel('お気に入りリスト', 'お気に入り');
    const histPanel = createPanel('閲覧履歴', '閲覧履歴');

    const refreshBadges = () => {
        if (favBtn) updateBadge(favBtn, getFavs().length);
        if (histBtn) updateBadge(histBtn, getHistory().length);
    };

    if (favBtn) {
        favBtn.addEventListener('click', () => {
            favPanel.querySelector('.l-panel-body').innerHTML = renderList(
                getFavs(),
                'お気に入りに登録した物件はありません。',
            );
            favPanel.showModal();
        });
    }

    if (histBtn) {
        histBtn.addEventListener('click', () => {
            histPanel.querySelector('.l-panel-body').innerHTML = renderList(
                getHistory(),
                '閲覧した物件の履歴がありません。',
            );
            histPanel.showModal();
        });
    }

    document.addEventListener('fav:changed', refreshBadges);

    document.querySelectorAll('.c-property').forEach((card) => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.js-property-fav')) return;

            const data = extractPropertyData(card);
            if (!data.id) return;

            let history = getHistory().filter((h) => h.id !== data.id);
            history.unshift(data);
            if (history.length > HIST_MAX) history = history.slice(0, HIST_MAX);
            saveHistory(history);
            refreshBadges();
        });
    });

    // Auto-track property detail pages
    const mainEl = document.querySelector('[data-property-track]');
    if (mainEl) {
        const src = mainEl.dataset.propImg || '';
        const id = src.replace(/.*\/([^/]+)\.[^.]+$/, '$1');
        if (id) {
            const data = {
                id,
                img: src,
                station: mainEl.dataset.propStation || '',
                price: mainEl.dataset.propPrice || '',
                addr: mainEl.dataset.propAddr || '',
                tag: mainEl.dataset.propTag || '',
            };
            let history = getHistory().filter((h) => h.id !== id);
            history.unshift(data);
            if (history.length > HIST_MAX) history = history.slice(0, HIST_MAX);
            saveHistory(history);
        }
    }

    refreshBadges();
};
