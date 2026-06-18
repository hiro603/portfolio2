const FIELD_LABELS = [
    { label: 'お問い合わせ種類', names: ['type'] },
    { label: 'お名前', names: ['lastName', 'firstName'], join: ' ' },
    { label: 'ふりがな', names: ['lastNameKana', 'firstNameKana'], join: ' ' },
    { label: 'メールアドレス', names: ['email'] },
    { label: '電話番号', names: ['tel'] },
    { label: 'ご希望の連絡方法', names: ['contactMethod'], multiple: true },
    { label: 'お問い合わせ内容', names: ['message'] },
];

const METHOD_LABELS = { mail: 'メール', tel: '電話', either: 'どちらでも可' };

const getFormValues = (form) => {
    const data = {};
    const fd = new FormData(form);
    FIELD_LABELS.forEach(({ names, multiple }) => {
        names.forEach(name => {
            if (multiple) {
                data[name] = fd.getAll(name);
            } else {
                data[name] = fd.get(name) ?? '';
            }
        });
    });
    return data;
};

const buildConfirmTable = (form) => {
    const data = getFormValues(form);
    return FIELD_LABELS.map(({ label, names, join, multiple }) => {
        let value;
        if (multiple) {
            const vals = data[names[0]];
            value = (Array.isArray(vals) ? vals : []).map(v => METHOD_LABELS[v] ?? v).join('、') || '未選択';
        } else if (join !== undefined) {
            value = names.map(n => data[n]).filter(Boolean).join(join);
        } else {
            value = data[names[0]];
        }
        return `<dt>${label}</dt><dd>${value || '―'}</dd>`;
    }).join('');
};

const setStep = (stepEls, n) => {
    stepEls.forEach(li => {
        const active = Number(li.dataset.step) === n;
        li.classList.toggle('is-current', active);
    });
};

export const initializeFormContact = () => {
    const form = document.querySelector('.p-contact-form');
    if (!form) return;

    const stepInput = document.getElementById('contact-step-input');
    const stepConfirm = document.getElementById('contact-step-confirm');
    const stepComplete = document.getElementById('contact-step-complete');
    const confirmTable = document.querySelector('.js-contact-confirm-table');
    const backBtn = document.querySelector('.js-contact-back');
    const sendBtn = document.querySelector('.js-contact-send');
    const stepItems = document.querySelectorAll('.js-contact-step li');

    if (!stepInput || !stepConfirm || !stepComplete || !confirmTable) return;

    const show = (el) => el.removeAttribute('hidden');
    const hide = (el) => el.setAttribute('hidden', '');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        confirmTable.innerHTML = buildConfirmTable(form);
        hide(stepInput);
        show(stepConfirm);
        setStep(stepItems, 2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    backBtn?.addEventListener('click', () => {
        hide(stepConfirm);
        show(stepInput);
        setStep(stepItems, 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    sendBtn?.addEventListener('click', () => {
        hide(stepConfirm);
        show(stepComplete);
        setStep(stepItems, 3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};
