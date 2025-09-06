import { v4 as uuidv4 } from 'uuid';
import type { Setlist, SetlistMetadata, SetlistSong, SetlistStorage } from '../types';

// Storage keys
const STORAGE_KEYS = {
  SETLISTS: 'gigpad_setlists',
  METADATA: 'gigpad_setlists_metadata',
  VERSION: 'gigpad_setlists_version'
} as const;

const CURRENT_VERSION = '1.0';

class SetlistStorageService implements SetlistStorage {
  private static instance: SetlistStorageService;

  private constructor() {
    this.initializeStorage();
  }

  static getInstance(): SetlistStorageService {
    if (!SetlistStorageService.instance) {
      SetlistStorageService.instance = new SetlistStorageService();
    }
    return SetlistStorageService.instance;
  }

  private initializeStorage(): void {
    // Check if storage exists and version is current
    const version = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (!version || version !== CURRENT_VERSION) {
      this.migrateStorage(version);
    }
  }

  private migrateStorage(currentVersion: string | null): void {
    // Handle migration from different versions
    if (!currentVersion) {
      // First time setup - initialize empty storage
      localStorage.setItem(STORAGE_KEYS.SETLISTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    }
    // Add future migration logic here as needed
  }

  private getStoredSetlists(): Setlist[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETLISTS);
      if (!stored) return [];
      
      const setlists = JSON.parse(stored);
      return setlists.map((setlist: any) => ({
        ...setlist,
        metadata: {
          ...setlist.metadata,
          createdAt: new Date(setlist.metadata.createdAt),
          updatedAt: new Date(setlist.metadata.updatedAt)
        },
        songs: setlist.songs.map((song: any) => ({
          ...song,
          addedAt: new Date(song.addedAt)
        }))
      }));
    } catch (error) {
      console.error('Error parsing stored setlists:', error);
      return [];
    }
  }

  private saveSetlists(setlists: Setlist[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETLISTS, JSON.stringify(setlists));
      
      // Update metadata cache
      const metadata: SetlistMetadata[] = setlists.map(setlist => ({
        id: setlist.id,
        name: setlist.name,
        description: setlist.description,
        songCount: setlist.songs.length,
        estimatedDuration: setlist.metadata.estimatedDuration,
        createdAt: setlist.metadata.createdAt,
        updatedAt: setlist.metadata.updatedAt,
        tags: setlist.metadata.tags
      }));
      
      localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving setlists:', error);
      throw new Error('Failed to save setlists to localStorage');
    }
  }

  async createSetlist(setlistData: Omit<Setlist, 'id' | 'metadata'>): Promise<Setlist> {
    const now = new Date();
    const newSetlist: Setlist = {
      id: uuidv4(),
      ...setlistData,
      metadata: {
        createdAt: now,
        updatedAt: now,
        estimatedDuration: this.calculateEstimatedDuration(setlistData.songs),
        tags: []
      }
    };

    const setlists = this.getStoredSetlists();
    setlists.push(newSetlist);
    this.saveSetlists(setlists);

    return newSetlist;
  }

  async getSetlist(id: string): Promise<Setlist | null> {
    const setlists = this.getStoredSetlists();
    return setlists.find(setlist => setlist.id === id) || null;
  }

  async getAllSetlists(): Promise<SetlistMetadata[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.METADATA);
      if (!stored) return [];
      
      const metadata = JSON.parse(stored);
      return metadata.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading setlist metadata:', error);
      // Fallback to full setlists if metadata is corrupted
      const setlists = this.getStoredSetlists();
      return setlists.map(setlist => ({
        id: setlist.id,
        name: setlist.name,
        description: setlist.description,
        songCount: setlist.songs.length,
        estimatedDuration: setlist.metadata.estimatedDuration,
        createdAt: setlist.metadata.createdAt,
        updatedAt: setlist.metadata.updatedAt,
        tags: setlist.metadata.tags
      }));
    }
  }

  async updateSetlist(id: string, updates: Partial<Setlist>): Promise<Setlist> {
    const setlists = this.getStoredSetlists();
    const index = setlists.findIndex(setlist => setlist.id === id);
    
    if (index === -1) {
      throw new Error(`Setlist with id ${id} not found`);
    }

    const updatedSetlist: Setlist = {
      ...setlists[index],
      ...updates,
      metadata: {
        ...setlists[index].metadata,
        ...updates.metadata,
        updatedAt: new Date(),
        estimatedDuration: updates.songs ? 
          this.calculateEstimatedDuration(updates.songs) : 
          setlists[index].metadata.estimatedDuration
      }
    };

    setlists[index] = updatedSetlist;
    this.saveSetlists(setlists);

    return updatedSetlist;
  }

  async deleteSetlist(id: string): Promise<boolean> {
    const setlists = this.getStoredSetlists();
    const index = setlists.findIndex(setlist => setlist.id === id);
    
    if (index === -1) {
      return false;
    }

    setlists.splice(index, 1);
    this.saveSetlists(setlists);
    return true;
  }

  async duplicateSetlist(id: string, newName: string): Promise<Setlist> {
    const originalSetlist = await this.getSetlist(id);
    if (!originalSetlist) {
      throw new Error(`Setlist with id ${id} not found`);
    }

    const duplicatedSetlist = await this.createSetlist({
      name: newName,
      description: originalSetlist.description,
      songs: originalSetlist.songs.map(song => ({
        ...song,
        addedAt: new Date()
      }))
    });

    return duplicatedSetlist;
  }

  async addSongToSetlist(setlistId: string, songId: string, position?: number): Promise<Setlist> {
    const setlist = await this.getSetlist(setlistId);
    if (!setlist) {
      throw new Error(`Setlist with id ${setlistId} not found`);
    }

    // Check if song is already in setlist
    if (setlist.songs.some(song => song.songId === songId)) {
      throw new Error('Song is already in this setlist');
    }

    const newSong: SetlistSong = {
      songId,
      order: position !== undefined ? position : setlist.songs.length,
      addedAt: new Date()
    };

    // If inserting at specific position, adjust other song orders
    if (position !== undefined) {
      setlist.songs.forEach(song => {
        if (song.order >= position) {
          song.order += 1;
        }
      });
    }

    setlist.songs.push(newSong);
    setlist.songs.sort((a, b) => a.order - b.order);

    return await this.updateSetlist(setlistId, { songs: setlist.songs });
  }

  async removeSongFromSetlist(setlistId: string, songId: string): Promise<Setlist> {
    const setlist = await this.getSetlist(setlistId);
    if (!setlist) {
      throw new Error(`Setlist with id ${setlistId} not found`);
    }

    const songIndex = setlist.songs.findIndex(song => song.songId === songId);
    if (songIndex === -1) {
      throw new Error('Song not found in setlist');
    }

    const removedOrder = setlist.songs[songIndex].order;
    setlist.songs.splice(songIndex, 1);

    // Adjust orders of remaining songs
    setlist.songs.forEach(song => {
      if (song.order > removedOrder) {
        song.order -= 1;
      }
    });

    return await this.updateSetlist(setlistId, { songs: setlist.songs });
  }

  async reorderSetlistSongs(setlistId: string, fromIndex: number, toIndex: number): Promise<Setlist> {
    const setlist = await this.getSetlist(setlistId);
    if (!setlist) {
      throw new Error(`Setlist with id ${setlistId} not found`);
    }

    const songs = [...setlist.songs].sort((a, b) => a.order - b.order);
    
    if (fromIndex < 0 || fromIndex >= songs.length || toIndex < 0 || toIndex >= songs.length) {
      throw new Error('Invalid song indices');
    }

    // Move the song
    const [movedSong] = songs.splice(fromIndex, 1);
    songs.splice(toIndex, 0, movedSong);

    // Update all orders
    songs.forEach((song, index) => {
      song.order = index;
    });

    return await this.updateSetlist(setlistId, { songs });
  }

  async exportSetlists(): Promise<string> {
    const setlists = this.getStoredSetlists();
    return JSON.stringify({
      version: CURRENT_VERSION,
      exportedAt: new Date().toISOString(),
      setlists
    }, null, 2);
  }

  async importSetlists(data: string): Promise<Setlist[]> {
    try {
      const importData = JSON.parse(data);
      
      if (!importData.setlists || !Array.isArray(importData.setlists)) {
        throw new Error('Invalid import data format');
      }

      const existingSetlists = this.getStoredSetlists();
      const importedSetlists: Setlist[] = [];

      for (const setlistData of importData.setlists) {
        // Generate new ID to avoid conflicts
        const newSetlist: Setlist = {
          ...setlistData,
          id: uuidv4(),
          metadata: {
            ...setlistData.metadata,
            createdAt: new Date(setlistData.metadata.createdAt),
            updatedAt: new Date()
          },
          songs: setlistData.songs.map((song: any) => ({
            ...song,
            addedAt: new Date(song.addedAt)
          }))
        };

        existingSetlists.push(newSetlist);
        importedSetlists.push(newSetlist);
      }

      this.saveSetlists(existingSetlists);
      return importedSetlists;
    } catch (error) {
      console.error('Error importing setlists:', error);
      throw new Error('Failed to import setlists');
    }
  }

  async clearAllSetlists(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.SETLISTS);
    localStorage.removeItem(STORAGE_KEYS.METADATA);
    this.initializeStorage();
  }

  private calculateEstimatedDuration(_songs: SetlistSong[]): number | undefined {
    // This would need to be implemented with actual song tempo data
    // For now, return undefined as we don't have tempo information readily available
    return undefined;
  }

  // Utility method to check storage quota
  getStorageInfo(): { used: number; available: number; percentage: number } {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length;
      }
    }

    // Rough estimate of localStorage limit (usually 5-10MB)
    const estimated = 5 * 1024 * 1024; // 5MB
    return {
      used,
      available: estimated - used,
      percentage: (used / estimated) * 100
    };
  }
}

export const setlistStorage = SetlistStorageService.getInstance();
