
import type { Suit } from '@durak/shared';

interface TrumpBadgeProps {
  trumpSuit: Suit;
  className?: string;
}

const SUIT_SYMBOLS = {
  'S': '♠', // Spades - Maça
  'H': '♥', // Hearts - Kupa  
  'D': '♦', // Diamonds - Karo
  'C': '♣'  // Clubs - Sinek
};

const SUIT_NAMES = {
  'S': 'Maça',
  'H': 'Kupa',
  'D': 'Karo', 
  'C': 'Sinek'
};

export function TrumpBadge({ trumpSuit, className = '' }: TrumpBadgeProps) {
  const isRed = trumpSuit === 'H' || trumpSuit === 'D';
  
  return (
    <div className={`trump-badge ${className}`}>
      <div className="flex items-center space-x-2">
        <span className={`text-2xl ${isRed ? 'text-red-600' : 'text-black'}`}>
          {SUIT_SYMBOLS[trumpSuit]}
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-bold">KOZ</span>
          <span className="text-xs">{SUIT_NAMES[trumpSuit]}</span>
        </div>
      </div>
    </div>
  );
}

interface TrumpCardProps {
  trumpSuit: Suit;
  isVisible?: boolean;
}

export function TrumpCard({ trumpSuit, isVisible = true }: TrumpCardProps) {
  if (!isVisible) {
    return null;
  }

  const isRed = trumpSuit === 'H' || trumpSuit === 'D';
  
  return (
    <div className="relative">
      <div className="card bg-white transform rotate-90">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-4xl ${isRed ? 'text-red-600' : 'text-black'}`}>
            {SUIT_SYMBOLS[trumpSuit]}
          </span>
        </div>
      </div>
      
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="trump-badge text-xs px-2 py-1">
          KOZ
        </div>
      </div>
    </div>
  );
}