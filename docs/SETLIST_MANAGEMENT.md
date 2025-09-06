# Setlist Management Feature

## Overview

The Setlist Management feature provides a comprehensive interface for creating, editing, and managing performance setlists. This implementation follows the specifications outlined in the Product Requirements Document (PRD) and includes:

- **localStorage-based persistence** for offline-first functionality
- **Drag-and-drop reordering** with touch optimization for iPad
- **Search and filtering** capabilities for the song library
- **Real-time editing** with auto-save functionality
- **Migration support** from legacy static JSON setlists

## Features Implemented

### ✅ Core Infrastructure (Phase 1)
- [x] localStorage service implementation (`setlistStorage.ts`)
- [x] Enhanced setlist data structures with metadata
- [x] Context provider setup (`SetlistContext.tsx`)
- [x] Core CRUD operations with validation

### ✅ Basic UI (Phase 2)
- [x] Setlist manager screen (`SetlistManager.tsx`)
- [x] Setlist editor with dual-pane layout (`SetlistEditor.tsx`)
- [x] Song library browser with search
- [x] Add/remove song functionality

### ✅ Advanced Interactions (Phase 3)
- [x] Drag and drop implementation using `@dnd-kit`
- [x] Search and filtering by title, artist, key, and tags
- [x] Song customization placeholders (key/capo overrides)
- [x] Performance notes support

### ✅ Integration & Polish (Phase 4)
- [x] Touch gesture optimization for iPad
- [x] Navigation integration
- [x] Error handling and validation
- [x] Migration from legacy setlists
- [x] Responsive design considerations

## Architecture

### Data Flow
```
App.tsx (SetlistProvider)
├── SetlistManager.tsx (List & Create)
├── SetlistEditor.tsx (Edit & Drag-Drop)
└── SetlistContext.tsx (State Management)
    ├── setlistStorage.ts (localStorage CRUD)
    ├── setlistMigration.ts (Legacy Migration)
    └── dataLoader.ts (Song Library)
```

### Key Components

#### SetlistManager
- Displays all setlists in a card-based layout
- Create new setlists with name and description
- Actions: Edit, Duplicate, Delete, Perform
- Responsive design with touch-optimized interactions

#### SetlistEditor
- Dual-pane layout: setlist songs (left) + song library (right)
- Drag-and-drop reordering with visual feedback
- Real-time search and filtering
- Inline editing of setlist metadata

#### SetlistContext
- Centralized state management for all setlist operations
- Automatic migration from legacy JSON setlists
- Error handling and loading states
- Optimistic updates for better UX

### Data Structures

```typescript
interface Setlist {
  id: string; // UUID v4
  name: string;
  description?: string;
  songs: SetlistSong[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    estimatedDuration?: number;
    tags?: string[];
  };
}

interface SetlistSong {
  songId: string;
  order: number; // 0-based ordering
  customKey?: string;
  customCapo?: number;
  notes?: string;
  addedAt: Date;
}
```

## Usage

### Creating a Setlist
1. Navigate to the Setlists tab (now shows SetlistManager)
2. Click the "+" button or "Create Your First Setlist"
3. Enter name and optional description
4. Click "Create Setlist" to enter edit mode

### Editing a Setlist
1. Click "Edit" on any setlist card
2. Use the dual-pane editor:
   - Left pane: Current setlist songs (drag to reorder)
   - Right pane: Song library (search and add songs)
3. Click "Save" to persist changes

### Managing Songs
- **Add**: Click "+" button next to any song in the library
- **Remove**: Click "×" button next to any song in the setlist
- **Reorder**: Drag songs by the grip handle (≡) to new positions
- **Search**: Use the search box to filter by title, artist, key, or tags

## Storage & Migration

### localStorage Keys
- `gigpad_setlists`: Complete setlist objects
- `gigpad_setlists_metadata`: Lightweight metadata for quick loading
- `gigpad_setlists_version`: Schema version for future migrations

### Automatic Migration
The system automatically migrates existing setlists from the static JSON files (`/data/setlists/setlists.json`) to localStorage on first load. This ensures backward compatibility while enabling the new editing features.

## Performance Considerations

- **Metadata Caching**: Quick loading of setlist summaries
- **Lazy Loading**: Full setlist data loaded only when needed
- **Optimistic Updates**: UI updates immediately, syncs to storage asynchronously
- **Touch Optimization**: 44px minimum touch targets, haptic feedback where supported

## Browser Compatibility

- **Modern browsers** with localStorage support
- **iOS Safari** optimized for iPad touch interaction
- **Progressive enhancement** - core functionality works without advanced features

## Future Enhancements

The current implementation provides a solid foundation for future features:

- **Cloud sync** integration
- **Collaborative editing** with real-time updates
- **Smart suggestions** based on song analysis
- **Performance analytics** and insights
- **Export/import** to various formats
- **Setlist templates** for common scenarios

## Development Notes

### Key Dependencies
- `@dnd-kit/core` - Accessible drag-and-drop
- `@dnd-kit/sortable` - Sortable list functionality
- `uuid` - Unique identifier generation
- `lucide-react` - Consistent iconography

### Testing Considerations
- localStorage quota handling
- Drag-and-drop on various devices
- Migration from different legacy formats
- Performance with large song libraries (1000+ songs)

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Touch target sizing (44px minimum)
