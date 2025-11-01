const storyTextEl = document.getElementById('story-text');
const userInput = document.getElementById('user-input');
const feedback = document.getElementById('feedback');
const storyTitle = document.getElementById('story-title');
const storySelect = document.getElementById('story');
const statusCompleted = document.getElementById('status-completed');
const statusTotal = document.getElementById('status-total');
const statusPercent = document.getElementById('status-percent');
const progressBar = document.getElementById('progress-bar');

let stories = [];
let currentStory = '';
let currentIndex = 0;

// Load stories.json (path relative to index.html). Try a few paths and fall back to a built-in sample
const fallbackStories = [
    {
        "title": "The Adventure of the Lost Treasure",
        "content": "Once upon a time, in a small village, there lived a brave young girl named Lily. She dreamed of finding the lost treasure hidden deep within the enchanted forest. One sunny morning, she decided to embark on her adventure. With a map in hand and courage in her heart, she ventured into the woods, ready to face whatever challenges lay ahead."
    },
    {
        "title": "The Mysterious Forest",
        "content": "In a land far away, there was a forest that was said to be magical. Many travelers spoke of strange creatures and hidden paths that led to wonders beyond imagination. One day, a curious boy named Max decided to explore the forest. As he walked deeper into the woods, he discovered a world filled with talking animals and sparkling streams."
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
        storyTitle.textContent = '';
        storyTextEl.textContent = '';
        userInput.value = '';
        feedback.textContent = '';
        progress.textContent = '';
        currentStory = '';
        return;
    }
    const idx = Number(val);
    if (!Number.isFinite(idx) || !stories[idx]) return;
    currentStory = stories[idx].content;
    storyTitle.textContent = stories[idx].title;
    // Hide text initially so kids reveal it by typing
    storyTextEl.textContent = ''; // we'll reveal as they type
    userInput.value = '';
    userInput.focus();
    currentIndex = 0;
    feedback.textContent = '';
    // set status totals
    statusTotal.textContent = currentStory.length;
    renderStory();
    updateProgress();
}

function updateProgress() {
    statusCompleted.textContent = currentIndex;
    const pct = currentStory.length ? Math.round((currentIndex / currentStory.length) * 100) : 0;
    statusPercent.textContent = pct + '%';
    if (progressBar) progressBar.style.width = pct + '%';
}

// Keep a global function used by the textarea oninput attribute
function checkInput() {
    const inputText = userInput.value;
    const expected = currentStory.substring(0, inputText.length);
    if (inputText === expected) {
        currentIndex = inputText.length;
        feedback.textContent = 'Good job!';
        // update the rendered window
        renderStory();
        // If finished
        if (inputText.length === currentStory.length) {
            feedback.textContent = 'Well done! You completed the story!';
            setTimeout(() => {
                // reset input and keep story revealed
                userInput.value = '';
                renderStory();
            }, 800);
        }
    } else {
        feedback.textContent = 'Keep trying!';
        renderStory();
    }
    updateProgress();
}

function escapeHtmlChar(c) {
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '&') return '&amp;';
    return c;
}

function renderStory() {
    if (!currentStory) {
        storyTextEl.innerHTML = '';
        return;
    }
    // Show a sliding window so the next word is visible and centered
    const windowBefore = 24; // chars to keep visible before cursor
    const windowAfter = 80; // chars to show after cursor
    const start = Math.max(0, currentIndex - windowBefore);
    const end = Math.min(currentStory.length, currentIndex + windowAfter);
    let html = '';
    for (let i = start; i < end; i++) {
        const ch = currentStory[i];
        const safe = ch === ' ' ? '&nbsp;' : escapeHtmlChar(ch);
        if (i < currentIndex) {
            html += `<span class="typed">${safe}</span>`;
        } else if (i === currentIndex) {
            // current character (cursor)
            html += `<span class="current">${safe}</span>`;
        } else {
            html += `<span class="upcoming">${safe}</span>`;
        }
    }
    storyTextEl.innerHTML = html;
}

// Expose functions to the global scope so inline handlers work
window.loadStory = loadStory;
window.checkInput = checkInput;

// Initialize masked display if user hasn't selected
storyTextEl.textContent = '';