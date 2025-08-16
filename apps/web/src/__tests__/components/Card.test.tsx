import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card, CardBack } from '../../components/Card';
import type { Card as CardType } from '@durak/shared';

describe('Card Component', () => {
  const mockCard: CardType = {
    id: 'S-A',
    suit: 'S',
    rank: 'A'
  };

  it('kartı doğru şekilde render eder', () => {
    render(<Card card={mockCard} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText('A ♠')).toBeInTheDocument();
  });

  it('kırmızı kartları doğru renkte gösterir', () => {
    const redCard: CardType = { id: 'H-K', suit: 'H', rank: 'K' };
    render(<Card card={redCard} />);
    
    const suitElements = screen.getAllByText('♥');
    suitElements.forEach(element => {
      expect(element).toHaveClass('suit-red');
    });
  });

  it('siyah kartları doğru renkte gösterir', () => {
    const blackCard: CardType = { id: 'S-Q', suit: 'S', rank: 'Q' };
    render(<Card card={blackCard} />);
    
    const suitElements = screen.getAllByText('♠');
    suitElements.forEach(element => {
      expect(element).toHaveClass('suit-black');
    });
  });

  it('seçili durumu doğru şekilde gösterir', () => {
    render(<Card card={mockCard} isSelected={true} />);
    
    const cardElement = screen.getByRole('button');
    expect(cardElement).toHaveClass('selected');
  });

  it('devre dışı durumu doğru şekilde gösterir', () => {
    render(<Card card={mockCard} isDisabled={true} />);
    
    const cardElement = screen.getByRole('button');
    expect(cardElement).toHaveClass('disabled');
    expect(cardElement).toHaveAttribute('tabIndex', '-1');
  });

  it('tıklama olayını doğru şekilde işler', () => {
    const mockOnClick = vi.fn();
    render(<Card card={mockCard} onClick={mockOnClick} />);
    
    const cardElement = screen.getByRole('button');
    fireEvent.click(cardElement);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockCard);
  });

  it('devre dışıyken tıklama olayını işlemez', () => {
    const mockOnClick = vi.fn();
    render(<Card card={mockCard} isDisabled={true} onClick={mockOnClick} />);
    
    const cardElement = screen.getByRole('button');
    fireEvent.click(cardElement);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('özel CSS sınıfını uygular', () => {
    render(<Card card={mockCard} className="custom-class" />);
    
    const cardElement = screen.getByRole('button');
    expect(cardElement).toHaveClass('custom-class');
  });

  describe('Kart Sembolleri', () => {
    it('maça sembolünü doğru gösterir', () => {
      const spadeCard: CardType = { id: 'S-K', suit: 'S', rank: 'K' };
      render(<Card card={spadeCard} />);
      expect(screen.getAllByText('♠')).toHaveLength(2);
    });

    it('kupa sembolünü doğru gösterir', () => {
      const heartCard: CardType = { id: 'H-Q', suit: 'H', rank: 'Q' };
      render(<Card card={heartCard} />);
      expect(screen.getAllByText('♥')).toHaveLength(2);
    });

    it('karo sembolünü doğru gösterir', () => {
      const diamondCard: CardType = { id: 'D-J', suit: 'D', rank: 'J' };
      render(<Card card={diamondCard} />);
      expect(screen.getAllByText('♦')).toHaveLength(2);
    });

    it('sinek sembolünü doğru gösterir', () => {
      const clubCard: CardType = { id: 'C-10', suit: 'C', rank: '10' };
      render(<Card card={clubCard} />);
      expect(screen.getAllByText('♣')).toHaveLength(2);
    });
  });

  describe('Kart Değerleri', () => {
    it('sayı kartlarını doğru gösterir', () => {
      const numberCard: CardType = { id: 'H-7', suit: 'H', rank: '7' };
      render(<Card card={numberCard} />);
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('resim kartlarını doğru gösterir', () => {
      const faceCard: CardType = { id: 'S-J', suit: 'S', rank: 'J' };
      render(<Card card={faceCard} />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('as kartını doğru gösterir', () => {
      const aceCard: CardType = { id: 'D-A', suit: 'D', rank: 'A' };
      render(<Card card={aceCard} />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });
});

describe('CardBack Component', () => {
  it('kart arkasını doğru şekilde render eder', () => {
    render(<CardBack />);
    
    expect(screen.getByText('DURAK')).toBeInTheDocument();
  });

  it('özel CSS sınıfını uygular', () => {
    render(<CardBack className="custom-back" />);
    
    const cardElement = screen.getByText('DURAK').closest('.card');
    expect(cardElement).toHaveClass('custom-back');
  });

  it('doğru stil sınıflarına sahip', () => {
    render(<CardBack />);
    
    const cardElement = screen.getByText('DURAK').closest('.card');
    expect(cardElement).toHaveClass('card', 'bg-blue-800');
  });
});