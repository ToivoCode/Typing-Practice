const storyTextEl = document.getElementById('story-text');
const userInput = document.getElementById('user-input');
const feedback = document.getElementById('feedback');
const storySelect = document.getElementById('story');
const difficultySelect = document.getElementById('difficulty');
// Default to forgiving mode for kids
let difficulty = 'forgiving'; // 'standard' | 'forgiving'
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
let originalSentences = []; // sentences as in original text (may contain newlines) - used for unlocked view

// Load stories.json (path relative to index.html). Try a few paths and fall back to a built-in sample
const fallbackStories = [
    {
        "title": "Skyggebyen",
        "content": "Lumi sto ved det gamle badehuset. Hun og mamma hadde gått seg bort på vei til byen. Mamma gikk inn for å se seg rundt. Lumi nølte. Det var noe rart der inne. Luften dirret.\n\nDa hun fulgte etter, var mamma borte. I stedet sto det et lite vesen med revehale og blå øyne. Det bukket. Du er i Skyggebyen nå, sa det.Mennesker får ikke bli her lenge.\n\nLumi kjente hjertet slå fort. Hvor er mamma? spurte hun. Hun spiser på mat som ikke er for mennesker, sa reven. Da glemmer man hvem man er.\n\nLumi ville rope, men reven la hodet på skakke. Hvis du vil redde henne, må du jobbe for Skyggeherren. Bare han kan bryte tryllebåndet.\n\nHun nikket. Jeg gjør det. Så fikk hun en nøkkel i hånda. Denne åpner døra til Vannspeilet. Der venter din første prøve.Vannspeilet var en innsjø som glødet i mørket. Hun så sitt eget speilbilde, men ansiktet smilte ikke. Du tviler på deg selv, sa stemmen fra vannet. Hvis du ikke finner motet, vil du forsvinne.\n\nLumi lukket øynene. Hun tenkte på mamma. På latteren deres. Hun åpnet øynene igjen. Jeg er ikke redd. Vannet lyste sterkt, og nøkkelen smeltet til lys. Hun kunne plutselig se stien videre.\n\nPå slutten sto Skyggeherren, høy og mørk, men øynene var triste. Du kom hit med mot, sa han. Mange glemmer hvem de er. Men du husket. Derfor kan du ta din mor hjem.\n\nMamma sto der igjen, forvirret men trygg. Lumi? Hva skjedde?\n\nVi fant veien ut, sa Lumi og tok henne i hånda.\n\nDa de så seg tilbake, var badehuset borte. Bare en svak duft av blomster lå igjen i luften.\n\nLumi smilte. Hun visste at Skyggebyen fortsatt var der, et sted mellom drøm og virkelighet. Men nå visste hun også at hun kunne finne veien uansett hvor hun var.",
    },
    {
        "title": "Isdanseren Nilo",
        "content": "Nilo var en ung pingvin som elsket musikk. Men han kunne ikke synge som de andre. Når flokken sang, ble lyden hans bare rare klikk og pip. De andre lo. Du må lære å synge, ellers finner du aldri en venn! sa de.\n\nMen Nilo hadde en hemmelighet. Når han hørte rytmen fra havet, begynte beina å bevege seg. Han danset. Først litt. Så mer. Til slutt kunne han ikke stoppe. Han danset på isen til den glitret som sølv.\n\nEn dag kom det en storm. Isen brøt opp, og mange pingviner ble fanget på et isflak som drev bort. De ropte, men vinden overdøvde sangen deres.\n\nNilo så dem fra klippen. Han kjente panikken i magen. Ingen kunne høre dem. Ingen kunne svømme ut i de høye bølgene. Han tenkte fort. Hvis han ikke kunne synge, måtte han gjøre noe annet.\n\nHan løp ut på isen og begynte å danse. Hardt og raskt. Føttene slo mot isen i takt. Dunk dunk dunk! Lyden bar langt. Andre pingviner hørte det og kom løpende. Se, han viser vei! ropte en.\n\nSammen skjøv de isflak og tau ut mot havet. De dannet en bro. Til slutt kunne de fangede pingvinene hoppe trygt tilbake.\n\nDa stormen la seg, sto Nilo midt på isen, helt utslitt. De andre sto stille rundt ham. Så begynte en gammel pingvin å trampe i takt. Så en til. Snart danset hele flokken. Ingen lo lenger.\n\nDu reddet oss, sa en liten pingvin. Ikke med sang. Men med dans.\n\nNilo smilte. Han skjønte at man ikke må være lik de andre for å høre til. Det holder å følge rytmen i sitt eget hjerte.\n\nOg siden den dagen danset flokken hver gang havet sang.",
    },
    {
        "title": "Tidstyvene",
        "content": "Mira bodde i en liten by der alle alltid hadde det travelt. Ingen lo lenger. Ingen stoppet for å se på solnedgangen. Folk sa bare: Har ikke tid!\n\nEn dag satt Mira alene ved en gammel fontene. Da kom en grå skygge bort til henne. Den hadde hatt og dress og bar på en liten sølvboks. Du burde også spare tid, sa skyggen. Tid er verdifullt. Gi meg litt av din, så skal jeg passe på den for deg.\n\nMira rynket pannen. Men jeg vil bruke tiden min, ikke spare den bort.\n\nSkyggen smilte kaldt. Du vet ikke hva som er best for deg. Den blåste kald røyk, og plutselig frøs alt rundt henne. Frosne folk. Frosne fugler. Frosne tanker.\n\nMira var den eneste som kunne bevege seg. Hjertet dunket hardt. Hun så de grå mennene gå fra hus til hus og samle glødende lyskuler i sølvbokser. Det er menneskers tid, hvisket en stemme bak henne.\n\nHun snudde seg. En liten skinnende skilpadde sto der. Den så klok ut. De grå mennene stjeler tiden folk glemmer å leve. Du må minne dem på hva glede er.\n\nMen hvordan? spurte Mira.\n\nMed hjertet. Ikke med hastverk.\n\nMira tok et dypt pust og begynte å gå gjennom byen. Hun åpnet bok etter bok, som var fulle av stjålet lys. Hver gang hun åpnet en, kom et menneske ut av stillheten. Først en gutt som husket hvordan det var å leke. Så en gammel dame som husket hvordan det var å danse. Så en pappa som husket å klemme barna sine.\n\nDe grå mennene ble svakere for hver glede som våknet. Til slutt sto Mira ansikt til ansikt med den største av dem. Du kan ikke stoppe oss, sa han. Vi eier tiden!\n\nNei, sa Mira rolig. Tid eies av dem som bruker den med hjertet. Hun åpnet den siste boksen. Et sterkt lys fylte hele byen.\n\nDa Mira våknet, rant vannet igjen fra fontenen. Folk lo. De snakket sammen. De hadde tid.\n\nIngen husket helt hva som hadde skjedd, men når de så Mira, smilte de og sa: Takk for at du minnet oss på å leve.\n\nMira så opp mot himmelen. Skyggen var borte. Hun visste at tid ikke kunne eies. Den kunne bare leves.",
    },
    {
        "title": "Miko and the Sky Train",
        "content": "Miko was small. He had red hair. He loved to explore.\n\nOne day he saw a floating train. The doors opened. Miko jumped in.\n\nInside was a tiny robot. Hello! I am Tava, it said. Where do you want to go?\n\nMiko smiled. Anywhere!\n\nThe train shook. A dark cloud blocked the way. Thunder roared. Miko felt scared.\n\nCan you help? asked Tava.\n\nMiko nodded. He climbed to the top. He sang a small song. The cloud moved. The path was clear.\n\nThe train reached a city in the clouds. Houses floated. Birds sang. People waved.\n\nMiko smiled. He had found adventure. He had found friends.\n\nAnd the train waited, ready for the next journey."
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
    difficultySelect.value = 'forgiving';
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
            unlockedToggle.textContent = 'Vis eventyret';
        } else {
            unlockedContent.hidden = false;
            unlockedToggle.textContent = 'Skjul eventyret';
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
    // Build unlocked content from the original sentences so we can show line breaks
    const completedParts = originalSentences.slice(0, currentSentenceIndex);
    // Escape HTML and convert newlines to <br>
    const escapedParts = completedParts.map(p => escapeHtmlString(p).replace(/\r?\n/g, '<br>'));
    // Join with a space between sentences to keep spacing consistent
    const html = escapedParts.join(' ');
    unlockedText.innerHTML = html;
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
    // Split story into sentences (keep punctuation). We keep two arrays:
    // - originalSentences: from the raw story (may contain newlines) - used for unlocked view
    // - sentences: cleaned version for typing target (newlines replaced with spaces)
    const matches = currentStory.match(/[^.!?]+[.!?]+\s*/g);
    if (matches && matches.length) {
        originalSentences = matches.map(s => s);
    } else {
        originalSentences = [currentStory];
    }
    // Clean sentences for typing: collapse any whitespace (including newlines) into a single space and trim
    // This avoids requiring the user to type multiple spaces where the original text had blank lines.
    sentences = originalSentences.map(s => s.replace(/\s+/g, ' ').trim());
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

// escape a whole string for safe insertion into innerHTML
function escapeHtmlString(s) {
    if (!s) return '';
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
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