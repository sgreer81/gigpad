import React, { useState, useEffect } from 'react';
import { Search, Music, Eye, Settings, RotateCcw, ArrowLeft } from 'lucide-react';
import type { Song } from '../types';
import { dataLoader } from '../utils/dataLoader';
import { FullSongDisplay } from './ChordLyricDisplay';
import { ChordTransposer } from '../utils/chordTransposer';
import { SongOverrideStorage } from '../utils/songOverrides';

interface SongIndex {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  tempo: number;
  capoPosition: number;
}

interface SongsViewProps {
  className?: string;
}

export const SongsView: React.FC<SongsViewProps> = ({ className = '' }) => {
  const [songsIndex, setSongsIndex] = useState<SongIndex[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<SongIndex[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedSongKey, setSelectedSongKey] = useState<string>('');
  const [selectedSongCapo, setSelectedSongCapo] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingSong, setLoadingSong] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overrides, setOverrides] = useState(SongOverrideStorage.getAll());
  const [showTransposeControls, setShowTransposeControls] = useState(false);

  useEffect(() => {
    loadSongs();
  }, []);

  useEffect(() => {
    // Filter songs based on search term
    if (searchTerm.trim() === '') {
      setFilteredSongs(songsIndex);
    } else {
      const filtered = songsIndex.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSongs(filtered);
    }
  }, [songsIndex, searchTerm]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const loadedIndex = await dataLoader.getSongsIndex();
      setSongsIndex(loadedIndex);
      setFilteredSongs(loadedIndex);
    } catch (err) {
      setError('Failed to load songs');
      console.error('Error loading songs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSong = async (songId: string) => {
    try {
      setLoadingSong(true);
      const song = await dataLoader.getSongById(songId);
      
      // Load override settings for this song
      const override = SongOverrideStorage.get(songId);
      const initialKey = override?.customKey || song?.originalKey || 'C';
      const initialCapo = override?.customCapo ?? song?.capoPosition ?? 0;
      
      setSelectedSong(song);
      setSelectedSongKey(initialKey);
      setSelectedSongCapo(initialCapo);
      setShowTransposeControls(false); // Reset controls visibility
    } catch (err) {
      setError('Failed to load song details');
      console.error('Error loading song:', err);
    } finally {
      setLoadingSong(false);
    }
  };

  const saveSelectedSongOverride = (newKey: string, newCapo: number) => {
    if (!selectedSong) return;

    // Check if values are different from original
    const isKeyDifferent = newKey !== selectedSong.originalKey;
    const isCapoDifferent = newCapo !== (selectedSong.capoPosition ?? 0);
    
    if (isKeyDifferent || isCapoDifferent) {
      // Save override
      SongOverrideStorage.set(
        selectedSong.id,
        isKeyDifferent ? newKey : undefined,
        isCapoDifferent ? newCapo : undefined
      );
      console.log(`Saved override for ${selectedSong.title}: key=${newKey}, capo=${newCapo}`);
    } else {
      // Remove override if back to original values
      SongOverrideStorage.remove(selectedSong.id);
      console.log(`Removed override for ${selectedSong.title} - back to original values`);
    }
    
    // Update local state
    setOverrides(SongOverrideStorage.getAll());
  };

  const transposeUp = () => {
    const newKey = ChordTransposer.transposeChordBySemitones(selectedSongKey, 1);
    setSelectedSongKey(newKey);
    saveSelectedSongOverride(newKey, selectedSongCapo);
  };

  const transposeDown = () => {
    const newKey = ChordTransposer.transposeChordBySemitones(selectedSongKey, -1);
    setSelectedSongKey(newKey);
    saveSelectedSongOverride(newKey, selectedSongCapo);
  };

  const capoUp = () => {
    if (selectedSongCapo < 12) {
      const newCapo = selectedSongCapo + 1;
      setSelectedSongCapo(newCapo);
      saveSelectedSongOverride(selectedSongKey, newCapo);
    }
  };

  const capoDown = () => {
    if (selectedSongCapo > 0) {
      const newCapo = selectedSongCapo - 1;
      setSelectedSongCapo(newCapo);
      saveSelectedSongOverride(selectedSongKey, newCapo);
    }
  };

  const resetToOriginal = () => {
    if (!selectedSong) return;
    
    const originalKey = selectedSong.originalKey;
    const originalCapo = selectedSong.capoPosition ?? 0;
    
    setSelectedSongKey(originalKey);
    setSelectedSongCapo(originalCapo);
    
    SongOverrideStorage.remove(selectedSong.id);
    setOverrides(SongOverrideStorage.getAll());
    console.log(`Reset ${selectedSong.title} to original settings`);
  };

  const getEffectiveKey = () => {
    return ChordTransposer.getEffectiveKey(selectedSongKey, selectedSongCapo);
  };

  if (loading) {
    return (
      <div className={`songs-view flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading songs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`songs-view flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={loadSongs}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (selectedSong) {
    const hasOverride = overrides[selectedSong.id] !== undefined;
    
    return (
      <div className={`songs-view ${className}`}>
        <div className="song-detail-header bg-card border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedSong(null)}
              className="text-primary hover:text-primary/80 flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Songs
            </button>
            
            <button
              onClick={() => setShowTransposeControls(!showTransposeControls)}
              className="touch-target text-muted-foreground hover:text-foreground"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Transpose controls */}
          {showTransposeControls && (
            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm">
                  <div className="font-medium">Chord Key: {selectedSongKey}</div>
                  <div className="text-muted-foreground">Effective Key: {getEffectiveKey()}</div>
                  {hasOverride && (
                    <div className="text-primary text-xs mt-1">
                      Original: {selectedSong.originalKey} / Capo {selectedSong.capoPosition ?? 0}
                    </div>
                  )}
                </div>
                <button
                  onClick={resetToOriginal}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              </div>
              
              {/* Chord Transpose Controls */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={transposeDown}
                  className="touch-target px-3 py-1 bg-background text-foreground rounded border border-border"
                >
                  ♭
                </button>
                <span className="text-sm text-muted-foreground flex-1 text-center">
                  Transpose Chords
                </span>
                <button
                  onClick={transposeUp}
                  className="touch-target px-3 py-1 bg-background text-foreground rounded border border-border"
                >
                  ♯
                </button>
              </div>

              {/* Capo Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={capoDown}
                  disabled={selectedSongCapo === 0}
                  className="touch-target px-3 py-1 bg-background text-foreground rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="text-sm text-muted-foreground flex-1 text-center">
                  Capo: {selectedSongCapo}
                </span>
                <button
                  onClick={capoUp}
                  disabled={selectedSongCapo >= 12}
                  className="touch-target px-3 py-1 bg-background text-foreground rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="song-detail-content p-4 pb-safe">
          <FullSongDisplay 
            song={selectedSong} 
            currentKey={selectedSongKey}
            capoPosition={selectedSongCapo}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`songs-view ${className}`}>
      <div className="songs-header p-4 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground mb-4">Songs</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search songs, artists, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="songs-list p-4 pb-safe">
        {filteredSongs.length === 0 ? (
          <div className="empty-state text-center py-12">
            <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? 'No songs found' : 'No songs available'}
            </h2>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Add some songs to get started'
              }
            </p>
          </div>
        ) : (
          <div className="songs-grid space-y-3">
            {filteredSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                override={overrides[song.id]}
                onSelect={() => handleViewSong(song.id)}
                loading={loadingSong}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface SongCardProps {
  song: SongIndex;
  override?: { songId: string; customKey?: string; customCapo?: number; updatedAt: Date };
  onSelect: () => void;
  loading?: boolean;
}

const SongCard: React.FC<SongCardProps> = ({ 
  song, 
  override, 
  onSelect, 
  loading = false 
}) => {
  const hasOverride = override !== undefined;
  const currentKey = override?.customKey || song.originalKey;
  const currentCapo = override?.customCapo ?? song.capoPosition;
  const effectiveKey = ChordTransposer.getEffectiveKey(currentKey, currentCapo);

  return (
    <div className="song-card bg-card border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {song.title}
            {hasOverride && (
              <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                Modified
              </span>
            )}
          </h3>
          <p className="text-muted-foreground mb-2">{song.artist}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Key: {currentKey}
              {hasOverride && currentKey !== song.originalKey && (
                <span className="text-primary ml-1">(was {song.originalKey})</span>
              )}
            </span>
            <span>
              Capo: {currentCapo}
              {hasOverride && currentCapo !== song.capoPosition && (
                <span className="text-primary ml-1">(was {song.capoPosition})</span>
              )}
            </span>
            <span>Effective: {effectiveKey}</span>
            {song.tempo && <span>♩ = {song.tempo}</span>}
          </div>
        </div>

        <button
          onClick={onSelect}
          disabled={loading}
          className="touch-target ml-4 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg disabled:opacity-50"
        >
          <Eye size={20} />
        </button>
      </div>
    </div>
  );
};
