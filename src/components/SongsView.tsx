import React, { useState, useEffect } from 'react';
import { Search, Music, Eye } from 'lucide-react';
import type { Song } from '../types';
import { dataLoader } from '../utils/dataLoader';
import { FullSongDisplay } from './ChordLyricDisplay';

interface SongsViewProps {
  className?: string;
}

export const SongsView: React.FC<SongsViewProps> = ({ className = '' }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSongs();
  }, []);

  useEffect(() => {
    // Filter songs based on search term
    if (searchTerm.trim() === '') {
      setFilteredSongs(songs);
    } else {
      const filtered = songs.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.metadata.tags?.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredSongs(filtered);
    }
  }, [songs, searchTerm]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const loadedSongs = await dataLoader.loadSongs();
      setSongs(loadedSongs);
      setFilteredSongs(loadedSongs);
    } catch (err) {
      setError('Failed to load songs');
      console.error('Error loading songs:', err);
    } finally {
      setLoading(false);
    }
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
    return (
      <div className={`songs-view ${className}`}>
        <div className="song-detail-header bg-card border-b border-border p-4">
          <button
            onClick={() => setSelectedSong(null)}
            className="text-primary hover:text-primary/80 mb-2"
          >
            ← Back to Songs
          </button>
        </div>
        <div className="song-detail-content overflow-y-auto p-4">
          <FullSongDisplay song={selectedSong} />
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

      <div className="songs-list overflow-y-auto p-4">
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
                onSelect={() => setSelectedSong(song)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface SongCardProps {
  song: Song;
  onSelect: () => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, onSelect }) => {
  return (
    <div className="song-card bg-card border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {song.title}
          </h3>
          <p className="text-muted-foreground mb-2">{song.artist}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Key: {song.originalKey}</span>
            {song.capoPosition && song.capoPosition > 0 && (
              <span>Capo: {song.capoPosition}</span>
            )}
            {song.tempo && <span>♩ = {song.tempo}</span>}
          </div>

          {song.metadata.tags && song.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {song.metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onSelect}
          className="touch-target ml-4 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
        >
          <Eye size={20} />
        </button>
      </div>
    </div>
  );
};
