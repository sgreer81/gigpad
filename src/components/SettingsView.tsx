import React from 'react';
import { Moon, Sun, Palette, Info, Github, Music, RefreshCw, GitBranch, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsViewProps {
  className?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();

  // Get git info from build-time injection
  const getGitInfo = () => {
    try {
      return typeof __GIT_INFO__ !== 'undefined' ? __GIT_INFO__ : null;
    } catch {
      return null;
    }
  };

  const gitInfo = getGitInfo();

  const handleForceReload = () => {
    // Clear all caches and reload
    if ('serviceWorker' in navigator) {
      // Clear service worker caches
      caches.keys().then(cacheNames => {
        Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
          .then(() => {
            // Unregister service worker
            navigator.serviceWorker.getRegistrations().then(registrations => {
              Promise.all(registrations.map(registration => registration.unregister()))
                .then(() => {
                  // Force hard reload
                  window.location.reload();
                });
            });
          });
      });
    } else {
      // Fallback: just reload with cache bypass
      window.location.reload();
    }
  };

  const formatBuildTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <div className={`settings-view p-4 ${className}`}>
      <div className="header mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your performance experience</p>
      </div>

      <div className="settings-sections space-y-6">
        {/* Appearance Section */}
        <div className="settings-section">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Palette size={20} />
            Appearance
          </h2>
          
          <div className="settings-items space-y-4">
            {/* Theme Toggle */}
            <div className="setting-item bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                  <div>
                    <h3 className="font-medium text-foreground">Theme</h3>
                    <p className="text-sm text-muted-foreground">
                      {theme === 'dark' ? 'Dark mode' : 'Light mode'} - Perfect for {theme === 'dark' ? 'low-light performance environments' : 'bright venues'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${
                    theme === 'dark' 
                      ? 'bg-blue-600 focus:ring-blue-500' 
                      : 'bg-gray-300 focus:ring-gray-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-all duration-200 shadow-sm ${
                      theme === 'dark' 
                        ? 'translate-x-6 bg-white' 
                        : 'translate-x-1 bg-white'
                    }`}
                  />
                  {/* Theme icons inside the toggle */}
                  <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
                    <Sun 
                      size={12} 
                      className={`transition-opacity duration-200 ${
                        theme === 'light' ? 'opacity-60 text-gray-600' : 'opacity-30 text-gray-400'
                      }`} 
                    />
                    <Moon 
                      size={12} 
                      className={`transition-opacity duration-200 ${
                        theme === 'dark' ? 'opacity-60 text-blue-200' : 'opacity-30 text-gray-400'
                      }`} 
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Section */}
        <div className="settings-section">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Music size={20} />
            Audio & Loops
          </h2>
          
          <div className="settings-items space-y-4">
            {/* Auto-start Loops Toggle */}
            <div className="setting-item bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music size={20} />
                  <div>
                    <h3 className="font-medium text-foreground">Auto-start Loops</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically start ambient pads when beginning performance and changing songs
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => updateSettings({ autoStartLoops: !settings.autoStartLoops })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${
                    settings.autoStartLoops 
                      ? 'bg-blue-600 focus:ring-blue-500' 
                      : 'bg-gray-300 focus:ring-gray-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-all duration-200 shadow-sm bg-white ${
                      settings.autoStartLoops 
                        ? 'translate-x-6' 
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Fade Duration Settings */}
            <div className="setting-item bg-card border border-border rounded-lg p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Fade Out Duration</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    How long loops take to fade out when paused (in seconds)
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="500"
                      max="5000"
                      step="500"
                      value={settings.loopFadeOutDuration}
                      onChange={(e) => updateSettings({ loopFadeOutDuration: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm text-foreground font-medium w-12">
                      {(settings.loopFadeOutDuration / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-2">Crossfade Duration</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    How long loops blend together when changing songs (in seconds)
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="250"
                      max="3000"
                      step="250"
                      value={settings.loopBlendDuration}
                      onChange={(e) => updateSettings({ loopBlendDuration: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm text-foreground font-medium w-12">
                      {(settings.loopBlendDuration / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Section */}
        <div className="settings-section">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Info size={20} />
            Performance Tips
          </h2>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="space-y-3 text-sm">
              <div className="tip-item">
                <h4 className="font-medium text-foreground">🎸 Dark Mode Benefits</h4>
                <p className="text-muted-foreground">Reduces eye strain during long performances and works better in dimly lit venues.</p>
              </div>
              
              <div className="tip-item">
                <h4 className="font-medium text-foreground">📱 PWA Installation</h4>
                <p className="text-muted-foreground">Install this app to your home screen for the best performance experience.</p>
              </div>
              
              <div className="tip-item">
                <h4 className="font-medium text-foreground">🔄 Offline Mode</h4>
                <p className="text-muted-foreground">All your setlists and songs work offline - perfect for venues with poor WiFi.</p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="settings-section">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Github size={20} />
            About
          </h2>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">App Name</span>
                <span className="text-foreground font-medium">GigPad</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="text-foreground font-medium">1.0.0</span>
              </div>
              {gitInfo && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <GitBranch size={12} />
                      Commit
                    </span>
                    <span className="text-foreground font-mono text-xs">
                      {gitInfo.shortHash}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Branch</span>
                    <span className="text-foreground font-medium">{gitInfo.branch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock size={12} />
                      Built
                    </span>
                    <span className="text-foreground text-xs">
                      {formatBuildTime(gitInfo.buildTime)}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Optimized for</span>
                <span className="text-foreground font-medium">iPad & Touch Devices</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Built with ❤️ for musicians who perform live
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="settings-section">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <RefreshCw size={20} />
            App Management
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleForceReload}
              className="p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <RefreshCw size={16} />
                <span className="text-sm font-medium">Force Reload</span>
              </div>
              <div className="text-xs opacity-90">Get latest version</div>
            </button>
            
            <button
              onClick={() => {
                if ('serviceWorker' in navigator) {
                  caches.keys().then(cacheNames => {
                    Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
                      .then(() => {
                        alert('Cache cleared! The app will reload with fresh content.');
                        window.location.reload();
                      });
                  });
                } else {
                  alert('Cache cleared!');
                  window.location.reload();
                }
              }}
              className="p-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-center"
            >
              <div className="text-sm font-medium">Clear Cache</div>
              <div className="text-xs text-muted-foreground mt-1">Refresh app data</div>
            </button>
            
            <button
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({
                    title: 'GigPad - Live Guitar Performance',
                    text: 'Check out GigPad - the ultimate digital companion for live guitar gigs!',
                    url: url
                  });
                } else {
                  navigator.clipboard.writeText(url);
                  alert('App URL copied to clipboard!');
                }
              }}
              className="p-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-center"
            >
              <div className="text-sm font-medium">Share App</div>
              <div className="text-xs text-muted-foreground mt-1">Tell other musicians</div>
            </button>

            {gitInfo && (
              <button
                onClick={() => {
                  const info = `GigPad Version Info:
App Version: 1.0.0
Git Commit: ${gitInfo.shortHash} (${gitInfo.commitHash})
Branch: ${gitInfo.branch}
Built: ${formatBuildTime(gitInfo.buildTime)}`;
                  
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(info).then(() => {
                      alert('Version info copied to clipboard!');
                    });
                  } else {
                    alert(info);
                  }
                }}
                className="p-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-center"
              >
                <div className="text-sm font-medium">Copy Version Info</div>
                <div className="text-xs text-muted-foreground mt-1">For bug reports</div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
