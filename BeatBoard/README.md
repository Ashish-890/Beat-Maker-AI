# BeatBoard – Beat Idea Generator 🎧

BeatBoard is a full-stack application that generates beat ideas based on selected moods. It includes a Python core library, a CLI tool, and a modern web interface.

## Features

- **Mood-based Generation**: Choose from Sad, Hype, or Lofi moods.
- **Smart Suggestions**: Get BPM, Key, and Scale recommendations.
- **Chord Progressions**: Generates roman numeral templates and actual chords in key.
- **Drum Patterns**: Provides style-appropriate drum patterns with grid visualization.
- **Dual Interface**: Use via Terminal (CLI) or Web Browser (FastAPI + HTML/JS).

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd BeatBoard
    ```

2.  Create a virtual environment:
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

## How to Run

### CLI (Terminal)
Run the command-line interface:
```bash
python main.py
```
Follow the prompts to select a mood and see the result.

### Web App
Start the web server:
```bash
python app.py
```
Then open your browser and navigate to: [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Project Structure

```
BeatBoard/
├── beatboard/          # Core logic package
│   ├── moods.py        # Mood configurations
│   ├── chords.py       # Chord progression logic
│   ├── drums.py        # Drum pattern definitions
│   └── generator.py    # Main generation logic
├── templates/          # HTML templates
├── static/             # CSS and JS files
├── main.py             # CLI entry point
├── app.py              # Web backend (FastAPI)
└── requirements.txt    # Dependencies
```

## Future Improvements

- Export to MIDI file
- React Frontend
- User accounts & saving presets
- More moods & genres
