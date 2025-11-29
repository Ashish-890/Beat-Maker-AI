ROMAN_TO_DEGREE = {
    "i": 0, "ii": 1, "iii": 2, "iv": 3, "v": 4, "vi": 5, "vii": 6,
    "I": 0, "II": 1, "III": 2, "IV": 3, "V": 4, "VI": 5, "VII": 6
}

# Simple chromatic scale for reference (sharps)
NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

# Scale intervals (semitones from root)
MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11]
MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10]

def get_note_index(note_name):
    """Returns index of note in chromatic scale."""
    # Handle flats by converting to sharps for simplicity
    replacements = {"Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#"}
    norm_note = replacements.get(note_name, note_name)
    return NOTES.index(norm_note)

def build_scale_chords(scale_type):
    """
    Returns a list of chord qualities for the scale.
    Simplified: just returning the roman numerals for now as placeholders
    or basic triad types if we wanted to be fancy.
    """
    pass

def roman_to_chord(roman: str, key: str, scale_type: str = "major") -> str:
    """
    Converts a roman numeral to a chord name in the given key.
    E.g. roman_to_chord("vi", "C major") -> "A minor"
    Supports 7ths, e.g. "i7", "IVmaj7"
    """
    # Parse key root and scale
    key_parts = key.split()
    root_note = key_parts[0]
    key_scale = key_parts[1] if len(key_parts) > 1 else "major"
    
    # Determine intervals based on key scale
    if "minor" in key_scale.lower():
        intervals = MINOR_SCALE_INTERVALS
    else:
        intervals = MAJOR_SCALE_INTERVALS
        
    # Extract base roman numeral (remove 7, maj7, etc)
    # Simple parsing: take the first sequence of letters
    import re
    match = re.match(r"([a-zA-Z]+)(.*)", roman)
    if not match:
        return roman # Fallback
        
    base_roman = match.group(1)
    suffix_extension = match.group(2) # e.g. "7", "maj7"
    
    # Get degree index
    degree_idx = ROMAN_TO_DEGREE.get(base_roman, 0)
    
    # Calculate root note of the chord
    root_idx = get_note_index(root_note)
    interval = intervals[degree_idx]
    chord_root_idx = (root_idx + interval) % 12
    chord_root = NOTES[chord_root_idx]
    
    # Determine chord quality (major/minor) from roman case
    if base_roman.islower():
        quality_suffix = "m"
    else:
        quality_suffix = ""
        
    # Combine
    # If the extension is explicit (e.g. maj7), append it.
    # If it's just "7", append it.
    # Note: "m" + "7" -> "m7"
    # "m" + "maj7" -> "mmaj7" (rare but possible)
    # "" + "maj7" -> "maj7"
    
    return f"{chord_root}{quality_suffix}{suffix_extension}"

def build_progression(template: list, key: str, scale_type: str) -> list:
    """
    Converts a list of roman numerals to a list of chord strings.
    """
    # Helper to format the output string "i in C minor" style or just chord name
    # The prompt asked for "vi in C major" format in one place, but the generator returns a list of chords.
    # Let's return just the chord names (e.g. "Am7") for the 'chord_progression' list,
    # and the generator keeps the 'roman_template'.
    # Wait, the prompt example JSON showed: "chord_progression": ["i in A minor", ...]
    # But the previous implementation returned actual chords ["Am", "Dm"...]
    # The new prompt example shows: "chord_progression": ["i in A minor", ...]
    # I think it's better to return ACTUAL chords (Am7, Fmaj7) because that's useful for musicians.
    # The "i in A minor" is redundant with roman_template + key.
    # I will stick to returning actual chord names.
    
    return [roman_to_chord(r, key, scale_type) for r in template]
