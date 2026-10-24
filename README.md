# Pastalia · Dijital Menü / Digital Menu

Pastalia (Milas) için Türkçe + İngilizce, mobil öncelikli dijital menü ve şifreli yönetim paneli.
Derleme adımı yoktur: statik sayfalar + Vercel serverless API + Vercel Blob depolama.

| Yol | İçerik |
|---|---|
| `/` | Müşteri menüsü: TR/EN dil seçimi, kategori çubuğu, arama, alerjen filtresi, ürün detay penceresi |
| `/mutfak` | Yönetim paneli (giriş gerekli): ürün ekle/sil/düzenle, fiyat, görsel yükle, satışta/tükendi, gizle, öne çıkar, kategoriler, işletme bilgileri, yedek |
| `/qr/*` | Logolu QR kod (SVG, PNG) ve masa kartı (PNG) |
| `/api/*` | `login`, `logout`, `me`, `menu` (GET/PUT), `upload` |

## Veri nerede?
- Menü (`menu.json`) ve panelden yüklenen görseller **Vercel Blob** deposunda (`pastalia-menu-store`) tutulur.
- Blob'da henüz kayıt yoksa site repodaki `data/menu.json` başlangıç menüsüyle açılır. Panelde ilk “Kaydet & yayınla”dan sonra Blob kullanılır.
- Başlangıç menüsü `scripts/build-seed.py` ile üretilir (basılı menüden birebir aktarıldı: 9 kategori, 54 ürün, kalori ve alerjenler). Basılı menüde fiyat olmadığından fiyatlar boştur; panelin **Hızlı fiyat** sekmesinden girilir.

## Ortam değişkenleri (Vercel → Settings → Environment Variables)
| Ad | Açıklama |
|---|---|
| `ADMIN_USER` | Panel kullanıcı adı |
| `ADMIN_PASSWORD_HASH` | scrypt özeti. Üretmek için: `npm run hash-password -- "yeni şifre"` |
| `SESSION_SECRET` | En az 32 karakter rastgele metin (oturum çerezi imzası) |
| `BLOB_READ_WRITE_TOKEN` | Blob deposu bağlanınca Vercel otomatik ekler |

Şifre değiştirmek: yeni hash üretin, `ADMIN_PASSWORD_HASH` değerini güncelleyip yeniden deploy edin. Şifre düz metin olarak hiçbir yerde saklanmaz.

## Ürün fotoğrafları
Menüde hazır fotoğraf yoktur; ürünler fotoğrafsız, temiz bir düzenle gösterilir. Panelde her ürünün düzenleme penceresinden **Görsel yükle / değiştir** ile kendi fotoğrafınızı ekleyebilirsiniz (otomatik küçültülür, Blob'a kaydedilir). Fotoğraf eklenen ürün kartında fotoğrafla görünür; “Öne çıkanlar” bölümü yalnızca fotoğrafı olan öne çıkan ürünleri gösterir.

## Yerelde çalıştırma
```
ADMIN_USER=admin ADMIN_PASSWORD_HASH="$(node dev/hash-password.mjs 'deneme')" SESSION_SECRET="$(openssl rand -base64 36)" npm run dev
```
Yerelde veriler `./.local/` altına yazılır.

## QR kod
`qr/pastalia-menu-qr.svg` (baskı için vektör), `qr/pastalia-menu-qr.png`, `qr/pastalia-menu-qr-table-card.png` (A6 masa kartı, 300 dpi).
Yeniden üretmek: `node scripts/make-qr.cjs <url> qr assets/brand/logo.png` (`qrcode` ve `sharp` paketleri gerekir).
