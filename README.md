# Guitar Performer - Live Performance App

A Progressive Web App designed for live guitar performances that provides musicians with an intuitive interface to manage setlists, display chords and lyrics, and play backing tracks during performances on iPad devices.

## 🎯 Features

### ✅ Implemented (Phase 1-3)
- **Setlist Management**: Create and manage multiple setlists for different venues/occasions
- **Chord & Lyric Display**: Real-time display with chords positioned above lyrics
- **Performance Navigation**: Easy progression through setlist during live performance
- **Chord Transposition**: Real-time key changes with capo support
- **Progressive Web App**: Installable, native-like experience on iPad
- **Touch-Optimized UI**: Large touch targets and iPad-friendly interface
- **Offline Support**: Core functionality works without internet connection
- **Audio System**: Framework for backing track playback (audio files not included)

### 🎵 Sample Content
- 3 popular songs with full chord/lyric data:
  - Wonderwall (Oasis)
  - Blackbird (The Beatles) 
  - Hotel California (Eagles)
- 2 sample setlists ready for performance
- Backing track configuration for multiple keys

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd sing

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Building for Production
```bash
# Build the app
pnpm build

# Preview the build
pnpm preview
```

## 📱 Usage

### For Performers
1. **Browse Setlists**: View available setlists on the main screen
2. **Start Performance**: Tap "Start" on any setlist to enter performance mode
3. **Navigate Songs**: Use large arrow buttons to move between songs
4. **Transpose On-the-Fly**: Tap the settings icon to access transposition controls
5. **Audio Backing**: Play/pause backing tracks (when audio files are available)

### For Setup
1. **Add Songs**: Edit `/public/data/songs/songs.json` to add new songs
2. **Create Setlists**: Edit `/public/data/setlists/setlists.json` to create new setlists
3. **Add Audio**: Place MP3 files in `/public/data/loops/audio/` and update `loops.json`

## 🏗️ Architecture

### Tech Stack
- **React 18+** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling
- **PWA** with Service Worker

### Data Structure
```
/public/data/
├── songs/songs.json          # Song database with chords/lyrics
├── setlists/setlists.json    # Setlist configurations
└── loops/
    ├── loops.json            # Backing track metadata
    └── audio/                # MP3 files (not included)
```

### Key Components
- **ChordLyricDisplay**: Renders chords above lyrics with transposition
- **PerformanceView**: Full-screen performance interface
- **SetlistView**: Setlist management and selection
- **ChordTransposer**: Real-time chord transposition engine
- **AudioManager**: Backing track playback system

## 🎼 Adding Content

### Adding Songs
Edit `/public/data/songs/songs.json`:
```json
{
  "id": "song-id",
  "title": "Song Title",
  "artist": "Artist Name",
  "originalKey": "G",
  "capoPosition": 2,
  "sections": [
    {
      "type": "verse",
      "name": "Verse 1",
      "content": [
        {
          "lyrics": "Your lyrics here",
          "chords": [
            { "chord": "G", "position": 0 },
            { "chord": "C", "position": 15 }
          ]
        }
      ]
    }
  ]
}
```

### Creating Setlists
Edit `/public/data/setlists/setlists.json`:
```json
{
  "id": "setlist-id",
  "name": "Setlist Name",
  "description": "Description",
  "songs": [
    {
      "songId": "song-id",
      "order": 1,
      "customKey": "A",
      "notes": "Performance notes"
    }
  ]
}
```

## 📱 PWA Installation

### iPad Installation
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will install as a native-like app

### Features
- Offline functionality
- Native app-like experience
- Optimized for portrait orientation
- Touch-friendly interface

## 🎵 Audio Setup

The app supports backing track playback but doesn't include audio files. To add backing tracks:

1. Create MP3 files for each key (e.g., `C-ambient-pad.mp3`)
2. Place files in `/public/data/loops/audio/`
3. Update `/public/data/loops/loops.json` with metadata
4. Audio will automatically play based on current song key

## 🔧 Development

### Project Structure
```
src/
├── components/           # React components
├── types/               # TypeScript interfaces
├── utils/               # Utilities (transposer, data loader, audio)
└── App.tsx             # Main application component
```

### Key Features
- **Chord Transposition**: Supports all 12 chromatic keys with complex chords
- **Touch Optimization**: 44px minimum touch targets
- **Performance Focus**: Minimal UI during performance mode
- **Offline First**: Service Worker caches all essential data

## 🎯 Roadmap

### Phase 4 (Future)
- [ ] Cloud sync for setlists and songs
- [ ] Collaborative setlist sharing  
- [ ] Advanced audio effects and mixing
- [ ] Metronome integration
- [ ] Recording capabilities
- [ ] User authentication system
- [ ] Song import from popular chord sites

## 🐛 Troubleshooting

### Service Worker Issues (Development)
If you see a blank screen after regular reload but hard refresh works:

**Quick Fix:**
- Add `?clear-sw` to the URL (e.g., `http://localhost:5173/?clear-sw`)
- Or hard refresh with `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)

**Manual Fix:**
1. Open DevTools (F12)
2. Go to Application tab → Storage
3. Click "Clear storage" and reload
4. Or run in console: `loadScript('/clear-sw.js')`

**Why this happens:**
- Service Worker caches resources for offline use
- In development, cached files can become stale
- The updated SW automatically bypasses cache in dev mode

### Audio Issues
- Ensure audio files are in MP3 format
- Check browser audio permissions
- Verify file paths in `loops.json`
- Test with browser developer tools

### PWA Issues
- Clear browser cache and reload
- Check Service Worker registration in DevTools
- Ensure HTTPS in production

### Performance Issues
- Reduce number of songs in setlists
- Optimize images and audio file sizes
- Check for console errors

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on iPad
5. Submit a pull request

## 🎸 For Musicians

This app was built by musicians, for musicians. It's designed to handle the real-world needs of live performance:

- **Reliable**: Works offline when WiFi fails
- **Fast**: Instant song switching and transposition
- **Readable**: High contrast text for stage lighting
- **Touch-Friendly**: Works with guitar picks and sweaty fingers
- **Flexible**: Transpose any song to any key instantly

Perfect for solo acoustic performances, coffee shop gigs, open mic nights, and intimate venues.

---

**Built with ❤️ for the live music community**