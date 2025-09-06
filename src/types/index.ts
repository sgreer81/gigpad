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
  id: string; // UUID v4
  name: string;
  description?: string;
  songs: SetlistSong[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    estimatedDuration?: number; // calculated from song tempos
    tags?: string[];
  };
}

export interface SetlistSong {
  songId: string; // References song from library
  order: number; // 0-based ordering
  customKey?: string; // Override original song key
  customCapo?: number; // Override original capo position
  notes?: string; // Performance-specific notes
  addedAt: Date; // When song was added to setlist
}

export interface SetlistMetadata {
  id: string;
  name: string;
  description?: string;
  songCount: number;
  estimatedDuration?: number;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
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
  currentView: 'setlists' | 'performance' | 'songs' | 'settings';
  currentSetlist?: Setlist;
  currentSongIndex?: number;
  isPlaying: boolean;
  currentTrack?: LoopTrack;
  volume: number;
}

// Setlist Management types
export interface SetlistStorage {
  // CRUD Operations
  createSetlist(setlist: Omit<Setlist, 'id' | 'metadata'>): Promise<Setlist>;
  getSetlist(id: string): Promise<Setlist | null>;
  getAllSetlists(): Promise<SetlistMetadata[]>;
  updateSetlist(id: string, updates: Partial<Setlist>): Promise<Setlist>;
  deleteSetlist(id: string): Promise<boolean>;
  
  // Utility Operations
  duplicateSetlist(id: string, newName: string): Promise<Setlist>;
  addSongToSetlist(setlistId: string, songId: string, position?: number): Promise<Setlist>;
  removeSongFromSetlist(setlistId: string, songId: string): Promise<Setlist>;
  reorderSetlistSongs(setlistId: string, fromIndex: number, toIndex: number): Promise<Setlist>;
  
  // Data Management
  exportSetlists(): Promise<string>; // JSON export
  importSetlists(data: string): Promise<Setlist[]>;
  clearAllSetlists(): Promise<void>;
}

export interface SetlistContextType {
  // State
  setlists: SetlistMetadata[];
  currentSetlist: Setlist | null;
  isEditing: boolean;
  songLibrary: Song[];
  
  // Actions
  createSetlist: (name: string, description?: string) => Promise<void>;
  editSetlist: (id: string) => Promise<void>;
  saveSetlist: () => Promise<void>;
  deleteSetlist: (id: string) => Promise<boolean>;
  addSongToSetlist: (songId: string, position?: number) => void;
  removeSongFromSetlist: (songId: string) => void;
  reorderSongs: (fromIndex: number, toIndex: number) => void;
  
  // Utility
  duplicateSetlist: (id: string, newName: string) => Promise<Setlist>;
  loadSetlist: (id: string) => Promise<void>;
  clearCurrentSetlist: () => void;
  refreshSetlists: () => Promise<void>;
}

export interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  tempo?: number;
  capoPosition?: number;
  tags?: string[];
}

// Chord transposition types
export type ChromaticNote = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export interface ChordTransposition {
  fromKey: string;
  toKey: string;
  capoPosition: number;
}

// Song override types for persistent settings
export interface SongOverride {
  songId: string;
  customKey?: string; // Transposed key
  customCapo?: number; // Capo position
  updatedAt: Date;
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
