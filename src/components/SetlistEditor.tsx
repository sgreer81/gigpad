import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  ArrowLeft, 
  Save, 
  Search, 
  Plus, 
  GripVertical, 
  X, 
  Music
} from 'lucide-react';
import type { Song, SetlistSong } from '../types';
import { useSetlistContext, useSetlistSongs, useSongMetadata } from '../contexts/SetlistContext';

interface SetlistEditorProps {
  setlistId: string | null;
  onBack: () => void;
  className?: string;
}

export const SetlistEditor: React.FC<SetlistEditorProps> = ({
  setlistId,
  onBack,
  className = ''
}) => {
  const { 
    currentSetlist, 
    isEditing, 
    saveSetlist, 
    addSongToSetlist, 
    removeSongFromSetlist, 
    reorderSongs,
    editSetlist,
    clearCurrentSetlist
  } = useSetlistContext();
  
  const songMetadata = useSongMetadata();
  const setlistSongs = useSetlistSongs(currentSetlist);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempDescription, setTempDescription] = useState('');

  // Initialize editing when setlistId changes
  useEffect(() => {
    if (setlistId && !isEditing) {
      editSetlist(setlistId);
    } else if (!setlistId) {
      clearCurrentSetlist();
    }
  }, [setlistId, isEditing, editSetlist, clearCurrentSetlist]);

  // Update temp values when setlist changes
  useEffect(() => {
    if (currentSetlist) {
      setTempName(currentSetlist.name);
      setTempDescription(currentSetlist.description || '');
    }
  }, [currentSetlist]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSave = async () => {
    if (!currentSetlist) return;
    
    try {
      setIsSaving(true);
      await saveSetlist();
      // Return to setlist screen after successful save
      onBack();
    } catch (error) {
      console.error('Error saving setlist:', error);
      // TODO: Add proper error handling/toast notification
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSong = (songId: string) => {
    try {
      addSongToSetlist(songId);
    } catch (error) {
      console.error('Error adding song:', error);
      // TODO: Add proper error handling/toast notification
    }
  };

  const handleRemoveSong = (songId: string) => {
    try {
      removeSongFromSetlist(songId);
    } catch (error) {
      console.error('Error removing song:', error);
      // TODO: Add proper error handling/toast notification
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = setlistSongs.findIndex(song => song.id === active.id);
      const newIndex = setlistSongs.findIndex(song => song.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSongs(oldIndex, newIndex);
      }
    }
    
    setActiveId(null);
  };

  const filteredSongs = songMetadata.filter(song => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.originalKey.toLowerCase().includes(query) ||
      song.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const songsInSetlist = new Set(currentSetlist?.songs.map(s => s.songId) || []);
  const availableSongs = filteredSongs.filter(song => !songsInSetlist.has(song.id));

  if (!currentSetlist) {
    return (
      <div className={`setlist-editor flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading setlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`setlist-editor flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="header bg-background border-b border-border p-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="touch-target p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex-1 min-w-0">
            {editingName ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={() => {
                  setEditingName(false);
                  // TODO: Update setlist name
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingName(false);
                    // TODO: Update setlist name
                  }
                }}
                className="text-2xl font-bold bg-transparent border-none outline-none text-foreground w-full"
                autoFocus
              />
            ) : (
              <h1 
                className="text-2xl font-bold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                onClick={() => setEditingName(true)}
              >
                {currentSetlist.name}
              </h1>
            )}
            
            {editingDescription ? (
              <textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                onBlur={() => {
                  setEditingDescription(false);
                  // TODO: Update setlist description
                }}
                placeholder="Add a description..."
                className="text-sm text-muted-foreground bg-transparent border-none outline-none w-full resize-none"
                rows={2}
              />
            ) : (
              <p 
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => setEditingDescription(true)}
              >
                {currentSetlist.description || 'Add a description...'}
              </p>
            )}
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="touch-target bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{currentSetlist.songs.length} songs</span>
          <span>•</span>
          <span>Updated {new Date(currentSetlist.metadata.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Setlist Songs */}
        <div className="setlist-songs flex-1 flex flex-col border-r border-border">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Songs in Setlist ({currentSetlist.songs.length})
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {setlistSongs.length === 0 ? (
              <div className="text-center py-8">
                <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No songs in this setlist yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add songs from the library on the right</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={setlistSongs.map(song => song.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {setlistSongs.map((song, index) => {
                      const setlistSong = currentSetlist.songs.find(s => s.songId === song.id);
                      return (
                        <SortableSetlistSongItem
                          key={song.id}
                          song={song}
                          setlistSong={setlistSong}
                          index={index}
                          onRemove={() => handleRemoveSong(song.id)}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
                
                <DragOverlay>
                  {activeId ? (
                    <SetlistSongItem
                      song={setlistSongs.find(s => s.id === activeId)!}
                      setlistSong={currentSetlist.songs.find(s => s.songId === activeId)}
                      index={setlistSongs.findIndex(s => s.id === activeId)}
                      onRemove={() => {}}
                      isDragging
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </div>

        {/* Song Library */}
        <div className="song-library flex-1 flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground mb-3">Add Songs</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {availableSongs.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No songs match your search' : 'All songs are already in this setlist'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableSongs.map((song) => (
                  <LibrarySongItem
                    key={song.id}
                    song={song}
                    onAdd={() => handleAddSong(song.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sortable setlist song item
interface SortableSetlistSongItemProps {
  song: Song;
  setlistSong?: SetlistSong;
  index: number;
  onRemove: () => void;
}

const SortableSetlistSongItem: React.FC<SortableSetlistSongItemProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <SetlistSongItem
        {...props}
        dragHandleProps={listeners}
        isDragging={isDragging}
      />
    </div>
  );
};

// Setlist song item component
interface SetlistSongItemProps {
  song: Song;
  setlistSong?: SetlistSong;
  index: number;
  onRemove: () => void;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}

const SetlistSongItem: React.FC<SetlistSongItemProps> = ({
  song,
  setlistSong,
  index,
  onRemove,
  dragHandleProps,
  isDragging = false
}) => {
  return (
    <div className={`setlist-song-item bg-card border border-border rounded-lg p-4 ${isDragging ? 'shadow-lg' : 'hover:bg-accent/50'} transition-colors`}>
      <div className="flex items-center gap-3">
        <div
          {...dragHandleProps}
          className="drag-handle p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </div>
        
        <div className="order-number bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
          {index + 1}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{song.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>Key: {setlistSong?.customKey || song.originalKey}</span>
            {(setlistSong?.customCapo !== undefined || song.capoPosition) && (
              <span>Capo: {setlistSong?.customCapo ?? song.capoPosition}</span>
            )}
          </div>
          {setlistSong?.notes && (
            <p className="text-xs text-muted-foreground mt-1 italic">{setlistSong.notes}</p>
          )}
        </div>
        
        <button
          onClick={onRemove}
          className="touch-target p-2 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Library song item component
interface LibrarySongItemProps {
  song: { id: string; title: string; artist: string; originalKey: string; capoPosition?: number };
  onAdd: () => void;
}

const LibrarySongItem: React.FC<LibrarySongItemProps> = ({ song, onAdd }) => {
  return (
    <div className="library-song-item bg-card border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{song.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>Key: {song.originalKey}</span>
            {song.capoPosition && <span>Capo: {song.capoPosition}</span>}
          </div>
        </div>
        
        <button
          onClick={onAdd}
          className="touch-target bg-primary text-primary-foreground rounded-lg p-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};
