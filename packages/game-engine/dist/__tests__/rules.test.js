import { describe, it, expect } from 'vitest';
import { canDefend, canAttackAppend } from '../rules.js';
describe('Oyun Kuralları', () => {
    const spade6 = { id: 'S-6', suit: 'S', rank: '6' };
    const spade7 = { id: 'S-7', suit: 'S', rank: '7' };
    const heart6 = { id: 'H-6', suit: 'H', rank: '6' };
    const heart7 = { id: 'H-7', suit: 'H', rank: '7' };
    const trumpSuit = 'H';
    describe('canDefend', () => {
        it('aynı renkten daha yüksek kart ile savunma', () => {
            const result = canDefend(spade6, spade7, trumpSuit);
            expect(result.isValid).toBe(true);
        });
        it('aynı renkten daha düşük kart ile savunma - başarısız', () => {
            const result = canDefend(spade7, spade6, trumpSuit);
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('yüksek');
        });
        it('koz olmayan saldırıya koz ile savunma', () => {
            const result = canDefend(spade6, heart6, trumpSuit);
            expect(result.isValid).toBe(true);
        });
        it('koz saldırısına koz olmayan ile savunma - başarısız', () => {
            const result = canDefend(heart6, spade6, trumpSuit);
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('koz');
        });
        it('koz vs koz - daha yüksek koz gerekli', () => {
            const result = canDefend(heart6, heart7, trumpSuit);
            expect(result.isValid).toBe(true);
        });
        it('farklı renk, koz olmayan - başarısız', () => {
            const diamond6 = { id: 'D-6', suit: 'D', rank: '6' };
            const result = canDefend(spade6, diamond6, trumpSuit);
            expect(result.isValid).toBe(false);
        });
    });
    describe('canAttackAppend', () => {
        it('ilk saldırı - geçerli', () => {
            const result = canAttackAppend([], [spade6], 6);
            expect(result.isValid).toBe(true);
        });
        it('aynı değerde kart ekleme - geçerli', () => {
            const existing = [spade6];
            const newCards = [heart6];
            const result = canAttackAppend(existing, newCards, 6);
            expect(result.isValid).toBe(true);
        });
        it('farklı değerde kart ekleme - başarısız', () => {
            const existing = [spade6];
            const newCards = [spade7];
            const result = canAttackAppend(existing, newCards, 6);
            expect(result.isValid).toBe(false);
        });
        it('savunanın el kartı sayısını aşma - başarısız', () => {
            const existing = [spade6, heart6];
            const diamond6 = { id: 'D-6', suit: 'D', rank: '6' };
            const newCards = [diamond6];
            const result = canAttackAppend(existing, newCards, 2);
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('aşamazsınız');
        });
        it('karışık değerde yeni kartlar - başarısız', () => {
            const newCards = [spade6, spade7];
            const result = canAttackAppend([], newCards, 6);
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('aynı değerde');
        });
    });
});
