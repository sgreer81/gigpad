// UUID import removed as it's not used in this file
import type { Setlist } from '../types';
import { setlistStorage } from './setlistStorage';
import { dataLoader } from './dataLoader';

interface LegacySetlist {
  id: string;
  name: string;
  description?: string;
  songs: {
    songId: string;
    order: number;
    customKey?: string;
    customCapo?: number;
    notes?: string;
  }[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

class SetlistMigrationService {
  private static instance: SetlistMigrationService;

  private constructor() {}

  static getInstance(): SetlistMigrationService {
    if (!SetlistMigrationService.instance) {
      SetlistMigrationService.instance = new SetlistMigrationService();
    }
    return SetlistMigrationService.instance;
  }

  /**
   * Migrate legacy setlists from the static JSON files to localStorage
   */
  async migrateLegacySetlists(): Promise<void> {
    try {
      // Check if migration has already been done
      const existingSetlists = await setlistStorage.getAllSetlists();
      if (existingSetlists.length > 0) {
        console.log('Setlists already exist in localStorage, skipping migration');
        return;
      }

      // Load legacy setlists from static files
      const legacySetlists = await this.loadLegacySetlists();
      
      if (legacySetlists.length === 0) {
        console.log('No legacy setlists found to migrate');
        return;
      }

      console.log(`Migrating ${legacySetlists.length} legacy setlists...`);

      // Convert and save each setlist
      for (const legacySetlist of legacySetlists) {
        const migratedSetlist = this.convertLegacySetlist(legacySetlist);
        await setlistStorage.createSetlist({
          name: migratedSetlist.name,
          description: migratedSetlist.description,
          songs: migratedSetlist.songs
        });
      }

      console.log('Legacy setlist migration completed successfully');
    } catch (error) {
      console.error('Error during setlist migration:', error);
      throw error;
    }
  }

  private async loadLegacySetlists(): Promise<LegacySetlist[]> {
    try {
      // Use the existing dataLoader to get legacy setlists
      const setlists = await dataLoader.loadSetlists();
      return setlists.map(setlist => ({
        ...setlist,
        createdAt: setlist.metadata.createdAt || setlist.metadata.updatedAt,
        updatedAt: setlist.metadata.updatedAt
      }));
    } catch (error) {
      console.error('Error loading legacy setlists:', error);
      return [];
    }
  }

  private convertLegacySetlist(legacySetlist: LegacySetlist): Omit<Setlist, 'id' | 'metadata'> & { songs: any[] } {
    const now = new Date();
    
    return {
      name: legacySetlist.name,
      description: legacySetlist.description,
      songs: legacySetlist.songs.map(song => ({
        songId: song.songId,
        order: song.order,
        customKey: song.customKey,
        customCapo: song.customCapo,
        notes: song.notes,
        addedAt: now // Use current time since we don't have the original add time
      }))
    };
  }

  /**
   * Export current setlists for backup
   */
  async exportSetlists(): Promise<string> {
    return await setlistStorage.exportSetlists();
  }

  /**
   * Import setlists from backup
   */
  async importSetlists(data: string): Promise<Setlist[]> {
    return await setlistStorage.importSetlists(data);
  }

  /**
   * Clear all setlists (useful for testing)
   */
  async clearAllSetlists(): Promise<void> {
    await setlistStorage.clearAllSetlists();
  }

  /**
   * Get storage usage information
   */
  getStorageInfo() {
    return setlistStorage.getStorageInfo();
  }
}

export const setlistMigration = SetlistMigrationService.getInstance();
