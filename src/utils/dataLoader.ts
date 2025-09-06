import type { Song, Setlist, LoopTrack } from '../types';
import { ChordProParser } from './chordProParser';

// Data loading utilities for ChordPro song files and JSON metadata
interface SongIndex {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  tempo: number;
  capoPosition: number;
}

class DataLoader {
  private static instance: DataLoader;
  private songsIndexCache: SongIndex[] | null = null;
  private individualSongsCache: Map<string, Song> = new Map();
  private setlistsCache: Setlist[] | null = null;
  private loopsCache: LoopTrack[] | null = null;

  private constructor() {}

  static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  async loadSongsIndex(): Promise<SongIndex[]> {
    if (this.songsIndexCache) {
      return this.songsIndexCache;
    }

    try {
      const response = await fetch('/data/songs/index.json');
      if (!response.ok) {
        throw new Error(`Failed to load songs index: ${response.statusText}`);
      }
      this.songsIndexCache = await response.json();
      return this.songsIndexCache ?? [];
    } catch (error) {
      console.error('Error loading songs index:', error);
      return [];
    }
  }

  async loadSongs(): Promise<Song[]> {
    const index = await this.loadSongsIndex();
    const songs: Song[] = [];
    
    for (const songInfo of index) {
      const song = await this.getSongById(songInfo.id);
      if (song) {
        songs.push(song);
      }
    }
    
    return songs;
  }

  async loadSetlists(): Promise<Setlist[]> {
    if (this.setlistsCache) {
      return this.setlistsCache;
    }

    try {
      const response = await fetch('/data/setlists/setlists.json');
      if (!response.ok) {
        throw new Error(`Failed to load setlists: ${response.statusText}`);
      }
      const setlistsData = await response.json();
      
      // Convert date strings to Date objects
      this.setlistsCache = setlistsData.map((setlist: any) => ({
        ...setlist,
        createdAt: new Date(setlist.createdAt),
        updatedAt: new Date(setlist.updatedAt),
      }));
      
      return this.setlistsCache ?? [];
    } catch (error) {
      console.error('Error loading setlists:', error);
      return [];
    }
  }

  async loadLoops(): Promise<LoopTrack[]> {
    if (this.loopsCache) {
      return this.loopsCache;
    }

    try {
      const response = await fetch('/data/loops/loops.json');
      if (!response.ok) {
        throw new Error(`Failed to load loops: ${response.statusText}`);
      }
      this.loopsCache = await response.json();
      return this.loopsCache ?? [];
    } catch (error) {
      console.error('Error loading loops:', error);
      return [];
    }
  }

  async getSongById(id: string): Promise<Song | null> {
    // Check cache first
    if (this.individualSongsCache.has(id)) {
      return this.individualSongsCache.get(id) || null;
    }

    try {
      // Load ChordPro file
      const response = await fetch(`/data/songs/${id}.chordpro`);
      
      if (!response.ok) {
        throw new Error(`Failed to load song ${id}: ${response.statusText}`);
      }
      
      // Parse ChordPro format
      const chordproContent = await response.text();
      const song = ChordProParser.parseChordPro(chordproContent, id);
      
      // Cache the loaded song
      this.individualSongsCache.set(id, song);
      return song;
    } catch (error) {
      console.error(`Error loading song ${id}:`, error);
      return null;
    }
  }

  async getSetlistById(id: string): Promise<Setlist | null> {
    const setlists = await this.loadSetlists();
    return setlists.find(setlist => setlist.id === id) || null;
  }

  async getLoopsByKey(key: string): Promise<LoopTrack[]> {
    const loops = await this.loadLoops();
    return loops.filter(loop => loop.key === key);
  }

  async getSetlistWithSongs(setlistId: string): Promise<{ setlist: Setlist; songs: Song[] } | null> {
    const setlist = await this.getSetlistById(setlistId);
    if (!setlist) return null;

    const songs: Song[] = [];
    for (const setlistSong of setlist.songs.sort((a, b) => a.order - b.order)) {
      const song = await this.getSongById(setlistSong.songId);
      if (song) {
        songs.push(song);
      }
    }

    return { setlist, songs };
  }

  // Clear cache (useful for development)
  clearCache(): void {
    this.songsIndexCache = null;
    this.individualSongsCache.clear();
    this.setlistsCache = null;
    this.loopsCache = null;
  }

  // Get songs index for efficient listing (without loading full song content)
  async getSongsIndex(): Promise<SongIndex[]> {
    return this.loadSongsIndex();
  }

  // Preload specific songs (useful for setlists)
  async preloadSongs(songIds: string[]): Promise<void> {
    const loadPromises = songIds.map(id => this.getSongById(id));
    await Promise.all(loadPromises);
  }
}

export const dataLoader = DataLoader.getInstance();
