import React, { useState, useEffect } from 'react';
import { Play, Music, Clock } from 'lucide-react';
import type { Setlist, Song } from '../types';
import { dataLoader } from '../utils/dataLoader';

interface SetlistViewProps {
  onSetlistSelect: (setlist: Setlist, songs: Song[]) => void;
  className?: string;
}

export const SetlistView: React.FC<SetlistViewProps> = ({
  onSetlistSelect,
  className = ''
}) => {
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSetlists();
  }, []);

  const loadSetlists = async () => {
    try {
      setLoading(true);
      const loadedSetlists = await dataLoader.loadSetlists();
      setSetlists(loadedSetlists);
    } catch (err) {
      setError('Failed to load setlists');
      console.error('Error loading setlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetlistSelect = async (setlist: Setlist) => {
    try {
      const result = await dataLoader.getSetlistWithSongs(setlist.id);
      if (result) {
        onSetlistSelect(result.setlist, result.songs);
      }
    } catch (err) {
      console.error('Error loading setlist songs:', err);
    }
  };

  if (loading) {
    return (
      <div className={`setlist-view flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading setlists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`setlist-view flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={loadSetlists}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`setlist-view p-4 ${className}`}>
      <div className="header mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Setlists</h1>
        <p className="text-muted-foreground">Choose a setlist to start performing</p>
      </div>

      {setlists.length === 0 ? (
        <div className="empty-state text-center py-12">
          <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No setlists found</h2>
          <p className="text-muted-foreground">Create your first setlist to get started</p>
        </div>
      ) : (
        <div className="setlists-grid space-y-4">
          {setlists.map((setlist) => (
            <SetlistCard
              key={setlist.id}
              setlist={setlist}
              onSelect={() => handleSetlistSelect(setlist)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SetlistCardProps {
  setlist: Setlist;
  onSelect: () => void;
}

const SetlistCard: React.FC<SetlistCardProps> = ({ setlist, onSelect }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="setlist-card bg-card border border-border rounded-lg p-6 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-1">
            {setlist.name}
          </h3>
          {setlist.description && (
            <p className="text-muted-foreground text-sm mb-3">
              {setlist.description}
            </p>
          )}
        </div>
        <button
          onClick={onSelect}
          className="touch-target ml-4 bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Play size={16} />
          <span>Start</span>
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Music size={14} />
          <span>{setlist.songs.length} songs</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>Updated {formatDate(setlist.updatedAt)}</span>
        </div>
      </div>

      {setlist.songs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Songs in this setlist:</p>
          <div className="flex flex-wrap gap-2">
            {setlist.songs
              .sort((a, b) => a.order - b.order)
              .slice(0, 3)
              .map((song, index) => (
                <span
                  key={song.songId}
                  className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                >
                  {index + 1}. {song.songId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            {setlist.songs.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{setlist.songs.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
