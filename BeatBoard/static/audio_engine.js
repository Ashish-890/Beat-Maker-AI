class BeatPlayer {
    constructor() {
        this.audioCtx = null;
        this.isPlaying = false;
        this.currentStep = 0;
        this.nextNoteTime = 0;
        this.tempo = 120;
        this.lookahead = 25.0; // ms
        this.scheduleAheadTime = 0.1; // s
        this.timerID = null;

        this.beatData = null;
    }

    init() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    setBeat(beatData) {
        this.beatData = beatData;
        this.tempo = beatData.bpm;
    }

    play() {
        this.init();
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.currentStep = 0;
        this.nextNoteTime = this.audioCtx.currentTime;
        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        clearTimeout(this.timerID);
    }

    scheduler() {
        while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentStep, this.nextNoteTime);
            this.nextNote();
        }
        if (this.isPlaying) {
            this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
        }
    }

    nextNote() {
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextNoteTime += 0.25 * secondsPerBeat; // 16th notes
        this.currentStep++;
        if (this.currentStep === 16) {
            this.currentStep = 0;
        }
    }

    scheduleNote(stepNumber, time) {
        if (!this.beatData) return;

        const drumPattern = this.beatData.drum_pattern;

        // Kick
        // The bars array might contain multiple bars, we'll just loop the first one for now
        // Format: "K . . . S . . ."
        const kickStr = drumPattern.bars[0].replace(/\s/g, '');
        if (kickStr[stepNumber] === 'K') {
            this.playKick(time);
        }

        // Snare
        const snareStr = drumPattern.snare.replace(/\s/g, '');
        if (snareStr[stepNumber] === 'S') {
            this.playSnare(time);
        }

        // HiHat
        const hihatStr = drumPattern.hihat.replace(/\s/g, '');
        if (hihatStr[stepNumber] === 'H') {
            this.playHiHat(time);
        }

        // Simple Chord Synth (on beat 1 of every bar, or every 4 steps)
        if (stepNumber % 16 === 0) {
            this.playChord(time);
        }
    }

    playKick(time) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        osc.start(time);
        osc.stop(time + 0.5);
    }

    playSnare(time) {
        const noiseBuffer = this.createNoiseBuffer();
        const noise = this.audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseFilter = this.audioCtx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        const noiseEnvelope = this.audioCtx.createGain();

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseEnvelope);
        noiseEnvelope.connect(this.audioCtx.destination);

        noiseEnvelope.gain.setValueAtTime(1, time);
        noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        noise.start(time);
        noise.stop(time + 0.2);

        // Add a "tone" to the snare
        const osc = this.audioCtx.createOscillator();
        const oscEnv = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.connect(oscEnv);
        oscEnv.connect(this.audioCtx.destination);
        osc.frequency.setValueAtTime(250, time);
        oscEnv.gain.setValueAtTime(0.5, time);
        oscEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
    }

    playHiHat(time) {
        const fundamental = 40;
        const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
        const bandpass = this.audioCtx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.value = 10000;
        const highpass = this.audioCtx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 7000;
        const gain = this.audioCtx.createGain();

        bandpass.connect(highpass);
        highpass.connect(gain);
        gain.connect(this.audioCtx.destination);

        ratios.forEach(ratio => {
            const osc = this.audioCtx.createOscillator();
            osc.type = "square";
            osc.frequency.value = fundamental * ratio;
            osc.connect(bandpass);
            osc.start(time);
            osc.stop(time + 0.05);
        });

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    }

    playChord(time) {
        // Very simple placeholder chord synth
        // In a real app, we'd parse the chord name (e.g. "Am") and play specific frequencies
        // For now, just playing a root note based on key is complex enough for this snippet
        // Let's just play a drone note that fits most things nicely
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 220; // A3

        // Lowpass filter to make it softer
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);

        gain.gain.setValueAtTime(0.1, time);
        gain.gain.linearRampToValueAtTime(0, time + 2.0); // Long decay

        osc.start(time);
        osc.stop(time + 2.0);
    }

    createNoiseBuffer() {
        const bufferSize = this.audioCtx.sampleRate * 2; // 2 seconds
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }
}
