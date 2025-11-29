// State
const state = {
    bpm: 120,
    isPlaying: false,
    currentStep: 0,
    activePattern: 0,
    patterns: Array(8).fill(null).map(() =>
        Array(8).fill(null).map(() => Array(16).fill(false))
    ),
    instruments: ['Kick', 'Snare', 'Clap', 'Hi-Hat Closed', 'Hi-Hat Open', 'Perc', 'Bass', 'FX'],
    generatedBeat: null, // Store generated beat here
    generatedHistory: [], // Store history of generated beats
    previewPlaying: false,
    previewTimerID: null
};

// Audio Context
let audioCtx = null;
let nextNoteTime = 0.0;
let timerID = null;
const lookahead = 25.0; // ms
const scheduleAheadTime = 0.1; // s

// Constants
const names = ['Neon Pulse', 'Midnight Drive', 'Cyber Flow', 'Urban Echo', 'Deep Waves', 'Solar Flare', 'Lunar Tide', 'Electric Dreams'];

// DOM Elements
const views = {
    overview: document.getElementById('overview'),
    generate: document.getElementById('generate'),
    custom: document.getElementById('custom')
};

const navItems = document.querySelectorAll('.nav-item');

// --- Routing ---
function handleRoute() {
    const hash = window.location.hash.slice(1) || 'overview';

    // Update Nav
    navItems.forEach(item => {
        if (item.dataset.target === hash) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update View
    Object.keys(views).forEach(key => {
        if (key === hash) {
            views[key].classList.add('active');
        } else {
            views[key].classList.remove('active');
        }
    });
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', () => {
    handleRoute();
    loadState();
    renderGrid();
});

// --- Generate Beat Page ---
const generateBtn = document.getElementById('generate-btn');
const resultCard = document.getElementById('generation-result');
const previewBtn = document.getElementById('preview-btn');
const openInSequencerBtn = document.getElementById('open-in-sequencer-btn');
const pills = document.querySelectorAll('.pill');

pills.forEach(pill => {
    pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
    });
});

generateBtn.addEventListener('click', () => {
    const genre = document.getElementById('gen-genre').value;
    const mood = document.getElementById('gen-mood').value;
    const bpm = parseInt(document.getElementById('gen-bpm').value);

    // Generate Pattern
    const generatedPattern = generatePattern(genre, mood);

    state.generatedBeat = {
        pattern: generatedPattern,
        bpm: bpm,
        genre: genre,
        mood: mood,
        name: names[Math.floor(Math.random() * names.length)],
        timestamp: Date.now()
    };

    // Add to History
    state.generatedHistory.unshift(state.generatedBeat);
    if (state.generatedHistory.length > 10) {
        state.generatedHistory.pop();
    }

    // Save to localStorage
    localStorage.setItem('generatedBeat', JSON.stringify(state.generatedBeat));
    localStorage.setItem('generatedHistory', JSON.stringify(state.generatedHistory));

    // Update UI
    document.getElementById('result-name').textContent = state.generatedBeat.name;
    document.getElementById('result-genre').textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
    document.getElementById('result-bpm').textContent = `${bpm} BPM`;
    document.getElementById('result-mood').textContent = mood.charAt(0).toUpperCase() + mood.slice(1);

    resultCard.classList.remove('hidden');
});

previewBtn.addEventListener('click', () => {
    if (state.previewPlaying) {
        stopPreview();
    } else {
        startPreview();
    }
});

openInSequencerBtn.addEventListener('click', () => {
    stopPreview(); // Stop preview if playing
    // Load into sequencer
    if (state.generatedBeat) {
        loadGeneratedBeatIntoSequencer(state.generatedBeat);
        window.location.hash = '#custom';
    }
});

function generatePattern(genre, mood) {
    // Initialize empty 8x16 grid
    const pattern = Array(8).fill(null).map(() => Array(16).fill(false));

    // Basic rules based on genre
    // Rows: 0:Kick, 1:Snare, 2:Clap, 3:HH-C, 4:HH-O, 5:Perc, 6:Bass, 7:FX

    // Kick (Row 0)
    if (genre === 'edm' || genre === 'pop') {
        // Four on the floor
        [0, 4, 8, 12].forEach(s => pattern[0][s] = true);
    } else if (genre === 'hiphop' || genre === 'trap') {
        // Broken beat
        [0, 7, 10].forEach(s => pattern[0][s] = true);
        if (Math.random() > 0.5) pattern[0][14] = true;
    } else if (genre === 'lofi') {
        [0, 8, 11].forEach(s => pattern[0][s] = true);
    }

    // Snare/Clap (Row 1 & 2)
    const snareStep = (genre === 'trap') ? 2 : 1; // Use Clap for trap mostly
    const backbeat = [4, 12];
    backbeat.forEach(s => pattern[snareStep][s] = true);

    // Hi-Hats (Row 3)
    if (genre === 'trap') {
        // Fast rolls
        for (let i = 0; i < 16; i++) pattern[3][i] = true;
    } else {
        // 8th notes
        for (let i = 0; i < 16; i += 2) pattern[3][i] = true;
    }

    // Add some random spice based on mood
    if (mood === 'energetic') {
        // Add open hats
        [2, 6, 10, 14].forEach(s => pattern[4][s] = true);
    } else if (mood === 'chill') {
        // Add some perc
        [3, 9, 13].forEach(s => {
            if (Math.random() > 0.5) pattern[5][s] = true;
        });
    }

    return pattern;
}

// --- Preview Logic ---
function startPreview() {
    if (!state.generatedBeat) return;

    initAudio();
    state.previewPlaying = true;
    previewBtn.innerHTML = '<span class="icon">⏹</span> Stop';

    let currentStep = 0;
    let nextTime = audioCtx.currentTime;
    const secondsPerBeat = 60.0 / state.generatedBeat.bpm;
    const secondsPerStep = secondsPerBeat / 4;

    function schedule() {
        if (!state.previewPlaying) return;

        while (nextTime < audioCtx.currentTime + 0.1) {
            // Play sounds for this step
            const pattern = state.generatedBeat.pattern;
            for (let i = 0; i < 8; i++) {
                if (pattern[i][currentStep]) {
                    triggerSound(i, nextTime);
                }
            }

            // Visual update (simple bar animation)
            const bars = document.querySelectorAll('.bar');
            bars.forEach((bar, idx) => {
                if (idx === currentStep) {
                    bar.style.height = '100%';
                    bar.style.opacity = '1';
                } else {
                    bar.style.height = Math.random() * 50 + 20 + '%';
                    bar.style.opacity = '0.5';
                }
            });

            // Advance
            nextTime += secondsPerStep;
            currentStep = (currentStep + 1) % 16;
        }
        state.previewTimerID = requestAnimationFrame(schedule);
    }

    schedule();
}

function stopPreview() {
    state.previewPlaying = false;
    previewBtn.innerHTML = '<span class="icon">▶</span> Preview';
    if (state.previewTimerID) {
        cancelAnimationFrame(state.previewTimerID);
    }
}

// --- Beatmaker (Sequencer) ---

// Audio Engine
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function triggerSound(instrumentIndex, time) {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = time;

    switch (instrumentIndex) {
        case 0: // Kick
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
            gainNode.gain.setValueAtTime(1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
            break;
        case 1: // Snare
            // Noise buffer for snare
            const bufferSize = audioCtx.sampleRate * 0.5; // 0.5 sec
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            const noiseFilter = audioCtx.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.value = 1000;
            noise.connect(noiseFilter);
            noiseFilter.connect(gainNode);
            gainNode.gain.setValueAtTime(0.5, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            noise.start(now);
            break;
        case 2: // Clap
            // Similar to snare but shorter/crisper
            const clapOsc = audioCtx.createOscillator();
            clapOsc.type = 'triangle';
            clapOsc.frequency.setValueAtTime(150, now); // Low tone
            gainNode.gain.setValueAtTime(0.5, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            clapOsc.connect(gainNode);
            clapOsc.start(now);
            clapOsc.stop(now + 0.1);
            break;
        case 3: // Hi-Hat Closed
            // High freq noise
            const hatBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.1, audioCtx.sampleRate);
            const hatData = hatBuffer.getChannelData(0);
            for (let i = 0; i < hatBuffer.length; i++) {
                hatData[i] = Math.random() * 2 - 1;
            }
            const hatSrc = audioCtx.createBufferSource();
            hatSrc.buffer = hatBuffer;
            const hatFilter = audioCtx.createBiquadFilter();
            hatFilter.type = 'highpass';
            hatFilter.frequency.value = 5000;
            hatSrc.connect(hatFilter);
            hatFilter.connect(gainNode);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            hatSrc.start(now);
            break;
        case 4: // Hi-Hat Open
            // Longer decay
            const openHatBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.5, audioCtx.sampleRate);
            const openHatData = openHatBuffer.getChannelData(0);
            for (let i = 0; i < openHatBuffer.length; i++) {
                openHatData[i] = Math.random() * 2 - 1;
            }
            const openHatSrc = audioCtx.createBufferSource();
            openHatSrc.buffer = openHatBuffer;
            const openHatFilter = audioCtx.createBiquadFilter();
            openHatFilter.type = 'highpass';
            openHatFilter.frequency.value = 5000;
            openHatSrc.connect(openHatFilter);
            openHatFilter.connect(gainNode);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            openHatSrc.start(now);
            break;
        default:
            // Simple beep for others
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200 + (instrumentIndex * 100), now);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
    }
}

// Scheduler
function nextNote() {
    const secondsPerBeat = 60.0 / state.bpm;
    const secondsPerStep = secondsPerBeat / 4; // 16th notes
    nextNoteTime += secondsPerStep;
    state.currentStep++;
    if (state.currentStep === 16) {
        state.currentStep = 0;
    }
}

function scheduleNote(stepNumber, time) {
    // Visual update (use requestAnimationFrame for better sync, but setTimeout is ok for simple)
    setTimeout(() => {
        updatePlayhead(stepNumber);
    }, (time - audioCtx.currentTime) * 1000);

    // Audio trigger
    const currentPattern = state.patterns[state.activePattern];
    for (let i = 0; i < 8; i++) {
        if (currentPattern[i][stepNumber]) {
            triggerSound(i, time);
        }
    }
}

function scheduler() {
    while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
        scheduleNote(state.currentStep, nextNoteTime);
        nextNote();
    }
    if (state.isPlaying) {
        timerID = requestAnimationFrame(scheduler);
    }
}

function updatePlayhead(stepIndex) {
    const buttons = document.querySelectorAll('.step-btn');
    buttons.forEach(btn => btn.classList.remove('playing'));

    // Highlight current column
    for (let i = 0; i < 8; i++) {
        const btn = document.querySelector(`.step-btn[data-row="${i}"][data-col="${stepIndex}"]`);
        if (btn) btn.classList.add('playing');
    }
}

// UI & Controls
const playBtn = document.getElementById('play-btn');
const iconPlay = playBtn.querySelector('.icon-play');
const iconStop = playBtn.querySelector('.icon-stop');
const bpmInput = document.getElementById('seq-bpm');
const loadGeneratedBeatIntoSequencerBtn = document.getElementById('load-generated-btn');

playBtn.addEventListener('click', () => {
    initAudio();
    state.isPlaying = !state.isPlaying;

    if (state.isPlaying) {
        iconPlay.style.display = 'none';
        iconStop.style.display = 'inline';
        nextNoteTime = audioCtx.currentTime;
        state.currentStep = 0;
        scheduler();
    } else {
        iconPlay.style.display = 'inline';
        iconStop.style.display = 'none';
        cancelAnimationFrame(timerID);
        // Clear playhead
        document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('playing'));
    }
});

bpmInput.addEventListener('change', (e) => {
    state.bpm = parseInt(e.target.value);
    saveState(); // Auto-save BPM
});

loadGeneratedBeatIntoSequencerBtn.addEventListener('click', () => {
    openHistoryModal();
});

// Modal Elements
const modal = document.getElementById('load-beat-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const beatHistoryList = document.getElementById('beat-history-list');

closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

function openHistoryModal() {
    modal.classList.remove('hidden');
    renderHistoryList();
}

function renderHistoryList() {
    beatHistoryList.innerHTML = '';

    if (state.generatedHistory.length === 0) {
        beatHistoryList.innerHTML = '<div class="empty-state">No generated beats yet. Go generate some!</div>';
        return;
    }

    state.generatedHistory.forEach((beat, index) => {
        const item = document.createElement('div');
        item.className = 'beat-item';

        const date = new Date(beat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        item.innerHTML = `
            <div class="beat-info">
                <h4>${beat.name || 'Untitled Beat'}</h4>
                <div class="beat-meta">
                    ${beat.genre} • ${beat.mood} • ${beat.bpm} BPM • ${date}
                </div>
            </div>
            <button class="load-btn" data-index="${index}">Load</button>
        `;

        const btn = item.querySelector('.load-btn');
        btn.addEventListener('click', () => {
            loadGeneratedBeatIntoSequencer(beat);
            modal.classList.add('hidden');
        });

        beatHistoryList.appendChild(item);
    });
}

function loadGeneratedBeatIntoSequencer(beat) {
    if (beat) {
        state.bpm = beat.bpm;
        bpmInput.value = state.bpm;

        // Deep copy pattern to active pattern
        state.patterns[state.activePattern] = JSON.parse(JSON.stringify(beat.pattern));

        renderGrid();
        saveState(); // Auto-save loaded beat
        // alert(`Loaded generated beat: ${beat.genre} / ${beat.mood}`); // Optional alert
    }
}

// Grid Rendering
const gridContainer = document.getElementById('sequencer-grid');

function renderGrid() {
    gridContainer.innerHTML = '';
    // Set grid template: 1 col for label + 16 cols for steps
    gridContainer.style.gridTemplateColumns = `120px repeat(16, 1fr)`;

    state.instruments.forEach((inst, rowIndex) => {
        // Label
        const label = document.createElement('div');
        label.className = 'instrument-label';
        label.textContent = inst;
        gridContainer.appendChild(label);

        // Steps
        for (let colIndex = 0; colIndex < 16; colIndex++) {
            const btn = document.createElement('button');
            btn.className = 'step-btn';
            btn.dataset.row = rowIndex;
            btn.dataset.col = colIndex;

            if (state.patterns[state.activePattern][rowIndex][colIndex]) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', () => {
                state.patterns[state.activePattern][rowIndex][colIndex] = !state.patterns[state.activePattern][rowIndex][colIndex];
                btn.classList.toggle('active');
                saveState(); // Auto-save step change
            });

            gridContainer.appendChild(btn);
        }
    });
}

// Pattern & Persistence
const patternBtns = document.querySelectorAll('.pattern-btn');
const saveBtn = document.getElementById('save-btn');
const clearBtn = document.getElementById('clear-btn');

// Auto-Save Function
function saveState() {
    localStorage.setItem('beatforge_state', JSON.stringify({
        patterns: state.patterns,
        bpm: state.bpm
    }));
}

patternBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        patternBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activePattern = parseInt(btn.dataset.pattern);
        renderGrid();
    });
});

clearBtn.addEventListener('click', () => {
    state.patterns[state.activePattern] = Array(8).fill(null).map(() => Array(16).fill(false));
    renderGrid();
    saveState(); // Auto-save on clear
});

saveBtn.addEventListener('click', () => {
    saveState();
    alert('Project Saved!');
});

function loadState() {
    // Load Sequencer State
    const saved = localStorage.getItem('beatforge_state');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.patterns && Array.isArray(parsed.patterns) && parsed.patterns.length === 8) {
                state.patterns = parsed.patterns;
            }
            if (parsed.bpm) {
                state.bpm = parsed.bpm;
                bpmInput.value = state.bpm;
            }
        } catch (e) {
            console.error('Failed to load state:', e);
            // Reset if corrupted
            localStorage.removeItem('beatforge_state');
        }
    }

    // Load Generated Beat State
    const savedGen = localStorage.getItem('generatedBeat');
    if (savedGen) {
        state.generatedBeat = JSON.parse(savedGen);

        // Restore UI
        document.getElementById('result-name').textContent = state.generatedBeat.name || 'Last Generated Beat';
        document.getElementById('result-genre').textContent = state.generatedBeat.genre.charAt(0).toUpperCase() + state.generatedBeat.genre.slice(1);
        document.getElementById('result-bpm').textContent = `${state.generatedBeat.bpm} BPM`;
        document.getElementById('result-mood').textContent = state.generatedBeat.mood.charAt(0).toUpperCase() + state.generatedBeat.mood.slice(1);

        resultCard.classList.remove('hidden');
    }

    // Load History
    const savedHistory = localStorage.getItem('generatedHistory');
    if (savedHistory) {
        state.generatedHistory = JSON.parse(savedHistory);
    }
}
