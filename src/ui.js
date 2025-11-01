const storyContainer = document.getElementById('story-container');
const userInput = document.getElementById('user-input');
const feedback = document.getElementById('feedback');
const progress = document.getElementById('progress');

let currentStory = '';
let currentIndex = 0;

function displayStory(story) {
    currentStory = story;
    currentIndex = 0;
    storyContainer.textContent = story;
    userInput.value = '';
    feedback.textContent = '';
    updateProgress();
}

function updateProgress() {
    const progressText = `${currentIndex} / ${currentStory.length}`;
    progress.textContent = progressText;
}

userInput.addEventListener('input', () => {
    const inputText = userInput.value;
    if (inputText === currentStory.substring(0, inputText.length)) {
        currentIndex = inputText.length;
        feedback.textContent = 'Correct!';
    } else {
        feedback.textContent = 'Keep trying!';
    }
    updateProgress();
    if (inputText === currentStory) {
        feedback.textContent = 'Well done! You completed the story!';
    }
});