def get_drum_pattern(name: str) -> dict:
    """Returns the drum pattern configuration for the given name."""
    return DRUM_PATTERNS.get(name, DRUM_PATTERNS["boom_bap_basic"])

DRUM_PATTERNS = {
    "boom_bap_basic": {
        "description": "Classic 90s hip hop beat",
        "bars": ["K . . . S . . . K . K . S . . ."],
        "hihat": "H . H . H . H . H . H . H . H .",
        "snare": "S"
    },
    "halftime_groove": {
        "description": "Slow and heavy halftime feel",
        "bars": ["K . . . . . . . S . . . . . . ."],
        "hihat": "H . . . H . . . H . . . H . . .",
        "snare": "S"
    },
    "trap_triplet": {
        "description": "Fast hi-hats with heavy 808s",
        "bars": ["K . . . . . . . S . . . . . . ."],
        "hihat": "H H H H H H H H H H H H H H H H", 
        "snare": "S"
    },
    "four_on_the_floor": {
        "description": "House/Techno influence",
        "bars": ["K . . . K . . . K . . . K . . ."],
        "hihat": ". . H . . . H . . . H . . . H .",
        "snare": "S"
    },
    "lofi_lazy": {
        "description": "Off-grid relaxed swing",
        "bars": ["K . . . S . . . . K . . S . . ."],
        "hihat": "H . . H . . H . . H . . H . . .",
        "snare": "S"
    },
    "swingy_boom_bap": {
        "description": "J Dilla style swing",
        "bars": ["K . . . S . . K . . K . S . . ."],
        "hihat": "H . H . H . H . H . H . H . H .",
        "snare": "S"
    },
    # New Patterns
    "drill_bounce": {
        "description": "Syncopated drill kicks and sliding hats",
        "bars": ["K . . . . . K . . . K . . . . ."],
        "hihat": "H . H H . H . H H . H . H H . H",
        "snare": "S"
    },
    "rnb_slow_jam": {
        "description": "Smooth and spacious",
        "bars": ["K . . . . . . . S . . . . K . ."],
        "hihat": "H . H . H . H . H . H . H . H .",
        "snare": "S"
    },
    "dark_trap_roll": {
        "description": "Aggressive trap with snare rolls",
        "bars": ["K . . . . . . . S . . . K . K ."],
        "hihat": "H H H H H H H H H H H H H H H H",
        "snare": "S"
    }
}
