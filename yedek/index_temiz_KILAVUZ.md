# index_temiz.html — ANA ŞABLON

**Amaç:** Ana `index.html`'i (7980 satır) düzenli, bölümlenmiş bir yapıyla yeniden üretmek.
Her bölümün başında/sonunda net bir **şerit** (açıklama bloğu) var — böylece bir yeri
düzeltirken başka yer bozulmaz.

---

## Dosya yapısı

| Sıra | Şerit | Ne var |
|------|-------|--------|
| — | ÜST KURAL | Her agent'ın okuması gereken 5 maddelik veri kuralı |
| 0 | BELGE BAŞI | DOCTYPE, meta, manifest, simgeler |
| 0.2 | HARİCİ KÜTÜPHANELER | pdf.js, xlsx |
| 1 | ANA CSS | **Tek** stil bloğu (eskiden 3 ayrı blok + kırık yorum vardı) |
| 2 | GÖVDE PANELLERİ | P1–P9 yer tutucu şeritleri |
| 3 | JAVASCRIPT | JS-0 … JS-6 sıralı bloklar |

### Gövde panelleri (yer tutucu → doldurulacak)

| Etiket | Panel | Eski satır |
|--------|-------|-----------|
| P1 | Üst başlık + görsel alanı (+ namaz vakti kutusu) | 698-756 |
| P2 | PDF okuyucu modal (gizli) | 757-795 |
| P3 | Giriş paneli | 796-866 |
| P4 | Grup takip paneli | 867-875 |
| P5 | Bireysel takip paneli + toplu hisse atama | 876-911 |
| P6 | Yönetici paneli (JS ile dolar) | 912-919 |
| P7 | Eser (kitap) listesi | 920-921 |
| P8 | Zikirmatik paneli | 922-1004 |
| P9 | Alt modallar + toast | 1005-1082 |

### JavaScript blokları (yerleşik)

| Etiket | İçerik | Boyut |
|--------|--------|-------|
| JS-0 | Üst başlık JS — `toggleAppFullscreen()` | 16 satır |
| JS-1 | Namaz vakitleri — `fetchPrayerTimes()` | 43 satır |
| JS-2 | Zikirmatik JS (sayaç, ses, tur, hedef) | 933 satır |
| JS-3 | **Ana uygulama JS** (giriş, yönetim, eserler, analiz, okuyucu, ayraç, derleme) | 5.166 satır |
| JS-4 | Service worker kaydı | 7 satır |
| JS-5 | Kılavuz popup (HTML + JS) | 111 satır |
| JS-6 | Panel yardım popup JS + paylaş menüsü mantığı | 110 satır |

---

## Temizlenen ölü kod

Kaynak `index.html`'de bulunan ve **bu şablonda silinen** bloklar:

1. **Boş Supabase şeritleri (v3–v6)** — eski satır 7186–7237.
   İçlerinde yalnızca yorum vardı, hiç kod yoktu. Yalnızca **çalışan v7** bırakıldı.
2. **2 adet boş `<script></script>`** — eski satır 7186–7189.
3. **Kırık HTML yorumu** — eski satır 630: `<!-- ===================== `
   (kapanmamış), hemen ardından gelen `<style>` bloğunu yutuyordu.
4. **Yorum içinde kalan `<style>` / `</head>` metinleri** — eski satır 656:
   `</head> / <body> BASLANGICI ===================== -->` — HTML yorumunun
   içinde kalmış, tarayıcıda düz metin olarak görünme riski taşıyordu.
5. **3 ayrı `<style>` bloğu → 1 blok.** Metin seçimi ve paylaş menüsü stilleri
   ana CSS bloğunun içine taşındı.

---

## Doğrulama sonuçları

- Etiket dengesi: `div` 93/93 · `script` 16/16 · `body` · `head` · `html` — **dengeli**
- JS sözdizimi: `node --check` → **8/8 blok geçerli**
- Kimlik (id) envanteri: kaynakta 191 benzersiz id → şablonda 83.
  Eksik 108 id, yer tutucuya alınan panellerin (P1–P9) içindeki öğeler.
  Paneller dolduruldukça bu sayı kapanacak.

---

## Sıradaki adım

Panel panel doldurma — **P1'den başlayarak**. Her panel için:
1. Kaynak index.html'deki ilgili satır aralığı şablona taşınır,
2. İçindeki her `id` korunur (JS bunlara bağlı),
3. Taşındıktan sonra etiket dengesi + JS sözdizimi yeniden doğrulanır.
