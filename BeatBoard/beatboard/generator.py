from .moods import (
    pick_mood,
    random_bpm_for_mood,
    random_key_for_mood,
    random_progression_template,
    random_drum_pattern_name
)
from .chords import build_progression
from .drums import get_drum_pattern

def generate_beat_idea(mood_name: str) -> dict:
    """
    Returns a dict with:
      mood, description, bpm, key,
      roman_template, chord_progression,
      drum_pattern_name, drum_pattern (dict)
    """
    mood_cfg = pick_mood(mood_name)
    if not mood_cfg:
        raise ValueError(f"Unknown mood: {mood_name}")

    bpm = random_bpm_for_mood(mood_cfg)
    key = random_key_for_mood(mood_cfg)
    roman_template = random_progression_template(mood_cfg)
    
    # Extract scale type from mood config or infer from key
    scale_type = mood_cfg.get("scale", "minor")
    
    chord_progression = build_progression(roman_template, key, scale_type)
    
    drum_pattern_name = random_drum_pattern_name(mood_cfg)
    drum_pattern = get_drum_pattern(drum_pattern_name)

    return {
        "mood": mood_name,
        "description": mood_cfg["description"],
        "bpm": bpm,
        "key": key,
        "roman_template": roman_template,
        "chord_progression": chord_progression,
        "drum_pattern_name": drum_pattern_name,
        "drum_pattern": drum_pattern
    }
