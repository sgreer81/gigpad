// Song override storage utilities for persisting transpose and capo settings

export interface SongOverride {
  songId: string;
  customKey?: string; // Transposed key
  customCapo?: number; // Capo position
  updatedAt: Date;
}

export interface SongOverrides {
  [songId: string]: SongOverride;
}

const STORAGE_KEY = 'sing-song-overrides';

export class SongOverrideStorage {
  /**
   * Get all song overrides from localStorage
   */
  static getAll(): SongOverrides {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return {};
      
      const parsed = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      Object.values(parsed).forEach((override: any) => {
        if (override.updatedAt) {
          override.updatedAt = new Date(override.updatedAt);
        }
      });
      
      return parsed;
    } catch (error) {
      console.error('Error loading song overrides:', error);
      return {};
    }
  }

  /**
   * Get override settings for a specific song
   */
  static get(songId: string): SongOverride | null {
    const overrides = this.getAll();
    return overrides[songId] || null;
  }

  /**
   * Save override settings for a song
   */
  static set(songId: string, customKey?: string, customCapo?: number): void {
    try {
      const overrides = this.getAll();
      
      // If both customKey and customCapo are undefined/null, remove the override
      if (customKey === undefined && customCapo === undefined) {
        delete overrides[songId];
      } else {
        overrides[songId] = {
          songId,
          customKey,
          customCapo,
          updatedAt: new Date()
        };
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch (error) {
      console.error('Error saving song override:', error);
    }
  }

  /**
   * Remove override settings for a song
   */
  static remove(songId: string): void {
    try {
      const overrides = this.getAll();
      delete overrides[songId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch (error) {
      console.error('Error removing song override:', error);
    }
  }

  /**
   * Clear all song overrides
   */
  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing song overrides:', error);
    }
  }

  /**
   * Check if a song has any overrides
   */
  static hasOverride(songId: string): boolean {
    const override = this.get(songId);
    return override !== null;
  }

  /**
   * Get the effective key for a song (considering overrides)
   */
  static getEffectiveKey(songId: string, originalKey: string): string {
    const override = this.get(songId);
    return override?.customKey || originalKey;
  }

  /**
   * Get the effective capo position for a song (considering overrides)
   */
  static getEffectiveCapo(songId: string, originalCapo: number = 0): number {
    const override = this.get(songId);
    return override?.customCapo ?? originalCapo;
  }

  /**
   * Export all overrides as JSON string
   */
  static export(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  /**
   * Import overrides from JSON string
   */
  static import(jsonString: string): void {
    try {
      const imported = JSON.parse(jsonString);
      
      // Validate the structure
      if (typeof imported !== 'object') {
        throw new Error('Invalid format: expected object');
      }
      
      // Convert date strings and validate each override
      Object.entries(imported).forEach(([songId, override]: [string, any]) => {
        if (!override.songId || override.songId !== songId) {
          throw new Error(`Invalid override for song ${songId}`);
        }
        if (override.updatedAt) {
          override.updatedAt = new Date(override.updatedAt);
        }
      });
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
    } catch (error) {
      console.error('Error importing song overrides:', error);
      throw error;
    }
  }
}
