import random

MOODS = {
    "sad": {
        "bpm_range": (80, 96),
        "keys": ["A minor", "D minor", "E minor"],
        "scale": "minor",
        "progression_templates": [
            ["i", "VI", "III", "VII"],
            ["i", "iv", "v"],
            ["i", "VI", "VII", "VI"],
            ["i", "VI", "iv", "v"]
        ],
        "drum_patterns": ["boom_bap_basic", "halftime_groove", "lofi_lazy"],
        "description": "emotional storytelling beat"
    },
    "hype": {
        "bpm_range": (135, 155),
        "keys": ["F# minor", "G minor", "B minor"],
        "scale": "minor",
        "progression_templates": [
            ["i", "VII", "VI", "VII"],
            ["i", "V", "VI", "VII"],
            ["i", "III", "VII", "IV"]
        ],
        "drum_patterns": ["trap_triplet", "four_on_the_floor", "dark_trap_roll"],
        "description": "high energy / club banger"
    },
    "lofi": {
        "bpm_range": (70, 90),
        "keys": ["C major", "G major", "E minor"],
        "scale": "mix",
        "progression_templates": [
            ["ii7", "V7", "Imaj7"],
            ["vi7", "IVmaj7", "Imaj7", "V7"],
            ["Imaj7", "vi7", "ii7", "V7"]
        ],
        "drum_patterns": ["lofi_lazy", "swingy_boom_bap"],
        "description": "chill, study/late night vibe"
    },
    "drill": {
        "bpm_range": (140, 145),
        "keys": ["C minor", "C# minor", "D minor"],
        "scale": "minor",
        "progression_templates": [
            ["i", "VI", "i", "VI"],
            ["i", "v", "VI", "VII"]
        ],
        "drum_patterns": ["drill_bounce"],
        "description": "dark, sliding bass, syncopated kicks"
    },
    "rnb": {
        "bpm_range": (85, 105),
        "keys": ["Eb major", "Bb major", "F minor"],
        "scale": "major",
        "progression_templates": [
            ["ii7", "V7", "Imaj7", "vi7"],
            ["IVmaj7", "iii7", "vi7", "I7"]
        ],
        "drum_patterns": ["rnb_slow_jam"],
        "description": "smooth, soulful, romantic"
    },
    "dark_trap": {
        "bpm_range": (130, 160),
        "keys": ["C# minor", "D# minor", "F minor"],
        "scale": "minor",
        "progression_templates": [
            ["i", "i", "VI", "V"],
            ["i", "VII", "VI", "v"]
        ],
        "drum_patterns": ["dark_trap_roll", "trap_triplet"],
        "description": "eerie, aggressive, hard-hitting"
    }
}

def pick_mood(name: str) -> dict:
    """Returns the configuration dict for the given mood name."""
    return MOODS.get(name.lower())

def random_bpm_for_mood(mood_cfg: dict) -> int:
    """Returns a random BPM within the mood's range."""
    min_bpm, max_bpm = mood_cfg["bpm_range"]
    return random.randint(min_bpm, max_bpm)

def random_key_for_mood(mood_cfg: dict) -> str:
    """Returns a random key from the mood's list."""
    return random.choice(mood_cfg["keys"])

def random_progression_template(mood_cfg: dict) -> list:
    """Returns a random chord progression template (list of roman numerals)."""
    return random.choice(mood_cfg["progression_templates"])

def random_drum_pattern_name(mood_cfg: dict) -> str:
    """Returns a random drum pattern name from the mood's list."""
    return random.choice(mood_cfg["drum_patterns"])
