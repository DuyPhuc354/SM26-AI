import React, { useState, useEffect } from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export const Header: React.FC = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <header className="bg-gray-800/70 backdrop-blur-sm shadow-lg sticky top-0 z-40 border-b border-gray-700/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-md bg-[var(--color-accent-500)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L8 12v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wider">Soccer Manager 2026</h1>
            <p className="text-[var(--color-text-accent)]">{greeting}, ready for a tactical masterclass?</p>
          </div>
        </div>
        <ThemeSwitcher />
      </div>
    </header>
  );
};