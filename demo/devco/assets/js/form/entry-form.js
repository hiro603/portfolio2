/**
 * エントリーフォーム送信(Formspree / AJAX)
 */
export const initializeEntryForm = () => {
    const root = document.querySelector('.js-entry');
    const form = document.querySelector('.js-entry-form');
    const output = document.querySelector('.js-entry-output');
    const note = document.querySelector('.js-entry-note');

    if (!root || !form || !output || !note) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        note.hidden = true;

        if (!form.reportValidity()) return;

        const submitButton = form.querySelector('[type="submit"]');
        submitButton.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) throw new Error(String(response.status));

            output.hidden = false;
            root.classList.add('is-sent');
            output.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch {
            note.hidden = false;
            submitButton.disabled = false;
        }
    });
};
