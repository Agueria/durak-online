
import { Card } from './Card';
import type { TablePair } from '@durak/shared';

interface TableProps {
  pairs: TablePair[];
  onAttackCardClick?: (index: number) => void;
  canDefend?: boolean;
}

export function Table({ pairs, onAttackCardClick, canDefend = false }: TableProps) {
  if (pairs.length === 0) {
    return (
      <div className="table-surface min-h-48 flex items-center justify-center">
        <div className="text-white/60 text-lg">
          Oyun başlamak için kartları masaya atın
        </div>
      </div>
    );
  }

  return (
    <div className="table-surface min-h-48">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {pairs.map((pair, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            {/* Saldırı kartı */}
            <div className="relative">
              <Card
                card={pair.attack}
                onClick={canDefend && !pair.defense ? () => onAttackCardClick?.(index) : undefined}
                className={canDefend && !pair.defense ? 'ring-2 ring-yellow-400 cursor-pointer' : ''}
              />
              {canDefend && !pair.defense && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-1 rounded">
                  Savun
                </div>
              )}
            </div>
            
            {/* Savunma kartı */}
            {pair.defense ? (
              <div className="relative -mt-12 ml-8">
                <Card card={pair.defense} />
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded">
                  ✓
                </div>
              </div>
            ) : (
              <div className="h-24 w-16 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">?</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Masa bilgileri */}
      <div className="mt-4 text-center text-white/80 text-sm">
        {pairs.length} saldırı • {pairs.filter(p => p.defense).length} savunma
      </div>
    </div>
  );
}

interface TableStatsProps {
  deckCount: number;
  discardCount: number;
}

export function TableStats({ deckCount, discardCount }: TableStatsProps) {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="card bg-blue-800 w-12 h-16 flex items-center justify-center">
          <span className="text-white text-xs font-bold">DESTE</span>
        </div>
        <span className="text-white font-medium">{deckCount}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-white font-medium">{discardCount}</span>
        <div className="card bg-gray-600 w-12 h-16 flex items-center justify-center">
          <span className="text-white text-xs font-bold">ATIK</span>
        </div>
      </div>
    </div>
  );
}