# Songs Data Structure

This directory contains individual song files for GigPad. Each song is stored in its own JSON file for better scalability and easier editing.

## File Structure

```
songs/
├── index.json          # Index of all songs with metadata
├── wonderwall.json     # Individual song file
├── blackbird.json      # Individual song file
├── hotel-california.json
├── his-glory-and-my-good.json
└── README.md          # This file
```

## Adding New Songs

1. **Create a new song file**: `{song-id}.json`
2. **Update the index**: Add the song metadata to `index.json`
3. **Follow the schema**: Use the same structure as existing songs

## Song File Schema

Each song file should contain:

```json
{
  "id": "unique-song-id",
  "title": "Song Title",
  "artist": "Artist Name",
  "originalKey": "C",
  "capoPosition": 0,
  "tempo": 120,
  "sections": [
    {
      "type": "verse|chorus|bridge|intro|outro",
      "name": "Section Name",
      "content": [
        {
          "lyrics": "Lyric line",
          "chords": [
            { "chord": "C", "position": 0 }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "tags": ["tag1", "tag2"],
    "difficulty": "beginner|intermediate|advanced",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

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

## Benefits of This Structure

- **Scalability**: Easy to add hundreds of songs without performance issues
- **Maintainability**: Each song can be edited independently
- **Performance**: Only load full song data when needed
- **Version Control**: Better git diffs for individual song changes
- **Collaboration**: Multiple people can work on different songs simultaneously

## Performance Notes

- The app loads `index.json` first for the songs list
- Individual song files are loaded on-demand when viewing/performing
- Songs are cached after first load for better performance
- Use the `dataLoader.preloadSongs()` method to preload setlist songs
