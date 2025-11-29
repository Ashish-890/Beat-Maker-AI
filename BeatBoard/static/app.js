document.addEventListener('DOMContentLoaded', () => {
    // --- AUDIO ENGINE ---
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    const DrumSynth = {
        kick(time, ctx) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(150, time);
            osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
            gain.gain.setValueAtTime(1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.2);
        },
        snare(time, ctx) {
            const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = "highpass";
            noiseFilter.frequency.value = 1000;
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.7, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(time);
            noise.stop(time + 0.2);
        },
        hihat(time, ctx) {
            const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.7;
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const bandpass = ctx.createBiquadFilter();
            bandpass.type = "bandpass";
            bandpass.frequency.value = 8000;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.5, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
            noise.connect(bandpass);
            bandpass.connect(gain);
            gain.connect(ctx.destination);
            noise.start(time);
            noise.stop(time + 0.05);
        }
    };

    function stepDurationFromBpm(bpm) {
        return 60 / (bpm * 4);
    }

    // --- SECTION A: AI GENERATOR LOGIC (Unchanged) ---
    const generateBtn = document.getElementById('generate-btn');
    const moodSelect = document.getElementById('mood-select');
    const aiResults = document.getElementById('ai-results-container');
    const aiEmpty = document.getElementById('ai-empty-state');
    const aiTransport = document.getElementById('ai-transport');
    const errorMsg = document.getElementById('error-msg');
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoader = generateBtn.querySelector('.btn-loader');

    const resultMood = document.getElementById('result-mood');
    const resultDesc = document.getElementById('result-desc');
    const resultBpm = document.getElementById('result-bpm');
    const resultKey = document.getElementById('result-key');
    const resultDrumTag = document.getElementById('result-drum-tag');
    const resultRoman = document.getElementById('result-roman');
    const resultChords = document.getElementById('result-chords');
    const resultDrumName = document.getElementById('result-drum-name');
    const resultDrumDesc = document.getElementById('result-drum-desc');
    const resultHihat = document.getElementById('result-hihat');
    const resultSnare = document.getElementById('result-snare');
    const resultKick = document.getElementById('result-kick');

    const generatedPlayBtn = document.getElementById("generated-play-btn");
    const generatedStopBtn = document.getElementById("generated-stop-btn");
    const generatedIndicator = document.getElementById("generated-playing-indicator");

    let generatedBeat = null;
    let generatedPlayback = { isPlaying: false, currentStep: 0, intervalId: null };

    generateBtn.addEventListener('click', generateAiBeat);
    generatedPlayBtn.addEventListener("click", () => startGeneratedPlayback());
    generatedStopBtn.addEventListener("click", () => stopGeneratedPlayback());

    async function generateAiBeat() {
        const mood = moodSelect.value;
        setAiLoading(true);
        stopGeneratedPlayback();
        try {
            const response = await fetch(`/api/generate?mood=${mood}`);
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            generatedBeat = data;
            generatedBeat.pattern = buildGeneratedPattern(data);
            renderAiBeat(data);
            aiEmpty.classList.add('hidden');
            aiResults.classList.remove('hidden');
            aiTransport.classList.remove('hidden');
            errorMsg.classList.add('hidden');
        } catch (err) {
            console.error(err);
            errorMsg.classList.remove('hidden');
            aiResults.classList.add('hidden');
            aiTransport.classList.add('hidden');
        } finally {
            setAiLoading(false);
        }
    }

    function renderAiBeat(data) {
        resultMood.textContent = data.mood;
        resultDesc.textContent = data.description;
        resultBpm.textContent = data.bpm;
        resultKey.textContent = data.key;
        resultDrumTag.textContent = data.drum_pattern_name.replace(/_/g, ' ');
        resultDrumName.textContent = data.drum_pattern_name.replace(/_/g, ' ');
        resultDrumDesc.textContent = data.drum_pattern.description;
        renderPills(resultRoman, data.roman_template);
        renderPills(resultChords, data.chord_progression);
        renderSequencer(resultKick, data.drum_pattern.bars[0], 'K');
        renderSequencer(resultSnare, data.drum_pattern.snare, 'S');
        renderSequencer(resultHihat, data.drum_pattern.hihat, 'H');
    }

    function renderPills(container, items) {
        container.innerHTML = '';
        items.forEach(item => {
            const pill = document.createElement('span');
            pill.className = 'chord-pill';
            pill.textContent = item;
            container.appendChild(pill);
        });
    }

    function renderSequencer(container, patternString, triggerChar) {
        container.innerHTML = '';
        const cleanPattern = patternString.replace(/\s/g, '');
        for (let i = 0; i < cleanPattern.length; i++) {
            const char = cleanPattern[i];
            const step = document.createElement('div');
            step.className = 'step';
            step.dataset.stepIndex = i;
            if (char === triggerChar) step.classList.add('active');
            else if (char !== '.') step.classList.add('active-secondary');
            container.appendChild(step);
        }
    }

    function setAiLoading(isLoading) {
        generateBtn.disabled = isLoading;
        if (isLoading) {
            btnText.textContent = 'Generating...';
            btnLoader.classList.remove('hidden');
        } else {
            btnText.textContent = 'Generate Beat Idea';
            btnLoader.classList.add('hidden');
        }
    }

    function parseDrumLineToSteps(line) {
        const tokens = line.trim().split(/\s+/);
        return tokens.map((t) => t !== ".");
    }

    function buildGeneratedPattern(beatData) {
        const bpm = beatData.bpm || 90;
        const bars = beatData.drum_pattern?.bars || [];
        const steps = { kick: [], snare: [], hihat: [] };
        bars.forEach((bar) => {
            const k = parseDrumLineToSteps(bar.kick || "");
            const s = parseDrumLineToSteps(bar.snare || "");
            const h = parseDrumLineToSteps(bar.hihat || "");
            steps.kick.push(...k);
            steps.snare.push(...s);
            steps.hihat.push(...h);
        });
        return { bpm, steps };
    }

    function startGeneratedPlayback() {
        if (!generatedBeat || !generatedBeat.pattern) return;
        const ctx = getAudioContext();
        const { bpm, steps } = generatedBeat.pattern;
        const stepDuration = stepDurationFromBpm(bpm);
        if (generatedPlayback.isPlaying) return;
        generatedPlayback.isPlaying = true;
        generatedPlayBtn.disabled = true;
        generatedStopBtn.disabled = false;
        generatedIndicator.textContent = `Playing @ ${bpm} BPM`;
        let step = 0;
        const totalSteps = steps.kick.length;
        function tick() {
            if (!generatedPlayback.isPlaying) return;
            const now = ctx.currentTime;
            const sKick = steps.kick[step];
            const sSnare = steps.snare[step];
            const sHihat = steps.hihat[step];
            if (sKick) DrumSynth.kick(now, ctx);
            if (sSnare) DrumSynth.snare(now, ctx);
            if (sHihat) DrumSynth.hihat(now, ctx);
            highlightGeneratedStep(step);
            step = (step + 1) % totalSteps;
            generatedPlayback.intervalId = setTimeout(tick, stepDuration * 1000);
        }
        tick();
    }

    function stopGeneratedPlayback() {
        generatedPlayback.isPlaying = false;
        generatedPlayBtn.disabled = false;
        generatedStopBtn.disabled = true;
        generatedIndicator.textContent = "Idle";
        if (generatedPlayback.intervalId) {
            clearTimeout(generatedPlayback.intervalId);
            generatedPlayback.intervalId = null;
        }
        clearGeneratedStepHighlight();
    }

    function highlightGeneratedStep(stepIndex) {
        clearGeneratedStepHighlight();
        const steps = document.querySelectorAll(`#ai-results-container .step[data-step-index="${stepIndex}"]`);
        steps.forEach(s => s.classList.add('playhead'));
    }

    function clearGeneratedStepHighlight() {
        const active = document.querySelectorAll('#ai-results-container .step.playhead');
        active.forEach(s => s.classList.remove('playhead'));
    }


    // --- SECTION C: ADVANCED BEAT MAKER LOGIC ---
    let advancedBeat = {
        bpm: 90,
        key: "A minor",
        scaleType: "minor",
        bars: 2, // 32 steps
        tracks: ["kick", "snare", "ch", "oh", "perc"],
        steps: {
            kick: Array(32).fill(false),
            snare: Array(32).fill(false),
            ch: Array(32).fill(false),
            oh: Array(32).fill(false),
            perc: Array(32).fill(false)
        }
    };

    let advancedPlayback = {
        isPlaying: false,
        intervalId: null,
        currentStep: 0
    };

    const advPlayBtn = document.getElementById("advanced-play-btn");
    const advStopBtn = document.getElementById("advanced-stop-btn");
    const advIndicator = document.getElementById("advanced-playing-indicator");
    const advBpmInput = document.getElementById("adv-bpm");
    const advKeySelect = document.getElementById("adv-key");
    const advScaleSelect = document.getElementById("adv-scale");

    initAdvancedSection();

    function initAdvancedSection() {
        buildAdvancedGrid();
        attachAdvancedTransport();
        attachAdvancedImportExport();

        // Settings Listeners
        advBpmInput.addEventListener("change", (e) => advancedBeat.bpm = parseInt(e.target.value));
        advKeySelect.addEventListener("change", (e) => advancedBeat.key = e.target.value);
        advScaleSelect.addEventListener("change", (e) => advancedBeat.scaleType = e.target.value);
    }

    function buildAdvancedGrid() {
        const grid = document.getElementById("advanced-grid");
        grid.innerHTML = '';

        advancedBeat.tracks.forEach(track => {
            const row = document.createElement("div");
            row.className = "advanced-row";

            const label = document.createElement("div");
            label.className = "advanced-row-label";
            label.textContent = track.toUpperCase();
            row.appendChild(label);

            for (let i = 0; i < 32; i++) {
                const cell = document.createElement("div");
                cell.className = "step-cell";
                if (advancedBeat.steps[track][i]) cell.classList.add("on");
                cell.dataset.track = track;
                cell.dataset.step = i;
                cell.addEventListener("click", handleAdvancedStepClick);
                row.appendChild(cell);
            }
            grid.appendChild(row);
        });
    }

    function handleAdvancedStepClick(e) {
        const cell = e.currentTarget;
        const track = cell.dataset.track;
        const step = parseInt(cell.dataset.step, 10);
        const value = !advancedBeat.steps[track][step];
        advancedBeat.steps[track][step] = value;
        cell.classList.toggle("on", value);
    }

    function attachAdvancedTransport() {
        advPlayBtn.addEventListener("click", startAdvancedPlayback);
        advStopBtn.addEventListener("click", stopAdvancedPlayback);
    }

    function startAdvancedPlayback() {
        const ctx = getAudioContext();
        const bpm = advancedBeat.bpm || 90;
        const stepDuration = stepDurationFromBpm(bpm);
        const totalSteps = 32;

        if (advancedPlayback.isPlaying) return;

        advancedPlayback.isPlaying = true;
        advPlayBtn.disabled = true;
        advStopBtn.disabled = false;
        advIndicator.textContent = `Playing @ ${bpm} BPM`;

        let step = 0;

        function tick() {
            if (!advancedPlayback.isPlaying) return;

            const now = ctx.currentTime;
            advancedPlayback.currentStep = step;

            if (advancedBeat.steps.kick[step]) DrumSynth.kick(now, ctx);
            if (advancedBeat.steps.snare[step]) DrumSynth.snare(now, ctx);
            if (advancedBeat.steps.ch[step]) DrumSynth.hihat(now, ctx);
            if (advancedBeat.steps.oh[step]) DrumSynth.hihat(now + 0.01, ctx);
            if (advancedBeat.steps.perc[step]) DrumSynth.snare(now + 0.02, ctx);

            highlightAdvancedStep(step);
            step = (step + 1) % totalSteps;

            advancedPlayback.intervalId = setTimeout(tick, stepDuration * 1000);
        }

        tick();
    }

    function stopAdvancedPlayback() {
        advancedPlayback.isPlaying = false;
        advPlayBtn.disabled = false;
        advStopBtn.disabled = true;
        advIndicator.textContent = "Idle";

        if (advancedPlayback.intervalId) {
            clearTimeout(advancedPlayback.intervalId);
            advancedPlayback.intervalId = null;
        }
        clearAdvancedStepHighlight();
    }

    function highlightAdvancedStep(stepIndex) {
        const cells = document.querySelectorAll("#advanced-grid .step-cell");
        cells.forEach((cell) => cell.classList.remove("playhead"));
        const matching = document.querySelectorAll(`#advanced-grid .step-cell[data-step="${stepIndex}"]`);
        matching.forEach((cell) => cell.classList.add("playhead"));
    }

    function clearAdvancedStepHighlight() {
        document.querySelectorAll("#advanced-grid .step-cell").forEach((cell) => {
            cell.classList.remove("playhead");
        });
    }

    function attachAdvancedImportExport() {
        const importTextarea = document.getElementById("advanced-import-text");
        const importBtn = document.getElementById("advanced-import-btn");
        const exportTextBtn = document.getElementById("advanced-export-text-btn");
        const exportJsonBtn = document.getElementById("advanced-export-json-btn");

        exportTextBtn.addEventListener("click", () => {
            const text = buildAdvancedBeatText();
            navigator.clipboard.writeText(text)
                .then(() => showImportStatus("Copied text beat to clipboard.", "ok"))
                .catch(() => showImportStatus("Failed to copy.", "error"));
        });

        exportJsonBtn.addEventListener("click", () => {
            const json = JSON.stringify(advancedBeat, null, 2);
            navigator.clipboard.writeText(json)
                .then(() => showImportStatus("Copied JSON to clipboard.", "ok"))
                .catch(() => showImportStatus("Failed to copy JSON.", "error"));
        });

        importBtn.addEventListener("click", () => {
            const raw = importTextarea.value.trim();
            if (!raw) return;

            try {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.steps) {
                    advancedBeat = {
                        ...advancedBeat,
                        ...parsed,
                        steps: {
                            ...advancedBeat.steps,
                            ...parsed.steps
                        }
                    };
                    // Restore arrays if needed (JSON doesn't store sparse arrays well, but we use full arrays)
                    buildAdvancedGrid();
                    showImportStatus("Imported from JSON.", "ok");
                    return;
                }
            } catch (e) {
                // ignore
            }

            // Fallback: simple text parser
            const lines = raw.split(/\r?\n/);
            const newSteps = { ...advancedBeat.steps };
            // Clear current steps first? Or merge? Let's clear for clean import.
            Object.keys(newSteps).forEach(k => newSteps[k] = Array(32).fill(false));

            lines.forEach((line) => {
                const [name, pattern] = line.split(":");
                if (!name || !pattern) return;
                const key = name.trim().toLowerCase();
                if (!newSteps[key]) return;
                const tokens = pattern.trim().split(/\s+/);
                for (let i = 0; i < Math.min(tokens.length, 32); i++) {
                    newSteps[key][i] = tokens[i] !== ".";
                }
            });

            advancedBeat.steps = newSteps;
            buildAdvancedGrid();
            showImportStatus("Imported from text pattern.", "ok");
        });
    }

    function buildAdvancedBeatText() {
        const tracks = advancedBeat.tracks;
        const lines = [];
        lines.push(`BPM: ${advancedBeat.bpm}`);
        lines.push(`Key: ${advancedBeat.key}`);
        lines.push("");

        tracks.forEach((track) => {
            const label = track.toUpperCase();
            const row = advancedBeat.steps[track]
                .map((v) => (v ? track[0].toUpperCase() : "."))
                .join(" ");
            lines.push(`${label}: ${row}`);
        });

        return lines.join("\n");
    }

    function showImportStatus(message, type) {
        const el = document.getElementById("advanced-import-status");
        el.textContent = message;
        el.className = "import-status " + (type || "");
        setTimeout(() => {
            el.textContent = "";
            el.className = "import-status";
        }, 3000);
    }
});
