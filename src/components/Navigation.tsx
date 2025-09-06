import React from 'react';
import { Music, List, Settings } from 'lucide-react';

interface NavigationProps {
  currentView: 'setlists' | 'performance' | 'songs';
  onViewChange: (view: 'setlists' | 'performance' | 'songs') => void;
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  className = ''
}) => {
  const navItems = [
    { id: 'setlists' as const, label: 'Setlists', icon: List },
    { id: 'performance' as const, label: 'Performance', icon: Music },
    { id: 'songs' as const, label: 'Songs', icon: Settings },
  ];

  return (
    <nav className={`navigation bg-card border-t border-border ${className}`}>
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`touch-target flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              currentView === id
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
