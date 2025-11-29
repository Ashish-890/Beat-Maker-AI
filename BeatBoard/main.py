import sys
from beatboard.generator import generate_beat_idea
from beatboard.moods import MOODS

def print_banner():
    print("\n" + "="*40)
    print(" 🎧  BeatBoard – Beat Idea Generator  🎧")
    print("="*40 + "\n")

def main():
    print_banner()
    
    available_moods = ", ".join(MOODS.keys())
    print(f"Available moods: {available_moods}")
    
    try:
        mood = input("Enter a mood: ").strip().lower()
        if mood not in MOODS:
            print(f"Error: '{mood}' is not a valid mood. Please choose from: {available_moods}")
            return
            
        beat = generate_beat_idea(mood)
        
        print("\n" + "-"*40)
        print(f"Mood: {beat['mood'].upper()} - {beat['description']}")
        print(f"BPM: {beat['bpm']}  |  Key: {beat['key']}")
        print("-"*40)
        
        print("\n🎹 Chord Progression:")
        print(f"Roman: {' - '.join(beat['roman_template'])}")
        print(f"Chords: {' - '.join(beat['chord_progression'])}")
        
        print("\n🥁 Drum Pattern:")
        print(f"Style: {beat['drum_pattern_name']}")
        print(f"Desc: {beat['drum_pattern']['description']}")
        print("\nGrid:")
        print(f"HiHat: {beat['drum_pattern']['hihat']}")
        print(f"Snare: {beat['drum_pattern']['snare']}")
        for bar in beat['drum_pattern']['bars']:
            print(f"Kick:  {bar}")
            
        print("\n" + "="*40 + "\n")
        
    except KeyboardInterrupt:
        print("\nExiting...")
    except Exception as e:
        print(f"\nAn error occurred: {e}")

if __name__ == "__main__":
    main()
