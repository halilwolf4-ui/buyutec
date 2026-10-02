# 🔍 Büyüteç Bütçe (Magnifier Budget)

Modern, şık ve yüksek performanslı kişisel bütçe, harcama ve birikim yönetim mobil web uygulaması.

---

## 🚀 GitHub'a Yükleme ve Yayına Alma (GitHub Pages)

Bu proje **GitHub Pages** ve **GitHub Actions** ile tam uyumlu olarak yapılandırılmıştır. Depoyu GitHub'a yüklediğinizde otomatik olarak derlenir ve canlıya alınır.

### GitHub'da Canlıya Alma Adımları:
1. Projeyi GitHub'da yeni bir depoya (repository) push edin (gönderin):
   ```bash
   git init
   git add .
   git commit -m "İlk sürüm: Büyüteç Bütçe"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADINIZ/buyutec-butce.git
   git push -u origin main
   ```
2. GitHub'da deponuzun **Settings (Ayarlar) > Pages** sekmesine gidin.
3. **Build and deployment > Source** kısmını **"GitHub Actions"** olarak seçin.
4. `.github/workflows/deploy.yml` iş akışı otomatik devreye girecek ve birkaç saniye içinde uygulamanızı şu adreste canlıya alacaktır:
   ```
   https://KULLANICI_ADINIZ.github.io/buyutec-butce/
   ```

---

## 💻 Kendi Bilgisayarınızda Çalıştırma

### Gereksinimler
- [Node.js](https://nodejs.org/) (v18 veya üzeri önerilir)

### Adımlar

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

3. Tarayıcınızda açın:
   ```
   http://localhost:3000
   ```

4. Yayına alma derlemesi (Production build):
   ```bash
   npm run build
   npm run preview
   ```

---

## 📱 Temel Özellikler

### 1. 📊 Genel Bakış (Overview)
- **Dokunmatik Kaydırılabilir Kart:** Parmağınızla sağa-sola kaydırabileceğiniz (touch-snap) "Toplam Birikmiş Tampon" ve "En Çok Harcananlar" paneli.
- **Kombine Tampon Analizi:** Aylık bütçe nakit fazlaları ile yatırım portföyünü birleştirip aralarındaki oranı canlı olarak gösterir.
- **Yıllık Denge (Tug of War):** Yıllık gelir ve gider oranını interaktif, animasyonlu denge çubuğunda görselleştirir.
- **Toplam Kalan Borç Takibi:** Kredi kartı ve tüketici kredisi taksitlerinin anlık toplamı.
- **12 Aylık Takvim Matrisi:** Maaş döngü gününüze göre her ayın net nakit durumunu renk kodlarıyla gösterir.

### 2. 🪙 Bu Ay (Bütçe & Harcama Düzenleyici)
- **En Üste Kategori Ekleme:** Eklenen yeni harcama kategorileri hemen en üste yerleşir.
- **Kategori Sıralama:** Kategorileri yukarı/aşağı butonlarıyla dilediğiniz gibi sıralayabilir ve kaydedebilirsiniz.
- **Otomatik Tamamlama & Öneri Listesi (Autocomplete):** Geçmiş aylardaki harcama ve kategori isimlerini otomatik önererek yazım hatalarından doğan kategori bölünmelerini engeller.
- **İnteraktif Grafikler:** Günlük kümülatif harcama eğrisi ve kategori dağılım donut grafiği.
- **Hızlı Ödeme:** Kalıcı gelir ve giderleri (Maaş, Kira, Aidat vb.) tek tuşla ödeme ("💰 Al" / "💸 Öde").
- **Kilitlenebilir Canlı Sürgü:** Harcama limitini dokunarak hızlıca ayarlama.
- **Borç Ödeme & İade Mekanizması:** Taksit ödemesi yapıldığında genel borçtan düşer; işlem silinirse tutar borca otomatik iade edilir.

### 3. 🐷 Birikim & Yatırım Portföyü (Savings & Portfolio)
- **Varlık Sınıfları:** 
  - 📊 Yatırım Fonları (TEFAS)
  - ✨ Altın & Değerli Madenler
  - 📈 Borsa & Hisse Senetleri
  - ⚡ Kripto Varlıklar
  - ⏳ Vadeli Mevduat & Faiz
  - 💵 Döviz & Yabancı Para
- **Tampon Entegrasyonu:** Birikimlerin toplam tampon içindeki yüzdesini hesaplar.
- **Hızlı Değer Güncelleme:** Varlık değerlerini tek dokunuşla düzenleme ve not ekleme.

### 4. ⚙️ Ayarlar & Güvenlik (Settings)
- **Maaş Döngüsü:** Ay başı kesim gününü (1–31) dilediğiniz güne ayarlama.
- **Yedekleme:** Tüm verileri tek tıkla `.json` formatında indirme ve geri yükleme.
- **Çoklu Kullanıcı Desteği:** Şifreli yerel kullanıcı hesapları ve oturum yönetimi.
- **Tema:** Gece (Dark) ve Gündüz (Light) modları arasında anında geçiş.

---

## 🛠️ Teknolojiler (Tech Stack)

- **Frontend:** React 19 & TypeScript
- **Derleyici / Build:** Vite (Göreceli yol `base: './'` desteğiyle)
- **Stil / Tasarım:** Tailwind CSS v4
- **Animasyonlar:** Motion (Framer Motion)
- **İkon Seti:** Lucide React
- **Veri Depolama:** LocalStorage (Offline-First, İstemci Tarafında Güvenli)

---

## 📁 Proje Yapısı

```
buyutec-butce/
├── .github/
│   └── workflows/
│       └── deploy.yml         # Otomatik GitHub Pages Yayına Alma İş Akışı
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx      # Giriş & Çoklu Kullanıcı Modalı
│   │   ├── BottomNav.tsx      # 4 Sekmeli Alt Navigasyon (Bu Ay, Birikim...)
│   │   ├── BrandLogo.tsx      # Optimize Vektör Büyüteç Logosu
│   │   ├── Modals.tsx         # Borç, Taksit ve İşlem Modalları
│   │   ├── MonthEditorTab.tsx # Bu Ay / Bütçe ve Harcama Düzenleyici
│   │   ├── MonthlyChart.tsx   # Harcama Eğrisi ve Kategori Halka Grafiği
│   │   ├── OverviewTab.tsx    # Genel Bakış & Dokunmatik Slayt Paneli
│   │   ├── SavingsTab.tsx     # Birikim & Yatırım Varlıkları Portföyü
│   │   ├── SettingsTab.tsx    # Ayarlar & JSON Yedekleme
│   │   ├── ThemeToggle.tsx    # Koyu/Açık Tema Anahtarı
│   │   └── TugOfWarBar.tsx    # Yıllık Denge Karşılaştırma Çubuğu
│   ├── utils/
│   │   └── storage.ts         # Veri Saklama ve Kalıcı İşlem Senkronu
│   ├── App.tsx                # Ana Uygulama Kabuğu
│   ├── index.css              # Tailwind ve Mobil Scrollbar Kuralları
│   ├── main.tsx               # React Başlangıç Noktası
│   └── types.ts               # TypeScript Veri Modelleri
├── index.html                 # HTML Şablonu
├── metadata.json              # Proje Bilgileri
├── package.json               # Bağımlılıklar ve Komutlar
├── tsconfig.json              # TypeScript Yapılandırması
├── vite.config.ts             # Vite Yapılandırması (base: './')
└── README.md                  # Proje Dokümantasyonu & Çalıştırma Kılavuzu
```

---

## 📄 Lisans

Apache-2.0 © 2026 Büyüteç Bütçe.
