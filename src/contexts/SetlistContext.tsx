import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { SetlistContextType, Setlist, SetlistMetadata, Song, SongMetadata } from '../types';
import { setlistStorage } from '../utils/setlistStorage';
import { dataLoader } from '../utils/dataLoader';

const SetlistContext = createContext<SetlistContextType | undefined>(undefined);

export const useSetlistContext = (): SetlistContextType => {
  const context = useContext(SetlistContext);
  if (!context) {
    throw new Error('useSetlistContext must be used within a SetlistProvider');
  }
  return context;
};

interface SetlistProviderProps {
  children: React.ReactNode;
}

export const SetlistProvider: React.FC<SetlistProviderProps> = ({ children }) => {
  const [setlists, setSetlists] = useState<SetlistMetadata[]>([]);
  const [currentSetlist, setCurrentSetlist] = useState<Setlist | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [songLibrary, setSongLibrary] = useState<Song[]>([]);
  const [, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load setlists and song library in parallel
        const [setlistsData, songsData] = await Promise.all([
          setlistStorage.getAllSetlists().catch(() => []), // Fallback to empty array
          dataLoader.loadSongs().catch(() => []) // Fallback to empty array
        ]);
        
        setSetlists(setlistsData);
        setSongLibrary(songsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
        // Set empty defaults to ensure the context is still functional
        setSetlists([]);
        setSongLibrary([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const refreshSetlists = useCallback(async () => {
    try {
      const setlistsData = await setlistStorage.getAllSetlists();
      setSetlists(setlistsData);
    } catch (error) {
      console.error('Error refreshing setlists:', error);
    }
  }, []);

  const createSetlist = useCallback(async (name: string, description?: string) => {
    try {
      const newSetlist = await setlistStorage.createSetlist({
        name,
        description,
        songs: []
      });
      
      await refreshSetlists();
      setCurrentSetlist(newSetlist);
      setIsEditing(true);
    } catch (error) {
      console.error('Error creating setlist:', error);
      throw error;
    }
  }, [refreshSetlists]);

  const editSetlist = useCallback(async (id: string) => {
    try {
      const setlist = await setlistStorage.getSetlist(id);
      if (setlist) {
        setCurrentSetlist(setlist);
        setIsEditing(true);
      } else {
        throw new Error('Setlist not found');
      }
    } catch (error) {
      console.error('Error loading setlist for editing:', error);
      throw error;
    }
  }, []);

  const saveSetlist = useCallback(async () => {
    if (!currentSetlist) {
      throw new Error('No setlist to save');
    }

    try {
      const updatedSetlist = await setlistStorage.updateSetlist(currentSetlist.id, currentSetlist);
      setCurrentSetlist(updatedSetlist);
      setIsEditing(false);
      await refreshSetlists();
    } catch (error) {
      console.error('Error saving setlist:', error);
      throw error;
    }
  }, [currentSetlist, refreshSetlists]);

  const deleteSetlist = useCallback(async (id: string) => {
    try {
      const success = await setlistStorage.deleteSetlist(id);
      if (success) {
        await refreshSetlists();
        
        // Clear current setlist if it was deleted
        if (currentSetlist?.id === id) {
          setCurrentSetlist(null);
          setIsEditing(false);
        }
      }
      return success;
    } catch (error) {
      console.error('Error deleting setlist:', error);
      throw error;
    }
  }, [currentSetlist, refreshSetlists]);

  const addSongToSetlist = useCallback((songId: string, position?: number) => {
    if (!currentSetlist) {
      throw new Error('No setlist selected');
    }

    // Check if song is already in setlist
    if (currentSetlist.songs.some(song => song.songId === songId)) {
      throw new Error('Song is already in this setlist');
    }

    const newSong = {
      songId,
      order: position !== undefined ? position : currentSetlist.songs.length,
      addedAt: new Date()
    };

    // If inserting at specific position, adjust other song orders
    const updatedSongs = [...currentSetlist.songs];
    if (position !== undefined) {
      updatedSongs.forEach(song => {
        if (song.order >= position) {
          song.order += 1;
        }
      });
    }

    updatedSongs.push(newSong);
    updatedSongs.sort((a, b) => a.order - b.order);

    setCurrentSetlist({
      ...currentSetlist,
      songs: updatedSongs,
      metadata: {
        ...currentSetlist.metadata,
        updatedAt: new Date()
      }
    });
  }, [currentSetlist]);

  const removeSongFromSetlist = useCallback((songId: string) => {
    if (!currentSetlist) {
      throw new Error('No setlist selected');
    }

    const songIndex = currentSetlist.songs.findIndex(song => song.songId === songId);
    if (songIndex === -1) {
      throw new Error('Song not found in setlist');
    }

    const removedOrder = currentSetlist.songs[songIndex].order;
    const updatedSongs = [...currentSetlist.songs];
    updatedSongs.splice(songIndex, 1);

    // Adjust orders of remaining songs
    updatedSongs.forEach(song => {
      if (song.order > removedOrder) {
        song.order -= 1;
      }
    });

    setCurrentSetlist({
      ...currentSetlist,
      songs: updatedSongs,
      metadata: {
        ...currentSetlist.metadata,
        updatedAt: new Date()
      }
    });
  }, [currentSetlist]);

  const reorderSongs = useCallback((fromIndex: number, toIndex: number) => {
    if (!currentSetlist) {
      throw new Error('No setlist selected');
    }

    const songs = [...currentSetlist.songs].sort((a, b) => a.order - b.order);
    
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

    setCurrentSetlist({
      ...currentSetlist,
      songs,
      metadata: {
        ...currentSetlist.metadata,
        updatedAt: new Date()
      }
    });
  }, [currentSetlist]);

  const duplicateSetlist = useCallback(async (id: string, newName: string) => {
    try {
      const duplicatedSetlist = await setlistStorage.duplicateSetlist(id, newName);
      await refreshSetlists();
      return duplicatedSetlist;
    } catch (error) {
      console.error('Error duplicating setlist:', error);
      throw error;
    }
  }, [refreshSetlists]);

  const loadSetlist = useCallback(async (id: string) => {
    try {
      const setlist = await setlistStorage.getSetlist(id);
      if (setlist) {
        setCurrentSetlist(setlist);
        setIsEditing(false);
      } else {
        throw new Error('Setlist not found');
      }
    } catch (error) {
      console.error('Error loading setlist:', error);
      throw error;
    }
  }, []);

  const clearCurrentSetlist = useCallback(() => {
    setCurrentSetlist(null);
    setIsEditing(false);
  }, []);

  const contextValue: SetlistContextType = {
    // State
    setlists,
    currentSetlist,
    isEditing,
    songLibrary,
    
    // Actions
    createSetlist,
    editSetlist,
    saveSetlist,
    deleteSetlist,
    addSongToSetlist,
    removeSongFromSetlist,
    reorderSongs,
    
    // Utility
    duplicateSetlist,
    loadSetlist,
    clearCurrentSetlist,
    refreshSetlists
  };

  return (
    <SetlistContext.Provider value={contextValue}>
      {children}
    </SetlistContext.Provider>
  );
};

// Hook for accessing song metadata efficiently
export const useSongMetadata = (): SongMetadata[] => {
  const { songLibrary } = useSetlistContext();
  
  return songLibrary.map(song => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    originalKey: song.originalKey,
    tempo: song.tempo,
    capoPosition: song.capoPosition,
    tags: song.metadata?.tags
  }));
};

// Hook for getting songs in a setlist with full song data
export const useSetlistSongs = (setlist: Setlist | null): Song[] => {
  const { songLibrary } = useSetlistContext();
  
  if (!setlist) return [];
  
  const sortedSetlistSongs = [...setlist.songs].sort((a, b) => a.order - b.order);
  
  return sortedSetlistSongs
    .map(setlistSong => songLibrary.find(song => song.id === setlistSong.songId))
    .filter((song): song is Song => song !== undefined);
};
