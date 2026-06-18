const FAV_KEY = 'sumika:favs';

const getFavs = () => JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
const saveFavs = (favs) => localStorage.setItem(FAV_KEY, JSON.stringify(favs));

const extractFromCard = (card) => {
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

const extractFromButton = (button) => {
    const src = button.dataset.propImg || '';
    const id = src.replace(/.*\/([^/]+)\.[^.]+$/, '$1');
    return {
        id,
        img: src,
        station: button.dataset.propStation || '',
        price: button.dataset.propPrice || '',
        addr: button.dataset.propAddr || '',
        tag: button.dataset.propTag || '',
    };
};

export const initializePropertyFav = () => {
    const favs = getFavs();
    const favIds = new Set(favs.map((f) => f.id));

    document.querySelectorAll('.js-property-fav').forEach((button) => {
        if (button.dataset.favReady === 'true') return;
        button.dataset.favReady = 'true';

        const card = button.closest('.c-property');
        const data = card ? extractFromCard(card) : extractFromButton(button);
        const labelEl = button.querySelector('span');

        if (data.id && favIds.has(data.id)) {
            button.classList.add('is-active');
            button.setAttribute('aria-pressed', 'true');
            button.setAttribute('aria-label', 'お気に入りから削除');
            if (labelEl) labelEl.textContent = 'お気に入りから削除';
        }

        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const active = button.classList.toggle('is-active');
            button.setAttribute('aria-pressed', String(active));
            button.setAttribute('aria-label', active ? 'お気に入りから削除' : 'お気に入りに追加');
            if (labelEl) labelEl.textContent = active ? 'お気に入りから削除' : 'お気に入りに追加';

            if (data.id) {
                let current = getFavs();
                if (active) {
                    if (!current.some((f) => f.id === data.id)) current.push(data);
                } else {
                    current = current.filter((f) => f.id !== data.id);
                }
                saveFavs(current);
            }

            document.dispatchEvent(new CustomEvent('fav:changed'));
        });
    });
};
