import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { SetlistView } from './components/SetlistView';
import { PerformanceView } from './components/PerformanceView';
import { PerformancePrompt } from './components/PerformancePrompt';
import { SongsView } from './components/SongsView';
import type { Setlist, Song } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'setlists' | 'performance' | 'songs'>('setlists');
  const [currentSetlist, setCurrentSetlist] = useState<Setlist | null>(null);
  const [currentSongs, setCurrentSongs] = useState<Song[]>([]);
  const [lastSetlist, setLastSetlist] = useState<{ setlist: Setlist; songs: Song[] } | null>(null);

  const handleSetlistSelect = (setlist: Setlist, songs: Song[]) => {
    setCurrentSetlist(setlist);
    setCurrentSongs(songs);
    setLastSetlist({ setlist, songs });
    setCurrentView('performance');
  };

  const handleBackToSetlists = () => {
    setCurrentView('setlists');
    setCurrentSetlist(null);
    setCurrentSongs([]);
  };

  const handleResumePerformance = () => {
    if (lastSetlist) {
      setCurrentSetlist(lastSetlist.setlist);
      setCurrentSongs(lastSetlist.songs);
      setCurrentView('performance');
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'setlists':
        return <SetlistView onSetlistSelect={handleSetlistSelect} />;
      case 'performance':
        if (currentSetlist && currentSongs.length > 0) {
          return (
            <PerformanceView
              setlist={currentSetlist}
              songs={currentSongs}
              onBack={handleBackToSetlists}
            />
          );
        }
        return (
          <PerformancePrompt 
            onSelectSetlist={() => setCurrentView('setlists')}
            onResumePerformance={lastSetlist ? handleResumePerformance : undefined}
            lastSetlist={lastSetlist}
          />
        );
      case 'songs':
        return <SongsView />;
      default:
        return <SetlistView onSetlistSelect={handleSetlistSelect} />;
    }
  };

  return (
    <div className="app ios-safe-height flex flex-col bg-background text-foreground">
      {/* Main content area */}
      <main className={`flex-1 overflow-hidden ${
        !(currentView === 'performance' && currentSetlist && currentSongs.length > 0) 
          ? 'main-content-with-nav' 
          : ''
      }`}>
        {renderCurrentView()}
      </main>

      {/* Bottom navigation - hide only when actually performing */}
      {!(currentView === 'performance' && currentSetlist && currentSongs.length > 0) && (
        <div className="sticky-bottom-nav">
          <Navigation
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </div>
      )}
    </div>
  );
}

export default App;
