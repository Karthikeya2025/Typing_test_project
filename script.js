const textPools = {
    "very-easy": [
        "Coding a simple website with html and css is a great way to learn.",
        "big dogs like to bark at the blue car down the long old road",
        "cat dog run big sun hot red blue fast jump sit map top fun pig fox fly sky tree book"
    ],
    "easy": [
        "As technology advances, touch typing enhances efficiency by allowing you to type without looking at the keyboard.",
        "very few people know that being talented in studies is not needed alone being in sports and other activities is also required",
        "The sun is hot. The dog can run fast. A red bird sits in the tree. I like to read my book."
    ],
    "medium": [
        "The core of code development relies entirely on persistent muscle memory and attention to structural details.",
        "Consistent practice turns complex programming syntax into intuitive expressions of human thoughts.",
        "the brown dog ran across the wide green field to catch the yellow ball while the young children laughed and played together"
    ],
    "hard": [
        "The quick brown fox jumps over the lazy dog. This sentence contains every letter in the alphabet, making it excellent for practice. Keep your fingers on the home row, take a deep breath, and relax your shoulders. ",
        "On January 15, 2024, at exactly 4:30 p.m., the research team—consisting of 12 expert scientists—discovered a rare, multi-colored gemstone weighing approximately 8.5 kilograms near the base of Mt. Everest.",
        "Biochemists study complex processes, including DNA replication and enzyme reactions. Materials science further explores material properties for technological applications"
    ]
};

// Read current duration from the input field (fallback: 30)
function getTestDuration() {
    const input = document.getElementById('custom-duration');
    const val = parseInt(input ? input.value : 30, 10);
    return (isNaN(val) || val < 0) ? 0 : val;
}

// Called when a preset button is clicked
function setDuration(seconds) {
    const input = document.getElementById('custom-duration');
    if (input) input.value = seconds;

    // Update active state on preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.textContent) === seconds ||
            (seconds === 120 && btn.textContent === '2m'));
    });

    // If test hasn't started yet, reset timer display and reinit
    if (!isTestRunning) init();
}

// Called when the user manually edits the number input
function onCustomDurationChange() {
    // Deactivate all preset buttons since value is now custom
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));

    // Re-highlight a preset button if the value matches one
    const val = getTestDuration();
    const presetMap = { 15: '15s', 30: '30s', 60: '60s', 120: '2m' };
    document.querySelectorAll('.preset-btn').forEach(btn => {
        if (btn.textContent === presetMap[val]) btn.classList.add('active');
    });

    if (!isTestRunning) init();
}

let timerLeft = 30;
let timerInterval = null;
let isTestRunning = false;
let currentQuote = "";
let characterSpans = [];
let typedIndex = 0;

let totalKeystrokes = 0;
let correctKeystrokes = 0;

const textDisplay = document.getElementById('text-display');
const keyboardTracker = document.getElementById('keyboard-tracker');
const timerDisplay = document.getElementById('timer');
const testScreen = document.getElementById('test-screen');
const resultsScreen = document.getElementById('results-screen');
const difficultySelect = document.getElementById('difficulty');

function init() {
    clearInterval(timerInterval);

    const selectedLevel = difficultySelect.value;
    const activePool = textPools[selectedLevel];
    currentQuote = activePool[Math.floor(Math.random() * activePool.length)];

    textDisplay.innerHTML = '';
    typedIndex = 0;
    totalKeystrokes = 0;
    correctKeystrokes = 0;
    timerLeft = getTestDuration();  // <-- dynamic duration on every init
    isTestRunning = false;

    timerDisplay.innerText = timerLeft;

    currentQuote.split('').forEach(char => {
        const span = document.createElement('span');
        span.classList.add('char');
        span.innerText = char;
        textDisplay.appendChild(span);
    });

    characterSpans = textDisplay.querySelectorAll('.char');
    if (characterSpans.length > 0) {
        characterSpans[0].classList.add('current');
    }

    keyboardTracker.value = '';
    focusTracker();
}

function focusTracker() {
    keyboardTracker.focus();
}

keyboardTracker.addEventListener('input', () => {
    if (!isTestRunning && timerLeft === getTestDuration()) {
        startTimer();
    }

    const inputVal = keyboardTracker.value;

    if (inputVal.length < typedIndex) {
        if (typedIndex > 0) {
            characterSpans[typedIndex].classList.remove('current', 'correct', 'incorrect');
            typedIndex--;
            characterSpans[typedIndex].classList.remove('correct', 'incorrect');
            characterSpans[typedIndex].classList.add('current');
        }
        return;
    }

    if (typedIndex >= characterSpans.length) return;

    const currentTypedChar = inputVal[inputVal.length - 1];
    totalKeystrokes++;
    const targetChar = currentQuote[typedIndex];

    characterSpans[typedIndex].classList.remove('current');

    if (currentTypedChar === targetChar) {
        characterSpans[typedIndex].classList.add('correct');
        correctKeystrokes++;
    } else {
        characterSpans[typedIndex].classList.add('incorrect');
    }

    typedIndex++;

    if (typedIndex < characterSpans.length) {
        characterSpans[typedIndex].classList.add('current');
    } else {
        endTest();
    }
});

function startTimer() {
    isTestRunning = true;
    timerInterval = setInterval(() => {
        timerLeft--;
        timerDisplay.innerText = timerLeft;
        if (timerLeft <= 0) {
            endTest();
        }
    }, 1000);
}

function endTest() {
    clearInterval(timerInterval);
    isTestRunning = false;

    const totalDuration = getTestDuration();
    const timeSpentInMinutes = (totalDuration - timerLeft) / 60;

    const cpm = timeSpentInMinutes > 0 ? Math.round(correctKeystrokes / timeSpentInMinutes) : 0;
    const wpm = Math.round(cpm / 5);
    const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 0;

    document.getElementById('res-wpm').innerText = wpm;
    document.getElementById('res-cpm').innerText = cpm;
    document.getElementById('res-accuracy').innerText = accuracy + "%";

    const tierBadge = document.getElementById('tier-badge');
    if (wpm < 30) {
        tierBadge.innerText = "🐢 Tortoise";
    } else if (wpm >= 30 && wpm <= 65) {
        tierBadge.innerText = "🐴 Horse";
    } else {
        tierBadge.innerText = "🐆 Cheetah";
    }

    testScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
}

function resetTest() {
    resultsScreen.classList.add('hidden');
    testScreen.classList.remove('hidden');
    init();
}

window.onload = init;