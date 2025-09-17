import React, { useEffect, useState } from 'react';

const themes: Record<string, Record<string, string>> = {
  green: {
    '500': '#22c55e', '600': '#16a34a', '700': '#15803d', 'text': '#4ade80',
  },
  blue: {
    '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8', 'text': '#60a5fa',
  },
  purple: {
    '500': '#8b5cf6', '600': '#7c3aed', '700': '#6d28d9', 'text': '#a78bfa',
  },
  red: {
    '500': '#ef4444', '600': '#dc2626', '700': '#b91c1c', 'text': '#f87171',
  },
};

type ThemeName = keyof typeof themes;

export const ThemeSwitcher: React.FC = () => {
  const [activeTheme, setActiveTheme] = useState<ThemeName>('green');

  useEffect(() => {
    const savedTheme = (localStorage.getItem('sm26_theme') as ThemeName) || 'green';
    if (themes[savedTheme]) {
        applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (themeName: ThemeName) => {
    const theme = themes[themeName];
    const root = document.documentElement;
    root.style.setProperty('--color-accent-500', theme['500']);
    root.style.setProperty('--color-accent-600', theme['600']);
    root.style.setProperty('--color-accent-700', theme['700']);
    root.style.setProperty('--color-text-accent', theme['text']);
    localStorage.setItem('sm26_theme', themeName);
    setActiveTheme(themeName);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-400 hidden sm:inline">Theme:</span>
      {Object.keys(themes).map(themeName => (
        <button
          key={themeName}
          onClick={() => applyTheme(themeName as ThemeName)}
          className={`w-6 h-6 rounded-full border-2 transition-transform duration-150 ${activeTheme === themeName ? 'border-white scale-110' : 'border-transparent'}`}
          style={{ backgroundColor: themes[themeName as ThemeName]['500'] }}
          aria-label={`Switch to ${themeName} theme`}
        />
      ))}
    </div>
  );
};
