# Songs Data Structure

This directory contains individual song files for GigPad. Each song is stored in ChordPro format (`.chordpro` files) for easy editing and creation.

## File Structure

```
songs/
├── index.json                    # Index of all songs with metadata
├── 10000-reasons.chordpro       # Individual song file in ChordPro format
├── his-glory-and-my-good.chordpro
├── saved-my-soul.chordpro
├── because-of-christ.chordpro
├── it-is-finished.chordpro
└── README.md                    # This file
```

## Adding New Songs

1. **Create a new song file**: `{song-id}.chordpro` in ChordPro format
2. **Update the index**: Add the song metadata to `index.json`
3. **Follow the ChordPro format**: Use standard ChordPro syntax (see below)

## ChordPro Format

Each song file uses the ChordPro format with the following structure:

```chordpro
Title: Song Title
Artist: Artist Name
Key: [C]
Original Key: C
Capo: 0
Tempo: 120

Verse 1:
This is a [C]line with [G]chords above the [Am]lyrics
Another line [F]without many [C]chords

Chorus:
The [C]chorus has [G]chords too
[Am]Placed above the [F]words they go [C]with

Bridge:
[F]Instrumental sections can have [C]just chords
Or [G]mixed with [Am]lyrics
```

### ChordPro Syntax Rules:
- **Metadata**: Use `Title:`, `Artist:`, `Key:`, `Tempo:`, etc. at the top
- **Sections**: Use section names followed by a colon (e.g., `Verse 1:`, `Chorus:`)
- **Chords**: Place chords in square brackets `[C]` above the lyrics
- **Positioning**: Chords are placed at the exact position in the lyrics where they should be played

## Index File Schema

The `index.json` file contains lightweight metadata for efficient loading:

```json
[
  {
    "id": "song-id",
    "title": "Song Title",
    "artist": "Artist Name",
    "originalKey": "C",
    "tempo": 120,
    "capoPosition": 0
  }
]
```

## Benefits of ChordPro Format

- **Easy to Edit**: Standard text format that's human-readable and editable
- **Widely Supported**: ChordPro is a standard format used by many music applications
- **Simple Syntax**: Easy to learn and write by hand
- **Version Control Friendly**: Plain text files work great with git
- **Scalability**: Easy to add hundreds of songs without performance issues
- **Maintainability**: Each song can be edited independently
- **Performance**: Only load full song data when needed
- **Collaboration**: Multiple people can work on different songs simultaneously

## Performance Notes

- The app loads `index.json` first for the songs list
- Individual song files are loaded on-demand when viewing/performing
- Songs are cached after first load for better performance
- Use the `dataLoader.preloadSongs()` method to preload setlist songs
- All songs are stored in ChordPro (`.chordpro`) format
