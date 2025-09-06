import type { Song, Setlist, LoopTrack } from '../types';

// Data loading utilities for static JSON files
class DataLoader {
  private static instance: DataLoader;
  private songsCache: Song[] | null = null;
  private setlistsCache: Setlist[] | null = null;
  private loopsCache: LoopTrack[] | null = null;

  private constructor() {}

  static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  async loadSongs(): Promise<Song[]> {
    if (this.songsCache) {
      return this.songsCache;
    }

    try {
      const response = await fetch('/data/songs/songs.json');
      if (!response.ok) {
        throw new Error(`Failed to load songs: ${response.statusText}`);
      }
      const songsData = await response.json();
      
      // Convert date strings to Date objects
      this.songsCache = songsData.map((song: any) => ({
        ...song,
        metadata: {
          ...song.metadata,
          createdAt: new Date(song.metadata.createdAt),
          updatedAt: new Date(song.metadata.updatedAt),
        }
      }));
      
      return this.songsCache ?? [];
    } catch (error) {
      console.error('Error loading songs:', error);
      return [];
    }
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
    const songs = await this.loadSongs();
    return songs.find(song => song.id === id) || null;
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
    this.songsCache = null;
    this.setlistsCache = null;
    this.loopsCache = null;
  }
}

export const dataLoader = DataLoader.getInstance();
