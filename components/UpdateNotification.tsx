
import React, { useEffect } from 'react';

const newFeatures = [
    {
        title: "AI Match Predictor",
        description: "Get an AI-powered prediction for any match by describing your team and the opponent.",
        icon: "🔮"
    },
    {
        title: "Voice-Controlled Input",
        description: "Dictate your team description in the AI Assistant using your microphone.",
        icon: "🎤"
    },
    {
        title: "Revamped Tactics Library",
        description: "Toggle between card and compact list views, see your recent searches, and share tactics easily.",
        icon: "📚"
    },
    {
        title: "Achievements & Badges",
        description: "Earn badges for reaching tactical milestones and track your progress.",
        icon: "🏆"
    },
    {
        title: "Smarter UI/UX",
        description: "Enjoy a dynamic welcome message, helpful tooltips, and haptic feedback on mobile.",
        icon: "✨"
    }
];

export const UpdateNotification: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800/90 rounded-lg shadow-xl p-6 w-full max-w-md text-white border border-gray-700" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-[var(--color-text-accent)] mb-4">What's New in the App?</h2>
        <p className="text-gray-400 mb-4">We've added a ton of new features to help you dominate the pitch!</p>
        <div className="space-y-3">
            {newFeatures.map(feature => (
                <div key={feature.title} className="flex items-start">
                    <span className="text-2xl mr-3">{feature.icon}</span>
                    <div>
                        <h3 className="font-semibold text-gray-200">{feature.title}</h3>
                        <p className="text-sm text-gray-400">{feature.description}</p>
                    </div>
                </div>
            ))}
        </div>
        <div className="mt-6 text-center">
            <button onClick={() => { onClose(); navigator.vibrate?.(20); }} className="bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white font-bold py-2 px-6 rounded-md">
                Got it!
            </button>
        </div>
      </div>
    </div>
  );
};
