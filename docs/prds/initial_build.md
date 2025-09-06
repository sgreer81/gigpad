# Product Requirements Document: Live Guitar Performance App (Initial Build)

## 1. Executive Summary

### 1.1 Product Vision
A Progressive Web App designed for live guitar performances that provides musicians with an intuitive interface to manage setlists, display chords and lyrics, and play backing tracks during performances on iPad devices.

### 1.2 Target Users
- Solo guitarists performing live
- Singer-songwriters
- Musicians who perform acoustic sets
- Guitar teachers conducting lessons

### 1.3 Core Value Proposition
Streamline live guitar performances by providing a single, touch-optimized interface that combines setlist management, chord/lyric display, and backing track playback in a native app-like experience.

## 2. Product Overview

### 2.1 Key Features
1. **Setlist Management**: Pre-performance compilation and organization of songs
2. **Chord & Lyric Display**: Real-time display with chords positioned above lyrics
3. **Performance Navigation**: Easy progression through setlist during live performance
4. **Backing Track Integration**: Automatic key-matched pad loops with playback controls
5. **Chord Transposition**: Real-time key changes with capo support
6. **Progressive Web App**: Installable, native-like experience on iPad

### 2.2 Success Metrics
- App installation rate on target devices
- User engagement during live performances
- Setlist completion rates
- User retention for repeat performances

## 3. User Stories & Requirements

### 3.1 Pre-Performance Setup
**As a performer, I want to:**
- Create and save multiple setlists for different venues/occasions
- Add songs to setlists from a searchable database
- Reorder songs within a setlist via drag-and-drop
- Preview song content (chords/lyrics) before performance
- Set preferred keys and capo positions for each song

### 3.2 Live Performance
**As a performer, I want to:**
- Navigate through my setlist with large, touch-friendly controls
- View chords positioned accurately above corresponding lyrics
- Start/stop backing track loops with minimal interaction
- Transpose songs on-the-fly during performance
- See current song position and remaining songs in setlist

### 3.3 Song Management
**As a performer, I want to:**
- Store songs with accurate chord-to-lyric alignment
- Transpose any song to any key instantly
- Account for capo usage in chord display
- Access songs quickly through search functionality

## 4. Technical Requirements

### 4.1 Platform & Technology Stack
- **Framework**: React 18+
- **Styling**: Tailwind CSS + shadcn/ui components
- **PWA Features**: Service Worker, Web App Manifest
- **Target Device**: iPad (vertical orientation optimized)
- **Browser Support**: Safari (primary), Chrome (secondary)

### 4.2 Data Architecture

#### 4.2.1 Song Data Structure
```typescript
interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  capoPosition?: number; // 0 = no capo
  tempo?: number;
  sections: SongSection[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
  };
}

interface SongSection {
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro';
  name?: string; // e.g., "Verse 1", "Chorus"
  content: ChordLyricLine[];
}

interface ChordLyricLine {
  lyrics: string;
  chords: ChordPosition[];
}

interface ChordPosition {
  chord: string; // e.g., "Am", "G7", "Cadd9"
  position: number; // character position in lyrics line
}
```

#### 4.2.2 Setlist Data Structure
```typescript
interface Setlist {
  id: string;
  name: string;
  description?: string;
  songs: SetlistSong[];
  createdAt: Date;
  updatedAt: Date;
}

interface SetlistSong {
  songId: string;
  order: number;
  customKey?: string; // Override song's original key
  customCapo?: number; // Override song's capo position
  notes?: string; // Performance notes
}
```

#### 4.2.3 Loop Track Data Structure
```typescript
interface LoopTrack {
  id: string;
  key: string; // Musical key (C, C#, D, etc.)
  style: string; // e.g., "ambient-pad", "acoustic-strum"
  filePath: string; // Path to MP3 file
  duration: number; // Loop duration in seconds
  metadata: {
    tempo?: number;
    description?: string;
  };
}
```

### 4.3 Core Functionality Requirements

#### 4.3.1 Chord Transposition Engine
- Support all 12 chromatic keys
- Handle complex chords (7ths, 9ths, sus, add, etc.)
- Account for capo position in transposition calculations
- Maintain chord quality during transposition

#### 4.3.2 Audio Playback System
- HTML5 Audio API integration
- Loop seamless playback
- Basic controls: play, pause, volume
- Automatic track selection based on song key

#### 4.3.3 PWA Implementation
- Offline functionality for stored songs and setlists
- App installation prompts
- Native-like navigation and gestures
- Optimized for touch interaction

### 4.4 UI/UX Requirements

#### 4.4.1 Design Principles
- **Touch-First**: All interactions optimized for finger navigation
- **High Contrast**: Readable in various lighting conditions
- **Minimal Cognitive Load**: Simple, intuitive interface during performance
- **Responsive Typography**: Scalable text for different viewing distances

#### 4.4.2 Screen Layouts

**Setlist View**
- Full-screen song list with large touch targets
- Current song highlighting
- Progress indicator
- Quick access to performance mode

**Performance View**
- Chord/lyric display with optimal spacing
- Floating navigation controls
- Audio controls overlay
- Minimal UI chrome to maximize content area

**Song Management View**
- Search and filter capabilities
- Song preview with edit options
- Bulk operations for setlist management

### 4.5 Data Storage
- **Phase 1**: Static JSON files in project structure
- **File Structure**:
  ```
  /data
    /songs
      - songs.json
    /setlists
      - setlists.json
    /loops
      - loops.json
      /audio
        - C-ambient-pad.mp3
        - D-ambient-pad.mp3
        - [etc.]
  ```

## 5. Non-Functional Requirements

### 5.1 Performance
- App launch time < 2 seconds
- Song navigation response < 500ms
- Audio playback latency < 100ms
- Smooth scrolling at 60fps

### 5.2 Usability
- Zero learning curve for basic performance navigation
- Accessible to users with limited technical experience
- Graceful handling of accidental touches during performance

### 5.3 Reliability
- Offline functionality for core features
- Graceful degradation when audio files unavailable
- Auto-save for setlist changes

## 6. Implementation Phases

### 6.1 Phase 1: Core Foundation (Weeks 1-2)
- [ ] Project setup with React, Tailwind, shadcn/ui
- [ ] Basic PWA configuration
- [ ] Song data structure implementation
- [ ] Static data loading system
- [ ] Basic chord/lyric display component

### 6.2 Phase 2: Performance Interface (Weeks 3-4)
- [ ] Setlist management interface
- [ ] Performance mode navigation
- [ ] Chord transposition engine
- [ ] Touch-optimized UI components
- [ ] iPad-specific responsive design

### 6.3 Phase 3: Audio Integration (Weeks 5-6)
- [ ] Audio playback system
- [ ] Loop track integration
- [ ] Playback controls
- [ ] Key-based track selection
- [ ] Volume and basic audio controls

### 6.4 Phase 4: Polish & Optimization (Week 7)
- [ ] Performance optimization
- [ ] PWA installation flow
- [ ] Error handling and edge cases
- [ ] User testing and refinements

## 7. Future Considerations

### 7.1 Planned Enhancements
- Remote database integration
- Cloud sync for setlists and songs
- Collaborative setlist sharing
- Advanced audio effects and mixing
- Metronome integration
- Recording capabilities

### 7.2 Technical Debt Considerations
- Migration path from static files to database
- Audio file management and CDN integration
- User authentication system preparation
- Scalable data synchronization architecture

## 8. Risk Assessment

### 8.1 Technical Risks
- **Audio latency on web platform**: Mitigation through Web Audio API optimization
- **PWA adoption barriers**: Clear installation instructions and fallback web experience
- **Touch interaction complexity**: Extensive testing on target devices

### 8.2 User Experience Risks
- **Performance anxiety with new tool**: Comprehensive offline mode and reliability
- **Chord accuracy concerns**: Thorough testing of transposition engine
- **Device compatibility**: Focus on primary target (iPad) with graceful degradation

## 9. Success Criteria

### 9.1 Technical Success
- PWA successfully installs on iPad
- All core features function offline
- Audio playback works reliably across target browsers
- Chord transposition accuracy > 99%

### 9.2 User Success
- Users can complete a full performance using only the app
- Setlist navigation requires minimal attention during performance
- Chord/lyric display is readable in performance lighting conditions
- Audio backing enhances rather than distracts from performance

---

**Document Version**: 1.0  
**Last Updated**: Initial Creation  
**Next Review**: After Phase 1 completion
