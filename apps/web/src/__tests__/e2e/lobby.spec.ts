import { test, expect } from '@playwright/test';

test.describe('Lobby Flow', () => {
  test('kullanıcı giriş yapıp lobby\'ye ulaşabilir', async ({ page }) => {
    await page.goto('/');

    // Giriş formu görünür olmalı
    await expect(page.locator('h2')).toContainText('Durak Online\'a Hoş Geldiniz');

    // Nickname gir
    await page.fill('input[placeholder="Nickname girin..."]', 'TestOyuncu');
    
    // Oyuna katıl
    await page.click('button[type="submit"]');

    // Lobby'ye yönlendirilmeli
    await expect(page.locator('h1')).toContainText('Durak Online');
    await expect(page.locator('h2')).toContainText('Aktif Odalar');
  });

  test('oda oluşturma akışı', async ({ page }) => {
    await page.goto('/');

    // Giriş yap
    await page.fill('input[placeholder="Nickname girin..."]', 'OdaOluşturan');
    await page.click('button[type="submit"]');

    // Lobby'de yeni oda butonuna tıkla
    await page.click('button:has-text("+ Yeni Oda")');

    // Oda oluşturma formu görünmeli
    await expect(page.locator('h3')).toContainText('Yeni Oda Oluştur');

    // Oda bilgilerini doldur
    await page.fill('input[placeholder="Oda adı girin..."]', 'Test Odası');
    await page.selectOption('select', '2');

    // Oda oluştur
    await page.click('button:has-text("Oda Oluştur")');

    // Oda sayfasına yönlendirilmeli
    await expect(page.locator('h1')).toContainText('Oda:');
    await expect(page.locator('text=OdaOluşturan')).toBeVisible();
  });

  test('iki oyuncu ile oyun başlatma', async ({ page, context }) => {
    // İlk oyuncu
    await page.goto('/');
    await page.fill('input[placeholder="Nickname girin..."]', 'Oyuncu1');
    await page.click('button[type="submit"]');

    // Oda oluştur
    await page.click('button:has-text("+ Yeni Oda")');
    await page.fill('input[placeholder="Oda adı girin..."]', 'Test Oyunu');
    await page.click('button:has-text("Oda Oluştur")');

    // URL'yi al
    const roomUrl = page.url();

    // İkinci oyuncu için yeni sayfa
    const page2 = await context.newPage();
    await page2.goto('/');
    await page2.fill('input[placeholder="Nickname girin..."]', 'Oyuncu2');
    await page2.click('button[type="submit"]');

    // Aynı odaya katıl (URL'den room ID'yi çıkar)
    const roomId = roomUrl.split('/').pop();
    await page2.goto(`/room/${roomId}`);

    // Her iki sayfada da oyuncular görünmeli
    await expect(page.locator('text=Oyuncu1')).toBeVisible();
    await expect(page.locator('text=Oyuncu2')).toBeVisible();
    await expect(page2.locator('text=Oyuncu1')).toBeVisible();
    await expect(page2.locator('text=Oyuncu2')).toBeVisible();

    // Oyunu başlat
    await page.click('button:has-text("Oyunu Başlat")');

    // Oyun başlamalı - masa görünmeli
    await expect(page.locator('.table-surface')).toBeVisible();
    await expect(page2.locator('.table-surface')).toBeVisible();

    // Koz rozeti görünmeli
    await expect(page.locator('.trump-badge')).toBeVisible();
    await expect(page2.locator('.trump-badge')).toBeVisible();

    // Oyuncuların elinde 6 kart olmalı
    await expect(page.locator('.card')).toHaveCount(6);
    await expect(page2.locator('.card')).toHaveCount(6);
  });
});