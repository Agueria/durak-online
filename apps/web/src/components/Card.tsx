
import type { Card as CardType } from '@durak/shared';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: (card: CardType) => void;
  className?: string;
}

const SUIT_SYMBOLS = {
  'S': '♠', // Spades - Maça
  'H': '♥', // Hearts - Kupa  
  'D': '♦', // Diamonds - Karo
  'C': '♣'  // Clubs - Sinek
};

const RANK_DISPLAY = {
  '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
  'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A'
};

export function Card({ card, isSelected, isDisabled, onClick, className = '' }: CardProps) {
  const isRed = card.suit === 'H' || card.suit === 'D';
  const suitColor = isRed ? 'suit-red' : 'suit-black';
  
  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick(card);
    }
  };

  return (
    <div
      className={`
        card
        ${isSelected ? 'selected' : ''}
        ${isDisabled ? 'disabled' : ''}
        ${className}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-label={`${RANK_DISPLAY[card.rank]} ${SUIT_SYMBOLS[card.suit]}`}
    >
      {/* Sol üst köşe */}
      <div className={`card-suit ${suitColor}`}>
        {SUIT_SYMBOLS[card.suit]}
      </div>
      
      {/* Merkez */}
      <div className={`card-center ${suitColor}`}>
        {RANK_DISPLAY[card.rank]}
      </div>
      
      {/* Sağ alt köşe (ters) */}
      <div className={`card-rank ${suitColor} transform rotate-180`}>
        {SUIT_SYMBOLS[card.suit]}
      </div>
    </div>
  );
}

interface CardBackProps {
  className?: string;
}

export function CardBack({ className = '' }: CardBackProps) {
  return (
    <div className={`card bg-blue-800 ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white text-xs font-bold">DURAK</div>
      </div>
    </div>
  );
}