# Beat Maker AI 🎧

**Beat Maker AI** is a comprehensive suite for AI-powered music creation, combining a powerful Python-based logic engine (**BeatBoard**) with a sleek, modern web interface (**BeatForge**). It allows users to generate unique beat ideas, explore music theory concepts, and visualize drum patterns instantly.

## 🚀 Features

### 🧠 AI Beat Generation
- **Mood-Based Logic**: Select from diverse moods including **Sad**, **Hype**, **Lofi**, **Drill**, **RnB**, and **Dark Trap**.
- **Smart Recommendations**: Automatically suggests appropriate **BPM** (Tempo) and **Keys** based on the selected mood.
- **Music Theory Engine**: Generates musically correct **Chord Progressions** using Roman Numeral analysis (e.g., `ii - V - I`).

### 🥁 Dynamic Drum Patterns
- **Style-Specific Rhythms**: Includes pre-defined patterns like *Boom Bap*, *Trap Triplet*, *Drill Bounce*, and *Lofi Lazy*.
- **Visual Sequencer**: View and edit drum patterns on an interactive 16-step grid.

### 💻 Dual Interface
1.  **BeatBoard (Backend/CLI)**: A robust Python application that handles the core logic, generation algorithms, and serves the API.
2.  **BeatForge (Frontend)**: A modern, responsive web application featuring:
    -   **Real-time Audio Playback**: Built with the Web Audio API for instant preview.
    -   **Interactive Step Sequencer**: Click to add/remove kicks, snares, and hi-hats.
    -   **Sleek UI**: Designed with a premium aesthetic using glassmorphism and smooth animations.

---

## 📂 Project Structure

The project consists of two main components:

```text
beatmaker/
├── BeatBoard/                  # 🐍 Python Backend & Logic Core
│   ├── beatboard/              # Core Logic Package
│   │   ├── moods.py            # Mood configurations & rules
│   │   ├── chords.py           # Music theory & chord generation
│   │   ├── drums.py            # Drum pattern library
│   │   └── generator.py        # Main beat generation algorithms
│   ├── static/                 # Web Assets (JS/CSS for the Python app)
│   ├── templates/              # HTML Templates
│   ├── app.py                  # FastAPI Web Server
│   ├── main.py                 # CLI Entry Point
│   └── requirements.txt        # Python Dependencies
│
└── BeatForge/                  # 🎨 Modern Frontend Interface
    ├── index.html              # Main Application Structure
    ├── script.js               # Frontend Logic & Audio Engine
    └── styles.css              # Styling & Design System
```

---

## 🛠️ Installation & Usage

### Prerequisites
- Python 3.8+
- A modern web browser (Chrome, Firefox, Edge)

### 1. Setup the Backend (BeatBoard)

1.  Navigate to the `BeatBoard` directory:
    ```bash
    cd BeatBoard
    ```
2.  Create and activate a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

### 2. Run the Application

#### Option A: Web Interface (Recommended)
Start the local server to use the full web app experience:
```bash
python app.py
```
Open your browser and go to: [http://127.0.0.1:8000](http://127.0.0.1:8000)

#### Option B: Command Line Interface (CLI)
Generate beat ideas directly in your terminal:
```bash
python main.py
```
Follow the on-screen prompts to select a mood and view the generated output text.

---

## 🎹 How It Works

1.  **Select a Mood**: The engine picks a mood configuration from `moods.py`.
2.  **Generate Parameters**:
    -   **BPM**: Randomly selected within the mood's typical range.
    -   **Key**: Chosen from a list of compatible keys.
    -   **Chords**: A progression template is selected and translated into actual chords (e.g., `Am7 - Dm7`) by `chords.py`.
    -   **Drums**: A pattern style is selected from `drums.py`.
3.  **Visualize & Play**: The frontend receives this data, renders the drum grid, and uses the browser's audio synthesizer to play the beat in real-time.

---

## 🔮 Future Roadmap
- [ ] MIDI File Export
- [ ] Save & Load User Presets
- [ ] More Advanced Sound Design (Synth integration)
- [ ] Mobile App Version
