const storyTextEl = document.getElementById('story-text');
const userInput = document.getElementById('user-input');
const feedback = document.getElementById('feedback');
const storySelect = document.getElementById('story');
const difficultySelect = document.getElementById('difficulty');
let difficulty = 'standard'; // 'standard' | 'forgiving'
let allowedInputValue = '';
const statusCompleted = document.getElementById('status-completed');
const statusTotal = document.getElementById('status-total');
const statusPercent = document.getElementById('status-percent');
const progressBar = document.getElementById('progress-bar');

let stories = [];
let currentStory = '';
let currentIndex = 0;
let sentences = [];
let currentSentenceIndex = 0;

// Load stories.json (path relative to index.html). Try a few paths and fall back to a built-in sample
const fallbackStories = [
    {
        "title": "Minecraft",
        "content": "Max bodde i en verden av firkanter. Alt var laget av blokker. Han hadde et lite hus av jord. Han hadde en steinøks og en høne som het Klukk. Max drømte om en diamant. Han ville finne en og bli rik og modig. En dag gikk han ned i en mørk gruve. Han gravde og gravde. Plutselig fant han en stein med rare tegn. Det sto at den som finner den magiske diamanten får kraften til å forandre verden. Max ble veldig spent. Han tente fakler og gikk dypere ned. Han hørte vann som dryppet. Han så lava som lyste rødt. En zombie kom mot ham. Max løp forbi. Så kom en høy mørk figur. Det var en Enderman. Han visste at han ikke måtte se den i øynene. Han listet seg stille forbi. Til slutt fant han et stort rom. Midt på gulvet lå en diamant. Den glødet blått. Max tok den opp. Da begynte bakken å riste. Veggene beveget seg. Små steinfigurer våknet til liv. Diamanten snakket. Hjelp meg Max. Jeg er fanget i en forbannelse. Max så seg rundt. Han fant noen gullblokker. Han lagde en ramme og la diamanten i midten. Et sterkt lys fylte rommet. Alt ble stille. Diamanten sa at han hadde reddet den. Den sa at Max nå kunne bygge og skape som han ville. Da Max kom ut, skinte sola. Over huset hans sto et tre av diamanter. Alle i landsbyen kom for å se. Max smilte. Han visste at den ekte skatten ikke var diamanten. Den var gleden av å bygge og hjelpe andre. Og Klukk fikk et halsbånd som glitret i sola."
    },
    {
        "title": "Fortnite",
        "content": "Tim likte Fortnite mer enn alt. Han bygde hus og slott og jaget fiender hele dagen. En dag skjedde noe rart. Skjermen blinket. Et sterkt lys kom ut av spillet. Tim kjente et sug i magen og vips sto han midt i Fortnite verdenen. Han hadde ekte rustning og en liten hakke i handa. Rundt ham var det trer, hus og fargerike lamaer. Tim hørte et dunk. En stor sky kom mot ham. Det var stormen. Han husket fra spillet at stormen var farlig. Han begynte a løpe. Han hoppet over steiner og bygde trapper. En fiende kom ut fra et busk. Han hadde gullvapen. Tim ble redd men husket at i Fortnite hjelper det a tenke fort. Han bygde en mur av tre og sprang opp pa toppen. Der fant han en kiste. I kisten var det en magisk glider. Tim brukte glideren og fløy over fienden. Han landet pa et fjell og sa hele verden under seg. Han sa andre spillere bygge, løpe og kjempe. Men han ville ikke skade noen. Han ville hjelpe. Han bygde broer mellom fjellene sa de andre kunne komme seg unna stormen. Noen ropte takk. Stormen ble svakere. Det ble sol. En stemme sa. Du vant fordi du valgte a hjelpe. Tim smilte og alt ble hvitt. Han var tilbake pa rommet sitt. Skjermen blinket svakt. Spillet var slutt. Han sa seg i speilet og sa. Jeg vant ikke bare i spillet. Jeg vant inni meg. Fra den dagen husket Tim at ekte helter bygger, ikke bare skyter."
    },
    {
        "title": "The Brave Knight",
        "content": "In a kingdom ruled by a kind king, there was a brave knight named Sir Cedric. He was known for his courage and strength. One day, a dragon threatened the kingdom, and Sir Cedric took it upon himself to save his people. Armed with his sword and shield, he set out on a quest to confront the fearsome beast and restore peace to the land."
    }
];

async function tryLoadStories() {
    const candidates = ['data/stories.json', './data/stories.json', '../data/stories.json'];
    for (const path of candidates) {
        try {
            const resp = await fetch(path);
            if (!resp.ok) continue;
            const data = await resp.json();
            if (data && Array.isArray(data.stories)) {
                stories = data.stories;
                populateStorySelect();
                return;
            }
        } catch (e) {
            // try next path
            console.warn('Could not fetch', path, e);
        }
    }
    // If we get here, loading failed — use fallback and show a helpful message
    stories = fallbackStories;
    populateStorySelect();
    feedback.textContent = 'Using built-in stories because loading data/stories.json failed. Try running a local server (e.g. `python -m http.server`) and reloading the page.';
    console.error('Failed to load remote stories; using fallback sample.');
}

tryLoadStories();

// Initialize difficulty selector
if (difficultySelect) {
    difficultySelect.value = 'standard';
    difficultySelect.addEventListener('change', (e) => {
        difficulty = e.target.value || 'standard';
        // reset input state when switching modes
        allowedInputValue = '';
        userInput.value = '';
        currentIndex = 0;
        currentSentenceIndex = 0;
        renderStory();
        updateProgress();
    });
}

// --- Storage and unlocked-view helpers (inserted after difficulty init) ---
let currentStoryTitle = '';
const STORAGE_KEY = 'typing-practice-progress';

function readProgressStore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        return JSON.parse(raw);
    } catch (e) {
        console.warn('Failed to read progress store', e);
        return {};
    }
}

function saveProgressStore(obj) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
        console.warn('Failed to write progress store', e);
    }
}

function loadProgressForTitle(title) {
    if (!title) return 0;
    const store = readProgressStore();
    const v = store[title];
    return (typeof v === 'number' && v >= 0) ? v : 0;
}

function saveProgressForTitle(title, index) {
    if (!title) return;
    const store = readProgressStore();
    store[title] = index;
    saveProgressStore(store);
}

function clearProgressForTitle(title) {
    if (!title) return;
    const store = readProgressStore();
    delete store[title];
    saveProgressStore(store);
}

// Accordion elements
const unlockedToggle = document.getElementById('unlocked-toggle');
const unlockedContent = document.getElementById('unlocked-content');
const unlockedText = document.getElementById('unlocked-text');
const resetButton = document.getElementById('reset-story');

if (unlockedToggle) {
    unlockedToggle.addEventListener('click', () => {
        const expanded = unlockedToggle.getAttribute('aria-expanded') === 'true';
        unlockedToggle.setAttribute('aria-expanded', String(!expanded));
        if (expanded) {
            unlockedContent.hidden = true;
            unlockedToggle.textContent = 'Show unlocked part of story';
        } else {
            unlockedContent.hidden = false;
            unlockedToggle.textContent = 'Hide unlocked part of story';
        }
    });
}

if (resetButton) {
    resetButton.addEventListener('click', () => {
        if (!currentStoryTitle) return;
        clearProgressForTitle(currentStoryTitle);
        currentSentenceIndex = 0;
        currentIndex = 0;
        allowedInputValue = '';
        userInput.value = '';
        renderStory();
        updateProgress();
        updateUnlockedView();
    });
}

function updateUnlockedView() {
    if (!unlockedText) return;
    if (!sentences || sentences.length === 0) {
        unlockedText.textContent = '';
        return;
    }
    const completed = sentences.slice(0, currentSentenceIndex).join(' ');
    unlockedText.textContent = completed;
}

// Helper: brief error feedback (blink + sound)
function triggerErrorFeedback() {
    // visual blink
    userInput.classList.add('input-error');
    // also flash the current-character cursor in the story display
    if (storyTextEl) storyTextEl.classList.add('cursor-error');
    setTimeout(() => {
        userInput.classList.remove('input-error');
        if (storyTextEl) storyTextEl.classList.remove('cursor-error');
    }, 220);
    // sound
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 150;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
        o.stop(ctx.currentTime + 0.13);
    } catch (e) {
        // ignore audio errors
        console.warn('Audio error', e);
    }
}

// Forgiving mode: intercept key presses and only accept correct characters
userInput.addEventListener('keydown', (e) => {
    if (difficulty !== 'forgiving') return;
    // Allow navigation and modifiers
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key;
    const currentSentence = sentences[currentSentenceIndex] || '';

    // Backspace: remove last accepted character
    if (key === 'Backspace') {
        if (allowedInputValue.length > 0) {
            allowedInputValue = allowedInputValue.slice(0, -1);
            currentIndex = allowedInputValue.length;
            userInput.value = allowedInputValue;
            renderStory();
            updateProgress();
            e.preventDefault();
        }
        return; // allow default when no accepted chars
    }

    // Prevent Enter/newline
    if (key === 'Enter') {
        e.preventDefault();
        return;
    }

    // Only handle single-character keys here
    if (key.length === 1) {
        // Normalize Space key (some browsers report ' ' or 'Spacebar')
        const char = (key === 'Spacebar') ? ' ' : key;
        const expected = currentSentence[currentIndex];
        if (expected === undefined) {
            // no expected char (maybe at sentence end) - ignore
            e.preventDefault();
            return;
        }
        if (char === expected) {
            // accept
            allowedInputValue += char;
            userInput.value = allowedInputValue;
            currentIndex = allowedInputValue.length;
            renderStory();
            updateProgress();
            e.preventDefault();
            // If sentence complete, advance immediately
            if (currentIndex === currentSentence.length) {
                currentSentenceIndex++;
                // persist progress
                saveProgressForTitle(currentStoryTitle, currentSentenceIndex);
                updateUnlockedView();
                allowedInputValue = '';
                userInput.value = '';
                currentIndex = 0;
                renderStory();
                updateProgress();
                if (currentSentenceIndex >= sentences.length) {
                    feedback.textContent = 'Well done! You completed the story!';
                }
            }
        } else {
            // wrong char -> ignore insertion, show feedback
            e.preventDefault();
            triggerErrorFeedback();
        }
    }
});

// Handle paste in forgiving mode: only accept leading matching chars
userInput.addEventListener('paste', (e) => {
    if (difficulty !== 'forgiving') return;
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    let i = 0;
    const currentSentence = sentences[currentSentenceIndex] || '';
    while (i < paste.length) {
        const ch = paste[i];
        const expected = currentSentence[currentIndex];
        if (expected === undefined) break;
        if (ch === expected) {
            allowedInputValue += ch;
            currentIndex++;
            userInput.value = allowedInputValue;
            renderStory();
            updateProgress();
            // advance sentence if needed
            if (currentIndex === currentSentence.length) {
                currentSentenceIndex++;
                // persist progress
                saveProgressForTitle(currentStoryTitle, currentSentenceIndex);
                updateUnlockedView();
                allowedInputValue = '';
                currentIndex = 0;
                userInput.value = '';
                renderStory();
                updateProgress();
                break;
            }
        } else {
            triggerErrorFeedback();
            break;
        }
        i++;
    }
});

function populateStorySelect() {
    // clear any existing options except the placeholder
    storySelect.querySelectorAll('option:not([value=""])').forEach(o => o.remove());
    stories.forEach((s, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = s.title;
        storySelect.appendChild(opt);
    });
    // Auto-select the first story so the user sees content immediately
    if (stories.length > 0) {
        storySelect.value = 0;
        loadStory();
    }
}

// Called when user selects a story (wired from index.html onchange)
function loadStory() {
    const val = storySelect.value;
    if (val === '') {
        storyTextEl.textContent = '';
        userInput.value = '';
        feedback.textContent = '';
        currentStory = '';
        return;
    }
    const idx = Number(val);
    if (!Number.isFinite(idx) || !stories[idx]) return;
    currentStory = stories[idx].content;
    // set title and load saved progress
    currentStoryTitle = stories[idx].title || '';
    // Split story into sentences (keep punctuation). Fall back to whole story if regex fails.
    const matches = currentStory.match(/[^.!?]+[.!?]+\s*/g);
    if (matches && matches.length) {
        sentences = matches.map(s => s.trim());
    } else {
        sentences = [currentStory.trim()];
    }
    // load saved progress for this story (sentence index)
    const saved = loadProgressForTitle(currentStoryTitle) || 0;
    currentSentenceIndex = Math.min(saved, sentences.length);
    currentIndex = 0;
    allowedInputValue = '';
    userInput.value = '';
    userInput.focus();
    feedback.textContent = '';
    // set sentence totals
    statusTotal.textContent = sentences.length;
    statusCompleted.textContent = currentSentenceIndex;
    const pct = Math.round((currentSentenceIndex / (sentences.length || 1)) * 100);
    statusPercent.textContent = pct + '%';
    if (progressBar) progressBar.style.width = pct + '%';
    renderStory();
    updateUnlockedView();
    updateProgress();
}

function updateProgress() {
    // sentence-based progress
    const completedSentences = currentSentenceIndex;
    const totalSentences = sentences.length || 1;
    statusCompleted.textContent = completedSentences;
    const pct = Math.round((completedSentences / totalSentences) * 100);
    statusPercent.textContent = pct + '%';
    if (progressBar) progressBar.style.width = pct + '%';
}

// Keep a global function used by the textarea oninput attribute
function checkInput() {
    // In forgiving mode we handle input via keydown/paste handlers; ignore oninput events
    if (difficulty === 'forgiving') return;
    // Read the textarea and normalize leading spaces (ignore accidental leading spaces)
    let raw = userInput.value;
    if (raw.length && /^\s/.test(raw)) {
        // remove leading whitespace so it doesn't affect matching or cursor position
        raw = raw.replace(/^\s+/, '');
        userInput.value = raw;
    }
    const inputText = raw;
    const currentSentence = sentences[currentSentenceIndex] || '';

    // If the user typed extra whitespace (e.g. a space after a correctly typed sentence),
    // consider the sentence complete when the trimmed input equals the sentence.
    if (inputText.length > currentSentence.length) {
        if (inputText.trim() === currentSentence) {
            // accept completion and immediately advance
            currentSentenceIndex++;
            // persist progress
            saveProgressForTitle(currentStoryTitle, currentSentenceIndex);
            updateUnlockedView();
            userInput.value = '';
            currentIndex = 0;
            if (currentSentenceIndex >= sentences.length) {
                feedback.textContent = 'Well done! You completed the story!';
            } else {
                feedback.textContent = 'Nice! Next sentence.';
            }
            renderStory();
            updateProgress();
            return;
        }
        // otherwise fall through and treat as mismatch
    }

    const expected = currentSentence.substring(0, inputText.length);
    if (inputText === expected) {
        currentIndex = inputText.length;
        feedback.textContent = 'Good job!';
        renderStory();
        // If user completed the sentence exactly, advance immediately
        if (inputText.length === currentSentence.length) {
            currentSentenceIndex++;
            // persist progress
            saveProgressForTitle(currentStoryTitle, currentSentenceIndex);
            updateUnlockedView();
            userInput.value = '';
            currentIndex = 0;
            if (currentSentenceIndex >= sentences.length) {
                feedback.textContent = 'Well done! You completed the story!';
            } else {
                feedback.textContent = 'Nice! Next sentence.';
            }
            renderStory();
            updateProgress();
            return;
        }
        updateProgress();
    } else {
        feedback.textContent = 'Keep trying!';
        renderStory();
        updateProgress();
    }
}

function escapeHtmlChar(c) {
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '&') return '&amp;';
    if (c === ' ') return ' ';
    return c;
}

function renderStory() {
    if (!sentences || sentences.length === 0) {
        storyTextEl.innerHTML = '';
        return;
    }
    // If all sentences completed, show final sentence as typed
    if (currentSentenceIndex >= sentences.length) {
        storyTextEl.innerHTML = `<span class="typed">${escapeHtmlChar(sentences[sentences.length - 1])}</span>`;
        return;
    }
    const s = sentences[currentSentenceIndex];
    let html = '';
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        const safe = escapeHtmlChar(ch);
        if (i < currentIndex) html += `<span class="typed">${safe}</span>`;
        else if (i === currentIndex) html += `<span class="current">${safe}</span>`;
        else html += `<span class="upcoming">${safe}</span>`;
    }
    storyTextEl.innerHTML = html;
}

// Expose functions to the global scope so inline handlers work
window.loadStory = loadStory;
window.checkInput = checkInput;

// Initialize masked display if user hasn't selected
storyTextEl.textContent = '';