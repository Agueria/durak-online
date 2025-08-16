
import { Card } from './Card';
import { useGameStore, useSelectedCards } from '../store/useGameStore';
import type { Card as CardType } from '@durak/shared';

interface HandProps {
  cards: CardType[];
  canPlay?: boolean;
}

export function Hand({ cards, canPlay = true }: HandProps) {
  const selectedCards = useSelectedCards();
  const { selectCard, deselectCard } = useGameStore();

  const handleCardClick = (card: CardType) => {
    if (!canPlay) return;

    const isSelected = selectedCards.some(c => c.id === card.id);
    
    if (isSelected) {
      deselectCard(card);
    } else {
      selectCard(card);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-400">
        Elinizde kart yok
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center p-4">
      {cards.map((card, index) => {
        const isSelected = selectedCards.some(c => c.id === card.id);
        
        return (
          <Card
            key={card.id}
            card={card}
            isSelected={isSelected}
            isDisabled={!canPlay}
            onClick={handleCardClick}
            className={`
              transition-all duration-200
              ${index > 0 ? '-ml-8' : ''}
              hover:z-10
              ${isSelected ? 'z-20' : ''}
            `}
          />
        );
      })}
    </div>
  );
}

interface OpponentHandProps {
  cardCount: number;
  playerName: string;
  isConnected: boolean;
}

export function OpponentHand({ cardCount, playerName, isConnected }: OpponentHandProps) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`text-sm font-medium ${isConnected ? 'text-white' : 'text-gray-400'}`}>
        {playerName} {!isConnected && '(Bağlantı Kesildi)'}
      </div>
      
      <div className="flex -space-x-6">
        {Array.from({ length: Math.min(cardCount, 8) }, (_, index) => (
          <div
            key={index}
            className="card bg-blue-800 transform rotate-12"
            style={{ 
              zIndex: cardCount - index,
              transform: `rotate(${(index - cardCount/2) * 5}deg)`
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-xs font-bold">?</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-xs text-gray-400">
        {cardCount} kart
      </div>
    </div>
  );
}