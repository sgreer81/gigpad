# Product Requirements Document: Setlist Management Feature

## 1. Executive Summary

### 1.1 Feature Overview
A comprehensive setlist creation and editing interface that allows users to build custom performance setlists from their song library, with persistent storage in browser localStorage and intuitive drag-and-drop functionality optimized for iPad touch interaction.

### 1.2 User Value
- **Pre-Performance Planning**: Organize songs for specific venues, audiences, or occasions
- **Performance Flow**: Create logical song progressions that enhance live performance
- **Flexibility**: Easily modify setlists based on audience response or time constraints
- **Persistence**: Save multiple setlists for different performance contexts

### 1.3 Success Metrics
- Setlist creation completion rate > 90%
- Average time to create a 10-song setlist < 5 minutes
- User retention for setlist feature > 80%
- Zero data loss incidents with localStorage persistence

## 2. User Stories & Requirements

### 2.1 Primary User Stories

**As a performer, I want to:**
- Create new setlists from scratch with custom names and descriptions
- Browse and search my song library while building setlists
- Add songs to setlists with a single tap/click
- Reorder songs within setlists using drag-and-drop
- Remove songs from setlists easily
- Save multiple setlists for different occasions
- Edit existing setlists (rename, modify song order, add/remove songs)
- Delete setlists I no longer need
- See setlist metadata (creation date, song count, total estimated duration)

**As a performer, I want to:**
- Override song keys for specific setlist performances
- Add performance notes for individual songs within setlists
- Preview songs while building setlists
- Duplicate existing setlists as starting points for new ones
- See visual indicators for songs already in the current setlist

### 2.2 Secondary User Stories

**As a performer, I want to:**
- Export setlists for sharing or backup
- Import setlists from other sources
- Search and filter my existing setlists
- Sort setlists by name, creation date, or last modified
- See setlist statistics (total duration, key distribution, etc.)

## 3. Technical Requirements

### 3.1 Data Structure

#### 3.1.1 Setlist Schema
```typescript
interface Setlist {
  id: string; // UUID v4
  name: string;
  description?: string;
  songs: SetlistSong[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    estimatedDuration?: number; // calculated from song tempos
    tags?: string[];
  };
}

interface SetlistSong {
  songId: string; // References song from library
  order: number; // 0-based ordering
  customKey?: string; // Override original song key
  customCapo?: number; // Override original capo position
  notes?: string; // Performance-specific notes
  addedAt: Date; // When song was added to setlist
}

interface SetlistMetadata {
  id: string;
  name: string;
  description?: string;
  songCount: number;
  estimatedDuration?: number;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}
```

### 3.2 localStorage Implementation

#### 3.2.1 Storage Keys
- `gigpad_setlists`: Array of complete setlist objects
- `gigpad_setlists_metadata`: Array of setlist metadata for quick loading
- `gigpad_setlists_version`: Schema version for migration support

#### 3.2.2 Storage Operations
```typescript
interface SetlistStorage {
  // CRUD Operations
  createSetlist(setlist: Omit<Setlist, 'id' | 'metadata'>): Promise<Setlist>;
  getSetlist(id: string): Promise<Setlist | null>;
  getAllSetlists(): Promise<SetlistMetadata[]>;
  updateSetlist(id: string, updates: Partial<Setlist>): Promise<Setlist>;
  deleteSetlist(id: string): Promise<boolean>;
  
  // Utility Operations
  duplicateSetlist(id: string, newName: string): Promise<Setlist>;
  addSongToSetlist(setlistId: string, songId: string, position?: number): Promise<Setlist>;
  removeSongFromSetlist(setlistId: string, songId: string): Promise<Setlist>;
  reorderSetlistSongs(setlistId: string, fromIndex: number, toIndex: number): Promise<Setlist>;
  
  // Data Management
  exportSetlists(): Promise<string>; // JSON export
  importSetlists(data: string): Promise<Setlist[]>;
  clearAllSetlists(): Promise<void>;
}
```

### 3.3 UI Components Architecture

#### 3.3.1 Core Components
```typescript
// Main setlist management screen
<SetlistManager />
  ├── <SetlistList /> // List of existing setlists
  ├── <SetlistEditor /> // Create/edit setlist interface
  └── <SongLibraryBrowser /> // Browse songs to add

// Setlist editor components
<SetlistEditor>
  ├── <SetlistHeader /> // Name, description, metadata
  ├── <SetlistSongList /> // Drag-and-drop song list
  ├── <SongSearch /> // Search/filter song library
  └── <SetlistActions /> // Save, cancel, delete actions

// Individual song components
<SetlistSongItem /> // Draggable song in setlist
<LibrarySongItem /> // Song in library browser
<SongPreview /> // Quick preview modal
```

#### 3.3.2 Drag and Drop Implementation
- Use `@dnd-kit/core` for accessible drag-and-drop
- Touch-optimized for iPad interaction
- Visual feedback during drag operations
- Auto-scroll when dragging near edges
- Haptic feedback on supported devices

### 3.4 State Management

#### 3.4.1 Context Structure
```typescript
interface SetlistContext {
  // State
  setlists: SetlistMetadata[];
  currentSetlist: Setlist | null;
  isEditing: boolean;
  songLibrary: SongMetadata[];
  
  // Actions
  createSetlist: (name: string, description?: string) => Promise<void>;
  editSetlist: (id: string) => Promise<void>;
  saveSetlist: () => Promise<void>;
  deleteSetlist: (id: string) => Promise<void>;
  addSongToSetlist: (songId: string, position?: number) => void;
  removeSongFromSetlist: (songId: string) => void;
  reorderSongs: (fromIndex: number, toIndex: number) => void;
  
  // Utility
  duplicateSetlist: (id: string, newName: string) => Promise<void>;
  loadSetlist: (id: string) => Promise<void>;
  clearCurrentSetlist: () => void;
}
```

## 4. User Interface Requirements

### 4.1 Design Principles
- **Touch-First Design**: All interactions optimized for finger navigation on iPad
- **Visual Hierarchy**: Clear distinction between setlists, songs, and actions
- **Immediate Feedback**: Real-time updates during drag operations
- **Error Prevention**: Confirmation dialogs for destructive actions
- **Progressive Disclosure**: Show details on demand to reduce cognitive load

### 4.2 Screen Layouts

#### 4.2.1 Setlist Manager (Main Screen)
```
┌─────────────────────────────────────┐
│ ☰ Setlists                    [+]   │
├─────────────────────────────────────┤
│ 🎵 Acoustic Evening Set             │
│    12 songs • Created Jan 15        │
│    [Edit] [Duplicate] [Delete]      │
├─────────────────────────────────────┤
│ 🎸 Rock Covers Night               │
│    8 songs • Created Jan 10         │
│    [Edit] [Duplicate] [Delete]      │
├─────────────────────────────────────┤
│ 🎤 Open Mic Set                    │
│    5 songs • Created Jan 5          │
│    [Edit] [Duplicate] [Delete]      │
└─────────────────────────────────────┘
```

#### 4.2.2 Setlist Editor Screen
```
┌─────────────────────────────────────┐
│ ← [Save] Acoustic Evening Set       │
├─────────────────────────────────────┤
│ Description: Mellow songs for...    │
├─────────────────────────────────────┤
│ Songs in Setlist (12)               │
│ ≡ 1. Wonderwall - Oasis      [×]   │
│ ≡ 2. Blackbird - Beatles     [×]   │
│ ≡ 3. Hotel California        [×]   │
├─────────────────────────────────────┤
│ 🔍 Add Songs                        │
│ [Search: "acoustic"]                │
│ + His Glory and My Good             │
│ + Tears in Heaven                   │
│ + Mad World                         │
└─────────────────────────────────────┘
```

### 4.3 Interaction Patterns

#### 4.3.1 Drag and Drop Behavior
- **Long press** (500ms) to initiate drag on touch devices
- **Visual elevation** and shadow during drag
- **Drop zones** highlighted when dragging
- **Smooth animations** for reordering
- **Snap to position** when dropping

#### 4.3.2 Touch Gestures
- **Tap**: Select/add song
- **Long press**: Initiate drag
- **Swipe left**: Quick delete (with confirmation)
- **Pull to refresh**: Reload song library
- **Pinch**: Zoom text (accessibility)

### 4.4 Responsive Design
- **Portrait iPad**: Primary target (768px × 1024px)
- **Landscape iPad**: Adapted layout with side-by-side panels
- **iPhone**: Stacked layout with simplified navigation
- **Desktop**: Enhanced with keyboard shortcuts

## 5. Feature Specifications

### 5.1 Setlist Creation Flow
1. **Tap "+" button** on setlist manager
2. **Enter setlist name** (required) and description (optional)
3. **Tap "Create"** to enter edit mode
4. **Browse song library** in bottom panel
5. **Tap songs** to add to setlist
6. **Drag to reorder** songs in setlist
7. **Tap "Save"** to persist setlist

### 5.2 Song Addition Methods
- **Library Browser**: Scroll through all songs
- **Search**: Filter by title, artist, or tags
- **Recent**: Show recently viewed/performed songs
- **Favorites**: Quick access to marked favorites
- **Key Filter**: Filter by musical key

### 5.3 Setlist Editing Features
- **Inline Editing**: Edit name/description without leaving screen
- **Bulk Operations**: Select multiple songs for batch actions
- **Song Customization**: Override key/capo per setlist
- **Performance Notes**: Add notes visible during performance
- **Estimated Duration**: Calculate based on song tempos

### 5.4 Data Persistence Features
- **Auto-save**: Save changes every 30 seconds while editing
- **Conflict Resolution**: Handle concurrent edits gracefully
- **Backup/Restore**: Export/import functionality
- **Migration**: Handle schema updates transparently

## 6. Error Handling & Edge Cases

### 6.1 Data Integrity
- **Orphaned Songs**: Handle songs removed from library
- **Duplicate Detection**: Prevent duplicate songs in setlist
- **Storage Limits**: Handle localStorage quota exceeded
- **Corrupted Data**: Graceful recovery from invalid JSON

### 6.2 User Experience
- **Network Issues**: Offline-first design
- **Performance**: Optimize for large song libraries (1000+ songs)
- **Memory Management**: Lazy loading for large setlists
- **Touch Conflicts**: Prevent accidental actions during drag

### 6.3 Validation Rules
- **Setlist Name**: Required, 1-100 characters, unique names
- **Song Limits**: Maximum 50 songs per setlist
- **Description**: Optional, maximum 500 characters
- **Custom Keys**: Validate musical key format

## 7. Performance Requirements

### 7.1 Response Times
- **Setlist List Load**: < 200ms
- **Setlist Edit Mode**: < 500ms
- **Song Addition**: < 100ms
- **Drag Operation**: 60fps smooth animation
- **Save Operation**: < 1 second

### 7.2 Storage Efficiency
- **Metadata Caching**: Quick access to setlist summaries
- **Lazy Loading**: Load full setlist data on demand
- **Compression**: Minimize localStorage usage
- **Cleanup**: Remove orphaned data automatically

## 8. Accessibility Requirements

### 8.1 Touch Accessibility
- **Minimum Touch Targets**: 44px × 44px (iOS guidelines)
- **Touch Feedback**: Visual and haptic feedback
- **Error Recovery**: Easy undo for accidental actions
- **Alternative Input**: Keyboard navigation support

### 8.2 Visual Accessibility
- **High Contrast**: Readable in various lighting conditions
- **Scalable Text**: Support dynamic type sizing
- **Color Independence**: Don't rely solely on color for information
- **Focus Indicators**: Clear focus states for navigation

## 9. Testing Strategy

### 9.1 Unit Tests
- localStorage operations (CRUD)
- Data validation and sanitization
- Drag and drop logic
- Search and filtering algorithms

### 9.2 Integration Tests
- Complete setlist creation flow
- Song addition/removal workflows
- Data persistence across sessions
- Error recovery scenarios

### 9.3 User Testing
- iPad touch interaction testing
- Performance with large libraries
- Accessibility testing with assistive technologies
- Real-world usage scenarios

## 10. Implementation Phases

### 10.1 Phase 1: Core Infrastructure (Week 1)
- [ ] localStorage service implementation
- [ ] Basic setlist data structures
- [ ] Context provider setup
- [ ] Core CRUD operations

### 10.2 Phase 2: Basic UI (Week 2)
- [ ] Setlist manager screen
- [ ] Basic setlist editor
- [ ] Song library browser
- [ ] Simple add/remove functionality

### 10.3 Phase 3: Advanced Interactions (Week 3)
- [ ] Drag and drop implementation
- [ ] Search and filtering
- [ ] Song customization (key/capo overrides)
- [ ] Performance notes

### 10.4 Phase 4: Polish & Optimization (Week 4)
- [ ] Touch gesture optimization
- [ ] Performance improvements
- [ ] Error handling and validation
- [ ] Accessibility enhancements
- [ ] User testing and refinements

## 11. Future Enhancements

### 11.1 Advanced Features
- **Smart Suggestions**: AI-powered song recommendations
- **Setlist Templates**: Pre-built setlists for common scenarios
- **Collaborative Editing**: Share setlists with band members
- **Performance Analytics**: Track which songs work well together

### 11.2 Integration Opportunities
- **Cloud Sync**: Backup setlists to cloud storage
- **Social Sharing**: Share setlists with other musicians
- **Streaming Integration**: Link to Spotify/Apple Music for reference
- **Calendar Integration**: Associate setlists with performance dates

## 12. Risk Assessment

### 12.1 Technical Risks
- **localStorage Limitations**: Browser storage quotas and persistence
- **Performance Degradation**: Large libraries affecting UI responsiveness
- **Touch Interaction Issues**: Drag and drop reliability on various devices

### 12.2 Mitigation Strategies
- **Progressive Enhancement**: Core functionality works without advanced features
- **Graceful Degradation**: Fallback options for storage failures
- **Performance Monitoring**: Track and optimize critical user paths
- **Extensive Testing**: Cross-device and cross-browser validation

---

**Document Version**: 1.0  
**Last Updated**: Initial Creation  
**Dependencies**: Initial Build PRD (initial_build.md)  
**Next Review**: After Phase 1 completion
