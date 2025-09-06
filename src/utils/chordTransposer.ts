import type { ChromaticNote } from '../types';

// Chord transposition engine for real-time key changes
export class ChordTransposer {
  private static readonly CHROMATIC_SCALE: ChromaticNote[] = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
  ];

  // Note: CHORD_PATTERNS reserved for future chord quality validation

  /**
   * Transpose a chord from one key to another
   */
  static transposeChord(chord: string, fromKey: string, toKey: string, capoPosition: number = 0): string {
    if (!chord || chord.trim() === '') return chord;

    // Calculate semitone difference
    const semitones = this.calculateSemitones(fromKey, toKey) + capoPosition;
    
    return this.transposeChordBySemitones(chord, semitones);
  }

  /**
   * Transpose a chord by a specific number of semitones
   */
  static transposeChordBySemitones(chord: string, semitones: number): string {
    if (!chord || chord.trim() === '') return chord;

    // Parse the chord to extract root note and quality
    const chordParts = this.parseChord(chord);
    if (!chordParts) return chord;

    const { root, quality, bass } = chordParts;

    // Transpose the root note
    const newRoot = this.transposeNote(root, semitones);
    
    // Transpose bass note if present
    const newBass = bass ? this.transposeNote(bass, semitones) : null;

    // Reconstruct the chord
    return this.reconstructChord(newRoot, quality, newBass || undefined);
  }

  /**
   * Calculate semitone difference between two keys
   */
  private static calculateSemitones(fromKey: string, toKey: string): number {
    const fromIndex = this.getNoteIndex(this.parseNote(fromKey));
    const toIndex = this.getNoteIndex(this.parseNote(toKey));
    
    let semitones = toIndex - fromIndex;
    
    // Normalize to 0-11 range
    while (semitones < 0) semitones += 12;
    while (semitones >= 12) semitones -= 12;
    
    return semitones;
  }

  /**
   * Parse a chord into its components
   */
  private static parseChord(chord: string): { root: string; quality: string; bass?: string } | null {
    // Handle slash chords (e.g., "C/E", "Am/G")
    const slashIndex = chord.indexOf('/');
    let bass: string | undefined;
    let mainChord = chord;

    if (slashIndex !== -1) {
      bass = chord.substring(slashIndex + 1);
      mainChord = chord.substring(0, slashIndex);
    }

    // Extract root note (including sharp/flat)
    const rootMatch = mainChord.match(/^([A-G][#b]?)/);
    if (!rootMatch) return null;

    const root = rootMatch[1];
    const quality = mainChord.substring(root.length);

    return { root, quality, bass };
  }

  /**
   * Parse a note string to get the base note
   */
  private static parseNote(note: string): string {
    const match = note.match(/^([A-G][#b]?)/);
    return match ? match[1] : note;
  }

  /**
   * Get the chromatic index of a note
   */
  private static getNoteIndex(note: string): number {
    // Handle enharmonic equivalents
    const noteMap: { [key: string]: number } = {
      'C': 0, 'B#': 0,
      'C#': 1, 'Db': 1,
      'D': 2,
      'D#': 3, 'Eb': 3,
      'E': 4, 'Fb': 4,
      'F': 5, 'E#': 5,
      'F#': 6, 'Gb': 6,
      'G': 7,
      'G#': 8, 'Ab': 8,
      'A': 9,
      'A#': 10, 'Bb': 10,
      'B': 11, 'Cb': 11
    };

    return noteMap[note] ?? 0;
  }

  /**
   * Transpose a single note by semitones
   */
  private static transposeNote(note: string, semitones: number): string {
    const currentIndex = this.getNoteIndex(note);
    let newIndex = (currentIndex + semitones) % 12;
    
    if (newIndex < 0) newIndex += 12;

    // Prefer sharps for sharp keys, flats for flat keys
    const newNote = this.CHROMATIC_SCALE[newIndex];
    
    // Handle enharmonic spelling preferences
    return this.getPreferredSpelling(newNote, note);
  }

  /**
   * Get preferred enharmonic spelling based on original note
   */
  private static getPreferredSpelling(newNote: ChromaticNote, originalNote: string): string {
    // If original note used flats, prefer flats in result
    if (originalNote.includes('b')) {
      const flatEquivalents: { [key: string]: string } = {
        'C#': 'Db',
        'D#': 'Eb',
        'F#': 'Gb',
        'G#': 'Ab',
        'A#': 'Bb'
      };
      return flatEquivalents[newNote] || newNote;
    }
    
    return newNote;
  }

  /**
   * Reconstruct a chord from its components
   */
  private static reconstructChord(root: string, quality: string, bass?: string): string {
    let result = root + quality;
    if (bass) {
      result += '/' + bass;
    }
    return result;
  }

  /**
   * Get all possible keys for transposition
   */
  static getAllKeys(): string[] {
    return [
      'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 
      'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
      'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 
      'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bbm', 'Bm'
    ];
  }

  /**
   * Calculate the effective key considering capo position
   */
  static getEffectiveKey(originalKey: string, capoPosition: number): string {
    return this.transposeChordBySemitones(originalKey, capoPosition);
  }

  /**
   * Get suggested capo positions for easier chord shapes
   */
  static getSuggestedCapoPositions(fromKey: string, toKey: string): number[] {
    const semitones = this.calculateSemitones(fromKey, toKey);
    const suggestions: number[] = [];
    
    // Common capo positions that result in easy chord shapes
    const easyKeys = ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Bm', 'F#m', 'C#m'];
    
    for (let capo = 0; capo <= 12; capo++) {
      const effectiveKey = this.transposeChordBySemitones(fromKey, -capo);
      if (easyKeys.includes(effectiveKey)) {
        const targetCapo = (semitones + capo) % 12;
        if (targetCapo >= 0 && targetCapo <= 7) { // Practical capo range
          suggestions.push(targetCapo);
        }
      }
    }
    
    return [...new Set(suggestions)].sort((a, b) => a - b);
  }
}
