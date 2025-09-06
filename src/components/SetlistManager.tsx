import React, { useState } from 'react';
import { Plus, Edit, Copy, Trash2, Music, Clock, Calendar, MoreVertical } from 'lucide-react';
import type { SetlistMetadata } from '../types';
import { useSetlistContext } from '../contexts/SetlistContext';

interface SetlistManagerProps {
  onEditSetlist: (id: string) => void;
  onPerformSetlist: (id: string) => void;
  className?: string;
}

export const SetlistManager: React.FC<SetlistManagerProps> = ({
  onEditSetlist,
  onPerformSetlist,
  className = ''
}) => {
  const { setlists, createSetlist, deleteSetlist, duplicateSetlist } = useSetlistContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSetlistName, setNewSetlistName] = useState('');
  const [newSetlistDescription, setNewSetlistDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSetlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetlistName.trim()) return;

    try {
      setIsCreating(true);
      await createSetlist(newSetlistName.trim(), newSetlistDescription.trim() || undefined);
      setNewSetlistName('');
      setNewSetlistDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating setlist:', error);
      // TODO: Add proper error handling/toast notification
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicateSetlist = async (setlist: SetlistMetadata) => {
    try {
      const newName = `${setlist.name} (Copy)`;
      await duplicateSetlist(setlist.id, newName);
    } catch (error) {
      console.error('Error duplicating setlist:', error);
      // TODO: Add proper error handling/toast notification
    }
  };

  const handleDeleteSetlist = async (setlist: SetlistMetadata) => {
    if (window.confirm(`Are you sure you want to delete "${setlist.name}"? This action cannot be undone.`)) {
      try {
        await deleteSetlist(setlist.id);
      } catch (error) {
        console.error('Error deleting setlist:', error);
        // TODO: Add proper error handling/toast notification
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className={`setlist-manager p-4 ${className}`}>
      {/* Header */}
      <div className="header mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-foreground">Setlists</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="touch-target bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            <span>New Setlist</span>
          </button>
        </div>
        <p className="text-muted-foreground">Manage your performance setlists</p>
      </div>

      {/* Create Setlist Form */}
      {showCreateForm && (
        <div className="create-form bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Create New Setlist</h2>
          <form onSubmit={handleCreateSetlist} className="space-y-4">
            <div>
              <label htmlFor="setlist-name" className="block text-sm font-medium text-foreground mb-2">
                Setlist Name *
              </label>
              <input
                id="setlist-name"
                type="text"
                value={newSetlistName}
                onChange={(e) => setNewSetlistName(e.target.value)}
                placeholder="e.g., Acoustic Evening Set"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={100}
                required
              />
            </div>
            <div>
              <label htmlFor="setlist-description" className="block text-sm font-medium text-foreground mb-2">
                Description (Optional)
              </label>
              <textarea
                id="setlist-description"
                value={newSetlistDescription}
                onChange={(e) => setNewSetlistDescription(e.target.value)}
                placeholder="e.g., Perfect for intimate venue performances"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isCreating || !newSetlistName.trim()}
                className="flex-1 bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Setlist'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewSetlistName('');
                  setNewSetlistDescription('');
                }}
                className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Setlists List */}
      {setlists.length === 0 ? (
        <div className="empty-state text-center py-12">
          <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No setlists yet</h2>
          <p className="text-muted-foreground mb-6">Create your first setlist to get started</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-primary text-primary-foreground rounded-lg px-6 py-3 hover:bg-primary/90 transition-colors"
          >
            Create Your First Setlist
          </button>
        </div>
      ) : (
        <div className="setlists-grid space-y-4">
          {setlists
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            .map((setlist) => (
              <SetlistCard
                key={setlist.id}
                setlist={setlist}
                onEdit={() => onEditSetlist(setlist.id)}
                onPerform={() => onPerformSetlist(setlist.id)}
                onDuplicate={() => handleDuplicateSetlist(setlist)}
                onDelete={() => handleDeleteSetlist(setlist)}
                formatDate={formatDate}
              />
            ))}
        </div>
      )}
    </div>
  );
};

interface SetlistCardProps {
  setlist: SetlistMetadata;
  onEdit: () => void;
  onPerform: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  formatDate: (date: Date) => string;
}

const SetlistCard: React.FC<SetlistCardProps> = ({
  setlist,
  onEdit,
  onPerform,
  onDuplicate,
  onDelete,
  formatDate
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="setlist-card bg-card border border-border rounded-lg p-6 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-foreground mb-1 truncate">
            {setlist.name}
          </h3>
          {setlist.description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {setlist.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onEdit}
            className="touch-target border border-border rounded-lg px-4 py-2 hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Edit size={16} />
            <span>Edit</span>
          </button>
          
          <button
            onClick={onPerform}
            className="touch-target bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Music size={16} />
            <span>Perform</span>
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="touch-target p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onDuplicate();
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-accent flex items-center gap-2"
                >
                  <Copy size={14} />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-accent flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Music size={14} />
          <span>{setlist.songCount} songs</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>Updated {formatDate(setlist.updatedAt)}</span>
        </div>
        {setlist.estimatedDuration && (
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{Math.round(setlist.estimatedDuration / 60)} min</span>
          </div>
        )}
      </div>

      {setlist.tags && setlist.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {setlist.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
