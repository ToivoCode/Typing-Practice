'use strict';
const el = id => document.getElementById(id);
const input = el('user-input');
const mode = el('difficulty');
const feedback = el('feedback');
const next = el('continue');
const storageKey = 'typing-practice-progress';
let stories = [], sentences = [], selected = 0, completed = 0;
let previous = '', accepted = '', attempts = 0, correct = 0, ready = false, errorTimer;
let store = {};
try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (value && typeof value === 'object' && !Array.isArray(value)) store = value;
} catch { el('save-note').textContent = 'Fremgangen beholdes mens siden er åpen.'; }
const split = text => (text.match(/[^.!]+[.!]+/g) || [text]).map(s => s.replace(/\s+/g, ' ').trim());
function persist() {
    store[stories[selected].title] = completed;
    try { localStorage.setItem(storageKey, JSON.stringify(store)); }
    catch { el('save-note').textContent = 'Fremgangen beholdes mens siden er åpen.'; }
    updateLibrary();
}
function updateLibrary() {
    [...el('story-list').children].forEach((button, i) => {
        button.setAttribute('aria-current', String(i === selected));
        button.querySelector('.choice-number').textContent = store[stories[i].title] >= split(stories[i].content).length ? '✓' : String(i + 1).padStart(2, '0');
    });
}
function clearInput() {
    accepted = previous = input.value = '';
    ready = false;
    input.classList.remove('input-error');
    input.removeAttribute('aria-invalid');
    el('story-text').classList.remove('cursor-error');
}
function selectStory(index, focus = true) {
    selected = index;
    sentences = split(stories[index].content);
    const saved = store[stories[index].title];
    completed = Number.isInteger(saved) ? Math.min(Math.max(saved, 0), sentences.length) : 0;
    attempts = correct = 0;
    clearInput();
    el('story-title').textContent = stories[index].title;
    el('story-category').textContent = stories[index].category;
    el('adventure-number').textContent = `Eventyr ${index + 1} av ${stories.length}`;
    feedback.textContent = completed ? 'Velkommen tilbake. Fortsett der du slapp.' : 'En ny verden venter. Skriv den første setningen!';
    updateLibrary(); render(); renderUnlocked();
    if (focus && !input.disabled) input.focus({ preventScroll: true });
}
function renderUnlocked() {
    const container = el('unlocked-text');
    container.replaceChildren();
    if (completed) {
        const list = document.createElement('ol');
        sentences.slice(0, completed).forEach(sentence => {
            const item = document.createElement('li'); item.textContent = sentence; list.append(item);
        });
        container.append(list);
        container.scrollTop = container.scrollHeight;
    } else {
        const message = document.createElement('p');
        message.className = 'empty-story';
        message.textContent = 'Hver setning du skriver, åpner litt mer av historien.';
        container.append(message);
    }
    el('unlocked-count').textContent = `${completed} ${completed === 1 ? 'setning' : 'setninger'}`;
    el('locked-note').textContent = completed === sentences.length ? '✦ Hele eventyret er nå ditt. Godt skrevet!' : '✧ Mer av eventyret venter på deg';
}
function render() {
    const done = completed === sentences.length;
    const target = sentences[completed] || 'Du har skrevet hele eventyret!';
    input.disabled = done;
    input.readOnly = ready;
    let matching = 0;
    while (matching < input.value.length && input.value[matching] === target[matching]) matching++;
    const fragment = document.createDocumentFragment();
    [...target].forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.className = done || i < matching ? 'typed' : i === matching ? 'current' : 'upcoming';
        fragment.append(span);
    });
    el('story-text').replaceChildren(fragment);
    el('sentence-label').textContent = done ? 'Eventyret er fullført' : `Setning ${completed + 1} av ${sentences.length}`;
    el('progress').setAttribute('aria-valuenow', Math.round(completed / sentences.length * 100));
    const dots = document.createDocumentFragment();
    for (let i = 0; i < sentences.length; i++) {
        const dot = document.createElement('span'); dot.className = 'dot' + (i < completed ? ' done' : ''); dots.append(dot);
    }
    el('progress-dots').replaceChildren(dots);
    el('accuracy').textContent = attempts ? Math.round(correct / attempts * 100) + '%' : '—';
    el('letters').textContent = done ? 'Ferdig!' : `${matching} / ${target.length}`;
    next.disabled = !ready && !done;
    next.textContent = done ? 'Nytt eventyr →' : ready && completed === sentences.length - 1 ? 'Fullfør →' : 'Fortsett →';
    if (done) feedback.textContent = 'Hurra! Du har skrevet hele eventyret.';
}
function showError() {
    input.classList.add('input-error'); el('story-text').classList.add('cursor-error');
    feedback.textContent = mode.value === 'forgiving' ? 'Prøv igjen. Følg den markerte bokstaven.' : 'Bruk rettetasten for å rette den markerte bokstaven.';
    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => { input.classList.remove('input-error'); el('story-text').classList.remove('cursor-error'); }, 350);
}
function processInput(event) {
    if (event.isComposing || input.disabled || ready) return;
    const target = sentences[completed], raw = input.value;
    let prefix = 0;
    while (prefix < previous.length && prefix < raw.length && previous[prefix] === raw[prefix]) prefix++;
    let oldEnd = previous.length, newEnd = raw.length;
    while (oldEnd > prefix && newEnd > prefix && previous[oldEnd - 1] === raw[newEnd - 1]) { oldEnd--; newEnd--; }
    for (let i = prefix; i < newEnd; i++) { attempts++; if (raw[i] === target[i]) correct++; }
    if (mode.value === 'forgiving') {
        let count = 0;
        while (count < raw.length && raw[count] === target[count]) count++;
        if (count < raw.length) {
            accepted = count >= accepted.length ? raw.slice(0, count) : accepted;
            input.value = accepted; showError();
        } else { accepted = raw; feedback.textContent = 'Fint! Ta det i ditt eget tempo.'; }
        input.setSelectionRange(input.value.length, input.value.length);
    } else {
        const valid = target.startsWith(raw);
        input.setAttribute('aria-invalid', String(!valid));
        if (!valid) showError(); else feedback.textContent = 'Fint! Ta det i ditt eget tempo.';
    }
    previous = input.value;
    if (input.value === target) { ready = true; feedback.textContent = 'Flott skrevet! Trykk Enter eller Fortsett.'; }
    render();
}
function advance() {
    if (completed === sentences.length) { el('library').showModal(); return; }
    if (!ready) return;
    completed++; persist(); clearInput(); render(); renderUnlocked();
    if (!input.disabled) { feedback.textContent = 'En ny setning. Eventyret fortsetter!'; input.focus({ preventScroll: true }); }
    else next.focus({ preventScroll: true });
}
input.addEventListener('input', processInput);
input.addEventListener('compositionend', processInput);
input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.isComposing) { event.preventDefault(); if (ready) advance(); }
});
next.addEventListener('click', advance);
mode.addEventListener('change', () => {
    if (!ready) clearInput();
    el('mode-hint').textContent = mode.value === 'forgiving' ? 'Feil bokstaver blir ikke skrevet inn.' : 'Du retter selv med rettetasten.';
    render(); if (!input.disabled) input.focus({ preventScroll: true });
});
el('reset-story').addEventListener('click', () => {
    completed = attempts = correct = 0; clearInput(); persist(); render(); renderUnlocked();
    feedback.textContent = 'En ny start. Eventyret venter!'; input.focus({ preventScroll: true });
});
el('library-open').addEventListener('click', () => el('library').showModal());
el('library-close').addEventListener('click', () => el('library').close());
async function initialize() {
    let data = window.TYPESTORY_DATA;
    if (location.protocol !== 'file:') {
        try { const response = await fetch('data/stories.json'); if (response.ok) data = await response.json(); }
        catch { /* Bundled stories support offline and direct-file use. */ }
    }
    stories = data?.stories || [];
    if (!stories.length) { feedback.textContent = 'Eventyrene kunne ikke lastes. Prøv å laste siden på nytt.'; return; }
    stories.forEach((story, i) => {
        const button = document.createElement('button'); button.className = 'story-choice'; button.type = 'button';
        const symbol = document.createElement('span'); symbol.className = 'choice-symbol'; symbol.textContent = story.symbol; symbol.setAttribute('aria-hidden', 'true');
        const copy = document.createElement('span'); copy.className = 'choice-copy';
        const title = document.createElement('strong'); title.textContent = story.title;
        const category = document.createElement('small'); category.textContent = story.category;
        copy.append(title, category);
        const number = document.createElement('span'); number.className = 'choice-number'; number.setAttribute('aria-hidden', 'true');
        button.append(symbol, copy, number);
        button.addEventListener('click', () => { el('library').close(); selectStory(i); });
        el('story-list').append(button);
    });
    selectStory(0, false);
}
initialize();
