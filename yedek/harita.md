# 🗺️ HARİTA — Ortak Hatim ve Dua Takip Sistemi

> **Dosya:** `index.html`
> **Repo:** `mckurdi27/Wir-lesen-zusammen-`
> **Site:** https://mckurdi27.github.io/Wir-lesen-zusammen-/
> **Amaç:** Kodda aradığını Ctrl+F ile anında bulmak.

---

## 📌 İçindekiler

- [Sayfa Görünüm Sırası](#-sayfa-görünüm-sırası)
- [Dosyanın Genel Yapısı](#-dosyanın-genel-yapısı)
- [Panel 1 — Resimli Üst Başlık](#-panel-1--resimli-üst-başlık)
- [Panel 2 — Ayet / Hadis](#-panel-2--ayet--hadis-paneli)
- [Panel 3 — Giriş Paneli](#-panel-3--giriş-paneli)
- [Panel 3c — Üye Kartı](#-panel-3c--üye-kartı-bireysel-takip)
- [Panel 3d — Grup Kartı](#-panel-3d--grup-kartı)
- [Panel 4 — Admin Panel](#-panel-4--admin-panel)
- [Panel 5 — Eserler](#-panel-5--eserler-kitap-listesi)
- [Panel 6 — Yöneticiye Mesaj](#-panel-6--yöneticiye-mesaj)
- [Panel 7 — Zikirmatik](#-panel-7--zikirmatik)
- [JS Modülleri](#-js-modülleri--fonksiyon-haritası)
- [Global Değişkenler](#️-global-değişkenler)
- [Supabase Tabloları](#-supabase-tabloları)
- [Veri Akışı](#-veri-akışı)
- [Hızlı Arama Rehberi](#-hızlı-arama-rehberi)

---

## 🎬 Sayfa Görünüm Sırası

Kullanıcının gördüğü sıra:

1. **Resimli Panel** (Nebevi / Kabe / Aksa)
2. **Ayet / Hadis Paneli**
3. **Giriş Paneli** (Tek Kart / Grup Kart)
4. **Admin Panel** (Yönetici / Eser / Toplu / Üye Bilgi)
5. **Eserler Paneli**
6. **Yöneticiye Mesaj**
7. **Zikirmatik**

> ⚠️ **Dikkat:** Bu sıra HTML'de değil, büyük ölçüde **JS tarafından** belirlenir:
> - Zikirmatik `setInterval(place, 1500)` ile **sürekli sona** taşınır.
> - Yönetici mesaj paneli `document.body.appendChild(msgContainer)` ile **en alta** atılır.
> - Admin paneli ve eserler JS ile doldurulur (`#admin-bottom-section`, `#books-grid`).

---

## 📂 Dosyanın Genel Yapısı

| Bölüm | İçerik | Yaklaşık Satır |
|-------|--------|----------------|
| **A** | Ana kural yorumu (agent talimatı) | 1–30 |
| **B** | `<head>` — meta, manifest, kütüphaneler | 31–50 |
| **C** | Ana CSS (`<style>`) | 51–760 |
| **D** | Paylaş dropdown CSS | 761–790 |
| **E** | `<body>` başlangıcı | 791 |
| **F** | HTML panelleri (statik) | 792–1050 |
| **G** | Zikirmatik JS | 1051–1700 |
| **H** | Ana uygulama JS | 1701–3600 |
| **I** | Supabase köprü JS (v7) | 3601–3900 |
| **J** | Service worker + kılavuz + paylaş | 3901–son |

---

## 🖼️ Panel 1 — Resimli Üst Başlık

- **HTML ID:** `#main-title-ornate-section`
- **Konum:** Body başı (~satır 800)
- **JS:** inline `<script>` → `toggleAppFullscreen()`, `syncAppFsLabel()`

### İçindekiler
- `.hdr-left` → Nebevi.jpg (sol)
- `.hdr-mid` → Başlık + alt başlık
  - `#citySelect` → Şehir seçici (12 şehir)
  - GPS butonu → `fetchPrayerTimesByGPS()`
  - `#prayerTimesResult` → Vakitler
- `.hdr-right` → Kabe.jpg (sağ)
- `.hdr-aksa` → Aksa.jpg (mobilde ortada)

### JS Fonksiyonları
| Fonksiyon | Görev |
|-----------|-------|
| `fetchPrayerTimes()` | Şehre göre vakit |
| `fetchPrayerTimesByGPS()` | Konuma göre vakit |
| `toggleAppFullscreen()` | Tam ekran |
| `syncAppFsLabel()` | Buton etiketi |

---

## 🕌 Panel 2 — Ayet / Hadis Paneli

- **HTML ID:** `#daily-inspiration-section` (JS ile **oluşturulur**)
- **Konum:** `renderDailyInspiration()` → `main-title` sonrasına `insertBefore` ile ekler

### JS Fonksiyonları
| Fonksiyon | Görev |
|-----------|-------|
| `bugunkuHicriTarihiAl()` | Hicri tarihi hesapla (Intl API) |
| `fetchHijriMonthData(ayKodu)` | `json/03-rebiülevvel.js` gibi dosyayı çek |
| `getHijriInspiration()` | Ayet + Hadis metnini hazırla |
| `renderDailyInspiration()` | HTML'i oluştur ve ekle |

- **Cache:** `monthlyInspirationCache`
- **Dosya eşlemesi:** `fileMap` + `varMap` (12 hicri ay)

---

## 🔑 Panel 3 — Giriş Paneli

- **HTML ID:** `#simple-login-panel`
- **Konum:** ~satır 880

### 3a — Giriş Formu
- `#login-form-area`
  - `#login-user-name` + `#user-name-list` datalist
  - `#login-user-password`
  - `#login-user-type` (gizli select) — `bireysel` / `grup`
  - `#login-type-tek` — Tek butonu
  - `#login-type-grup` — Grup butonu
  - `#login-group-name` + `#login-group-dd` dropdown
  - `#login-group-password`
  - `#login-join-btn` — Katıl
  - `#login-admin-lock` — 🔐 Yönetici
  - `#login-remember` — Beni hatırla (JS ekler)

### 3b — Üye Aktif Alanı
- `#user-active-area`
  - `#user-icon` — 👤 / 👥
  - `#active-user-name` — üye adı
  - `#active-user-group` — grup adı
  - `#group-members-line` — gruptakiler listesi
  - `#logout-btn` — Çıkış

### JS Fonksiyonları
| Fonksiyon | Görev |
|-----------|-------|
| `updateUserInterface()` | Giriş/girişsiz arayüz |
| `window._guncelleTip()` | Tek/Grup geçişi |
| `getAllGroupKeys()` | Tüm grup anahtarları |
| `getAllGroupKeysForAdmin()` | Admin için gruplar |
| `updateAutocompleteLists()` | Datalist doldur |
| `window._buildGrpDd()` | Grup dropdown çiz |
| `window._refreshGrpDd()` | Dropdown yenile |
| `window._sbJoinGroupMember()` | Supabase'e üye ekle |
| `window._sbUpsertIndividual()` | Bireysel üye Supabase |

---

## 👤 Panel 3c — Üye Kartı (Bireysel Takip)

- **HTML ID:** `#bireysel-takip-panel`
- **Konum:** ~satır 940
- **Görünürlük:** Sadece giriş yapılmışsa + bireysel

### İçindekiler
- `#bt-member-name` + `#bt-change-name`
- `#bt-member-password` + `#bt-password-toggle` + `#bt-change-password`
- `#bt-member-region` + `#bt-change-region`
- `#bt-member-city` + `#bt-change-city`
- `#bt-member-books` → Hisse tablosu

### JS Fonksiyonu
- `renderBireyselTakipPanel()`

### Supabase
- `window._sbUpdateRegionCity`
- `window._sbUpdatePassword`
- `window._sbUpdateName`
- `window._sbRenameOwner`

---

## 👥 Panel 3d — Grup Kartı

- **HTML ID:** `#grup-takip-panel`
- **Konum:** ~satır 920
- **Görünürlük:** Grup seçili + üye **seçilmemiş**

### İçindekiler
- `#gt-group-name` → Grup adı
- `#gt-content` → Her üye için tablo

### JS Fonksiyonu
- `renderGrupTakipPanel()`
- `window._grpGizli()`
- `window.infoGizleToggle()`

---

## 🛠️ Panel 4 — Admin Panel

- **HTML ID:** `#admin-bottom-section` (JS doldurur)
- **Konum:** ~satır 950 (boş div)
- **JS Fonksiyonu:** `renderAdminSectionAtBottom()`

### 4a — Yönetici Başlığı
- `#admin-remember` → Beni hatırla
- `#admin-open-kontrol` → 📋 Kontrol sayfası
- `#admin-open-detailed-analysis` → 📊 Analiz

### 4b — 📁 Grup ve Üye Yönetimi
- `#admin-group-select` → Ana select
- `#admin-add-group` → Yeni grup
- `#admin-edit-group` → Grup adı değiştir
- `#admin-delete-group` → Grup sil
- `#admin-set-password` → Şifre belirle
- `#admin-add-member` → Üye ekle
- `.admin-edit-member` → Üye düzenle
- `.admin-remove-member` → Üye sil
- `.admin-remove-bireysel` → Bireysel üye sil

| Fonksiyon | Görev |
|-----------|-------|
| `admin-add-group` | `groups` insert |
| `admin-edit-group` | `groups` update + `members` taşı |
| `admin-delete-group` | `groups` delete |
| `admin-set-password` | `groups.password` patch |
| `admin-add-member` | `members` insert |
| `.admin-edit-member` | `_sbUpdateName` + `_sbUpdatePassword` |
| `.admin-remove-member` | `members` delete (pasif) |
| `.admin-remove-bireysel` | Bireysel üye delete |

### 4c — 📚 Eser Yönetimi
- `#admin-add-book-btn` → Yeni eser
- `.admin-edit-book` → Eser düzenle
- `.admin-remove-book` → Eser sil
- `#book-edit-modal` → Modal
  - `#book-modal-id`, `#book-modal-name`, `#book-modal-sort`
  - `#book-modal-units`, `#book-modal-type`, `#book-modal-ppu`
  - `#book-modal-start`, `#book-modal-total`
  - `#book-modal-pdf`
  - `#book-modal-table`
  - `#book-modal-save`, `#book-modal-cancel`

| Fonksiyon | Görev |
|-----------|-------|
| `window.openBookModal(editId)` | Modal aç |
| `_buildBookTable(units)` | Sayfa tablosu |
| `closeBookModal()` | Modal kapat |
| `#book-modal-save` | `books` + `settings` insert |
| `.admin-remove-book` | `shares` + `books` delete |

### 4d — 📥 Toplu Atama / Silme
- `#admin-bulk-target-select` → Hedef
- `#admin-bulk-book-checks` + `#bulk-check-all`
- `#bulk-mode-equal` → Eşit pay
- `#bulk-mode-individual` → Tek tek pay
- `#admin-bulk-assign-btn` → Atama
- `#admin-bulk-delete-btn` → Sil
- `#admin-bulk-reset-btn` → Sıfırla
- `#admin-bulk-view-btn` → Görüntüle
- `#admin-bulk-view-panel`
  - `#bv-member`, `#bv-book`, `#bv-mode`
  - `#bv-units-wrap`
  - `#bv-save`, `#bv-clear-sel`, `#bv-clear-owner`

| Fonksiyon | Görev |
|-----------|-------|
| `bulkResolveData(target)` | Hedef çöz |
| `bulkSave(data)` | `replaceShares` |
| `bulkDeleteSharesSB()` | Supabase delete |
| `bulkBookIds()` | Seçili eser ID'leri |
| `#admin-bulk-assign-btn` | Atama yap |
| `#admin-bulk-delete-btn` | Sil |
| `#admin-bulk-reset-btn` | Sıfırla |
| `#admin-bulk-view-btn` | Görüntüle |
| `renderUnits()` | Birim listesi |
| `#bv-save` | Supabase'e kaydet |

### 4e — 🗂️ Üye ve Grup Bilgi Paneli
- `#info-filter-input` → Arama
- `#info-table` → Tablo
- `window.infoSortTable(col)` → Sütun sıralama
- `window.infoGizleToggle(gk, checked)` → Gizle

**Global:**
- `window._infoRowsCache`
- `window._infoRowsSortCol`
- `window._infoRowsSortAsc`
- `window._infoRowsFilter`

### 4f — 📨 Gelen Mesajlar
- `#gelen-msg-yenile` → Yenile
- `#gelen-msg-sayi` → Sayı
- `#gelen-msg-liste` → Liste

| Fonksiyon | Görev |
|-----------|-------|
| `_gelenMsgTarih(v)` | Tarih formatla |
| `gelenMesajlariYukle()` | `messages` select |
| `gelenMesajlariCiz()` | Listeyi çiz |
| `.gmsg-cevap-ac` | Cevap alanı aç |
| `.gmsg-cevap-gonder` | `messages.reply` patch |
| `.gmsg-oku` | Okundu işaretle |
| `.gmsg-sil` | Mesaj sil |

**Global:** `_gelenMsgData`, `_gelenMsgYukleniyor`

---

## 📚 Panel 5 — Eserler (Kitap Listesi)

- **HTML ID:** `#books-grid` (JS doldurur)
- **Konum:** ~satır 950
- **JS Fonksiyonu:** `renderBooks()`

### İçindekiler (her eser)
- `.book-card`
  - `.book-header`
    - `.toc-book-btn` → İçindekiler
    - `.pdf-book-btn` → PDF
    - `▲/▼` → Aç/kapa
  - `.book-body`
    - `.mode-btn` → Mod butonları (20/10/5/1)
    - `.book-body-scroller`
    - `.pdf-page-btn` → PDF
    - `.take-range-btn` → Hisse al
    - `.read-range-btn` → Okundu
    - `.unread-range-btn` → Okunmadı
    - `.release-range-btn` → Vazgeç

### JS Fonksiyonları
| Fonksiyon | Görev |
|-----------|-------|
| `renderBooks()` | Ana render |
| `getRangeStatus(baseArray, start, end)` | Blok durumu |
| `getBookSortMap(group)` | Sıralama |
| `getBookSectionsMap(group)` | Bölümler |
| `createPageModes(totalPages)` | Sayfa modları |
| `createBabModes(totalBabs)` | Bab modları |
| `rebuildBookModesDefs()` | Modları yenile |

### Supabase
- `.take-range-btn` → `window.api('/shares?on_conflict=...')` POST
- `.read-range-btn` → `window._sbMarkRange()`
- `.unread-range-btn` → `window._sbMarkRange()`
- `.release-range-btn` → `window._sbReleaseRange()`
- `.toc-book-btn` → `getBookSectionsMap()`

### 📄 PDF Okuyucu (Modal)
- `#pdf-reader-modal`
- `#pdf-modal-title`, `#pdf-modal-page-info`
- `#pdf-rtl-btn`, `#pdf-fs-btn`
- `#pdf-canvas-container`, `#pdf-canvas`, `#pdf-flip-overlay`
- `#pdf-prev-btn`, `#pdf-page-input`, `#pdf-next-btn`
- `#pdf-fit-btn`, `#pdf-close-btn`
- `#pdf-loading`

| Fonksiyon | Görev |
|-----------|-------|
| `openPdfReader(bookId, pageNumber)` | PDF aç |
| `renderPdfPage(pageNum)` | Sayfa render |
| `toArabicNum(n)` | Arapça sayı |
| `playPageTurnSound()` | Sayfa sesi |
| `initPdfReaderEvents()` | Olayları bağla |

---

## 📢 Panel 6 — Yöneticiye Mesaj

- **HTML ID:** `#admin-message-section` (JS oluşturur, `document.body.appendChild` ile **en alta** ekler)
- **Konum:** `renderAdminSectionAtBottom()` içinde
- **JS Değişkeni:** `msgContainer`

### İçindekiler
- `#admin-msg-input` → Textarea
- `#send-site-msg-btn` → Siteye gönder
- `.paylas-dd[data-select="send-admin-msg-sel"]` → Mesajı paylaş
- `.paylas-dd[data-select="app-share-sel"]` → Uygulamayı paylaş
- `#mesajlarim-kutu`
  - `#mesajlarim-yenile`
  - `#mesajlarim-sayi`
  - `#mesajlarim-liste`

### JS Fonksiyonları
| Fonksiyon | Görev |
|-----------|-------|
| `#send-site-msg-btn` | `messages` insert |
| `mesajlarimiYukle()` | `messages` select (kendi) |
| `#send-admin-msg-sel` change | Paylaş |
| `#app-share-sel` change | Uygulamayı paylaş |

**Global:** `window._sbApi`, `window.api`

---

## 📿 Panel 7 — Zikirmatik

- **HTML ID:** `#zikirmatikSection`
- **Konum:** ~satır 985
- **Görünürlük:** `place()` ile **sürekli sona** taşınır (`setInterval(place, 1500)`)

### İçindekiler
- `.zk-head` → Başlık + `#zkAyarBtn` ⚙
- `#zkKaynak` → Kaynak select
- `#zkZikir` → Zikir select
- `#zkAyar` → Ayarlar paneli
  - `#zkYeni`, `#zkEkleBtn`, `#zkSilBtn`
  - `#zkSurekliSes`
  - `#zkKayitFiltre`
  - `#zkKayitGovde`
- `#zkAr` → Arapça
- `#zkOku` → Okunuş
- `#zkAnlam` → Anlam
- `#zkTavaf`
  - `#zkKabe` → Kabe ikonu
  - `#zkDots` → Hacı noktaları
  - `#zkCount` → Sayaç
  - `#zkSub` → Hedef
- `#zkTap` → Ana sayma butonu
- `.zk-actions`
  - `#zkUndoBtn`, `#zkTurResetBtn`, `#zkResetBtn`
  - `#zkVibBtn`, `#zkSesBtn`
  - `#zkSesMenu` → `.zk-sesopt` (hu, tespih, adım, kalp, yumuşak, Allah hu, sayfa, yerel)
  - `#zkSesDosya`
- `.zk-adet`
  - `#zkSayi`, `.zk-adetbtn` (7/11/33/66/99), `#zkAdetBos`
- `.zk-stats`
  - `#zkNo`, `#zkTur`, `#zkToplam`, `#zkGunluk`

### JS Fonksiyonları (IIFE içinde)
| Fonksiyon | Görev |
|-----------|-------|
| `zkDynamicListeler()` | Dinamik listeler |
| `zkKaynakAdlar(kaynak)` | Kaynak adları |
| `zkAktifAdlar()` | Aktif adlar |
| `zkVarsayilanHedef(z)` | Hedef |
| `zkTekilAd(ad)` | Ad tekilleştir |
| `zkEsmaUygula(d)` | Esma yükle |
| `zkZikirUygula(d)` | Zikir yükle |
| `zkKuranUygula(d)` | Kuran yükle |
| `zkRabbenaUygula(d)` | Rabbenâ yükle |
| `zkSecimDuzelt()` | Seçim düzelt |
| `zkDosyaUygula(dosya, d)` | Dosya uygula |
| `zkJsonListe()` | JSON listesi |
| `zkJsonDosyalari()` | JSON dosyaları |
| `zkKaynakMenuCiz()` | Kaynak menüsü |
| `zkYukle()` | Yükle |
| `zkKayit(z)` | Kayıt al |
| `zkAktif()` | Aktif kayıt |
| `tumZikirler()` | Tüm zikirler |
| `varsayilanMi(z)` | Varsayılan mı |
| `zkNumara(z)` | Numara |
| `siraNo(z)` | Sıra no |
| `beep()` | Ses çal |
| `sesIsit()` | Ses ısıt |
| `zkSesYolu()` | Ses yolu |
| `zkSesEtiket()` | Ses etiket |
| `zkSesYukle()` | Ses yükle |
| `zkSurekliDurdur()` | Sürekli durdur |
| `zkSurekliCal()` | Sürekli çal |
| `zkIkonBoyu(n)` | İkon boyu |
| `zkIkonSayisi()` | İkon sayısı |
| `zkHaciSvg(i)` | Hacı SVG |
| `cizTavaf()` | Tavaf çiz |
| `ciz()` | Ana çiz |
| `zkTarihSaat(iso)` | Tarih/saat |
| `zkKayitTablosu()` | Kayıt tablosu |
| `tik()` | Tik (say) |
| `place()` | Konumla |
| `init()` | Başlat |

**Global:** `window.zk = { init, place, open, close }`

---

## 🔌 JS Modülleri — Fonksiyon Haritası

### 📊 Analiz Paneli
| Fonksiyon | Görev |
|-----------|-------|
| `openDetailedAnalysisModal()` | Ana modal |
| `getGroupSelectHtml()` | Grup select |
| `getBookSelectHtml()` | Eser select |
| `getRegionSelectHtml()` | Bölge select |
| `getCitySelectHtml()` | Şehir select |
| `getMemberSelectHtml()` | Üye select |
| `getMemberDetailData()` | Üye detay |
| `renderTab1()` | Genel Özet |
| `renderTab2()` | Grup Sıralama |
| `renderTab3()` | Üye Analizi |
| `renderTab4()` | Eser Detay |
| `renderTab5()` | Okuma Günlüğü |
| `renderTab6()` | Hatim Sıralama |
| `updateAllTabs()` | Tüm sekmeleri yenile |
| `exportAnalysisToExcel()` | Excel çıktı |
| `_anlRenderBox()` | Checkbox kutusu |
| `_anlSync()` | Sync |
| `_anlRenderAll()` | Tümünü çiz |
| `_curGroupArr()` | Seçili gruplar |

### 🌐 Supabase Köprü (IIFE — en sonda)
| Fonksiyon | Görev |
|-----------|-------|
| `api(path, opts)` | REST istek |
| `enqueue(fn)` | Kuyruk |
| `ownersOf(g)` | Sahipler |
| `isIndividualGroup(g, key)` | Bireysel mi |
| `window._sbJoinGroupMember()` | Gruba katıl |
| `window._sbUpsertIndividual()` | Bireysel upsert |
| `replaceMembers()` | Üyeleri değiştir |
| `syncHatimToSB(key, g)` | Hatim yaz |
| `replaceShares(g, groupKey)` | Hisseleri değiştir |
| `pullAll()` | **Tüm veriyi çek** ⭐ |
| `window._sbMemberDetail()` | Üye detay |
| `window._sbUpdateRegionCity()` | Bölge/şehir |
| `window._sbUpdatePassword()` | Şifre |
| `window._sbUpdateName()` | Ad |
| `window._sbMarkRange()` | Aralık işaretle |
| `window._sbReleaseRange()` | Aralık bırak |
| `window._sbRenameOwner()` | Sahip adı |
| `refreshUI()` | Arayüz yenile |
| `doInit()` | Başlat |
| `localStorage.setItem` **override** | Cache + push engelle |

**Global:** `window.api`, `window._sbApi`, `window.rest`, `window.pullAll`, `window.refreshUI`, `window.syncHatimToSB`, `window._origSetItem`

---

## ⚙️ Global Değişkenler

| Değişken | Tip | Açıklama |
|----------|-----|----------|
| `currentGroup` | string | Aktif grup anahtarı |
| `isAdmin` | bool | Yönetici modu |
| `appData` | object | Grup verisi (cache) |
| `loggedInMember` | string | Giriş yapan üye |
| `loggedInMemberType` | string | `bireysel` / `grup` |
| `analysisSortKey` | string | Analiz sıralama |
| `analysisSortDir` | string | `az` / `za` |
| `activeAnalysisTab` | string | Aktif sekme |
| `analysisBooks` | array | Filtre eserleri |
| `selGroupsArr` | array | Seçili gruplar |
| `monthlyInspirationCache` | object | Ayet/hadis cache |
| `window.bookSectionPages` | object | Bölüm-sayfa haritası |
| `window.BOOK_META_SB` | object | Supabase eser meta |
| `BOOK_SORT_DEFAULTS` | object | Varsayılan sıra |
| `BOOK_SECTION_DEFAULTS` | object | Varsayılan bölümler |
| `defaultBooksTemplate` | array | Varsayılan 10 eser |
| `bookModesDefs` | object | Mod tanımları |
| `bookPdfMap` | object | PDF yolları |
| `ADMIN_PASSWORD` | string | `"1234"` |
| `window._infoRowsCache` | array | Bilgi paneli cache |
| `_gelenMsgData` | array | Gelen mesajlar |
| `_pulling`, `_myPush`, `_initDone` | bool | Kilit bayrakları |
| `_queue` | Promise | Yazma kuyruğu |
| `origSetItem` | function | Orijinal setItem |

---

## 🗄️ Supabase Tabloları

| Tablo | Kullanım |
|-------|----------|
| `groups` | Gruplar (key, name, password, dropdown_visible) |
| `members` | Üyeler (name, password, type, group_key, region, city) |
| `shares` | Hisseler (group_key, member_id, book_id, unit_index, is_read, ...) |
| `books` | Eserler (id, name, total_units, type, default_mode, sort_order) |
| `book_hatims` | Hatim döngüsü |
| `book_history` | Hatim geçmişi |
| `messages` | Mesajlar (member_name, group_key, contact, body, reply, is_read) |
| `settings` | Ayarlar (key, value) — `book_meta_*` |

---

## 🔄 Veri Akışı

### 🎯 Temel Kural
- **Supabase = gerçek kaynak** (canlı, paylaşımlı, kalıcı)
- **localStorage = salt cache** (hız için, aracı)
- Ekrandaki anlık veri **Supabase'ten gelir**
- Ama render fonksiyonları **localStorage üzerinden okur** (çünkü Supabase verisi önce oraya yazılır)

### 📊 1. Sayfa Açılışı
- Kullanıcı sayfayı açar
- localStorage'daki ESKİ veri HEMEN gösterilir (hızlı açılış)
- `doInit()` → `pullAll()` → Supabase'ten TÜM güncel veri çekilir
- `origSetItem()` → Supabase verisi localStorage'a yazılır (cache güncellenir)
- `loadGroupData()` → localStorage'dan okur → `appData` güncellenir
- `refreshUI()` → `renderBooks()` + `renderAdminSectionAtBottom()` + ... → ekran çizilir

### 📊 2. Periyodik Güncelleme (her 3 saniye)
- `setInterval(3000)`
- `if (!_myPush) pullAll()`
- Supabase'ten taze veri çekilir
- localStorage güncellenir (origSetItem)
- `loadGroupData(false, true)` → `appData` yenilenir (silent)
- `renderBooks()` → ekran güncellenir (scroll korunur)

### 📊 3. Kullanıcı Eylemi (hisse al / okundu / sil)
- Kullanıcı tıklar (örn. "Hisse Al")
- ÖNCE hedefli Supabase yazımı: `POST /shares` (on_conflict=member_id,book_id,unit_index)
- Supabase ONAYLARSA:
  - `saveGroupData()` → localStorage'a yaz (cache)
  - `renderBooks()` → ekran güncelle
  - Toast: "✅ Hisse alındı"
- Supabase REDDEDERSE (409 / çakışma):
  - yerel değişikliği GERİ AL
  - Toast: "⚠️ Bu hisse başkası tarafından alındı"

### 🚫 Yasaklar
- ❌ Tam-grup snapshot push (kural 8d)
- ❌ Bayat localStorage verisini Supabase'e gönderme
- ❌ Supabase onayı olmadan localStorage'ı güncelleme
- ❌ pullAll sırasında push yapma (döngü riski)

### ✅ Doğru Davranış
- ✅ Önce Supabase'e yaz (hedefli)
- ✅ Onay sonrası localStorage'ı güncelle (cache)
- ✅ Reddedilirse geri al + kullanıcıya bildir
- ✅ Her gösterim Supabase'ten güncel veriye dayansın

### ⚙️ Kritik Değişkenler
| Değişken | Rol |
|----------|-----|
| `_pulling` | pullAll çalışırken true → çift çekmeyi engeller |
| `_myPush` | push sırasında true → polling'i durdurur |
| `_queue` | Yazma kuyruğu → eşzamanlı yazımı serileştirir |
| `origSetItem` | Orijinal setItem → override içinde kullanılır |
| `appData` | Aktif grup verisi (localStorage'dan okunur) |

### 📌 Kural (dosya başı)
1. Supabase = tek kaynak
2. localStorage = salt cache
3. Hedefli yazım (tam-grup push YASAK)
4. İlk alan korunur (409 → conflict)

---

## 🔍 Hızlı Arama Rehberi

Ctrl+F ile ara:

| Aranan | Yaz |
|--------|-----|
| Resimli panel | `main-title-ornate-section` |
| Ayet/Hadis | `renderDailyInspiration` |
| Giriş | `simple-login-panel` |
| Üye kartı | `bireysel-takip-panel` |
| Grup kartı | `grup-takip-panel` |
| Admin panel | `renderAdminSectionAtBottom` |
| Eser listesi | `renderBooks` |
| Analiz | `openDetailedAnalysisModal` |
| Zikirmatik | `zikirmatikSection` |
| Supabase | `SUPABASE_URL` |
| PDF okuyucu | `openPdfReader` |
| Kılavuz | `klv-pop` |
| Mesaj | `admin-message-section` |

---

## 📝 Notlar

- ⚠️ Panel sırası **JS tarafından** belirlenir → HTML'de taşımak yetmez.
- ⚠️ Zikirmatik `place()` ile **sürekli sona** taşınır.
- ⚠️ Yönetici mesaj paneli `appendChild` ile **en alta** atılır.
- ✅ Değişiklik yaparken **hedefli Supabase yazımı** kuralına uy.
- ✅ Tam-grup snapshot push **YASAK** (kural 8d).
- ✅ Sadece **ilgili kısmı** değiştir, tüm dosyayı yeniden yazma.
- ✅ **Supabase = tek doğruluk kaynağı**, localStorage sadece hız için.

---

**Son güncelleme:** 15 Eylül 2026
