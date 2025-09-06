// Core data types for the Live Guitar Performance App

export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  capoPosition?: number; // 0 = no capo
  tempo?: number;
  sections: SongSection[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
  };
}

export interface SongSection {
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro';
  name?: string; // e.g., "Verse 1", "Chorus"
  content: ChordLyricLine[];
}

export interface ChordLyricLine {
  lyrics: string;
  chords: ChordPosition[];
}

export interface ChordPosition {
  chord: string; // e.g., "Am", "G7", "Cadd9"
  position: number; // character position in lyrics line
}

export interface Setlist {
  id: string;
  name: string;
  description?: string;
  songs: SetlistSong[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SetlistSong {
  songId: string;
  order: number;
  customKey?: string; // Override song's original key
  customCapo?: number; // Override song's capo position
  notes?: string; // Performance notes
}

export interface LoopTrack {
  id: string;
  key: string; // Musical key (C, C#, D, etc.)
  style: string; // e.g., "ambient-pad", "acoustic-strum"
  filePath: string; // Path to MP3 file
  duration: number; // Loop duration in seconds
  metadata: {
    tempo?: number;
    description?: string;
  };
}

// UI State types
export interface AppState {
  currentView: 'setlists' | 'performance' | 'songs';
  currentSetlist?: Setlist;
  currentSongIndex?: number;
  isPlaying: boolean;
  currentTrack?: LoopTrack;
  volume: number;
}

// Chord transposition types
export type ChromaticNote = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export interface ChordTransposition {
  fromKey: string;
  toKey: string;
  capoPosition: number;
}

// Performance mode types
export interface PerformanceState {
  currentSong: Song;
  currentKey: string;
  capoPosition: number;
  isPlaying: boolean;
  currentTrack?: LoopTrack;
  nextSong?: Song;
  previousSong?: Song;
}
