# Mispati 2026 — Tasarım Sözleşmesi

## Marka özeti
Mispati, köpek sahiplerinin yağmurlu, soğuk ve erken kararan akşamlarda da yürüyüşü kısaltmamasını sağlayan ürünler satar: su geçirmez termal ceket, su geçirmez askılı bot, Freewalk eller serbest yürüyüş seti. Kitle Meta reklamlarından mobilde gelen köpek sahipleridir. Site ilk saniyede "bu benim derdim" dedirtmeli, sonra güven ve kolay satın alma sunmalıdır.

## Tasarım tezi
Hava ne olursa olsun yürüyüş kısalmasın: orman yeşili bir dış mekân dünyası, reflektif bir sinyal turuncusuyla vurgulanan tek ve net eylem.

## Renkler
| Ad | Değer | Token | Rol |
|---|---|---|---|
| Orman | #1E3528 | --mp26-forest | Koyu bantlar, footer, rozetler, seçili durumlar |
| Mürekkep | #17241C | --mp26-ink | Metin |
| Kağıt | #F2EFE6 | --mp26-paper | Sıcak yüzey (hikâye, destek bandı) |
| Yosun açık | #E7EADF | --mp26-moss-soft | Yumuşak etiket ve bilgi kutuları |
| Çizgi | #D9D6CA | --mp26-line | Ayraçlar, kenarlıklar |
| Soluk metin | #5A5F56 | --mp26-muted | Yardımcı metin |
| Sinyal | #B3441A | --mp26-signal | Tüm birincil butonlar ve fiyat vurgusu (beyazda 5.6:1) |
| Sinyal koyu | #963813 | --mp26-signal-hover | Hover |
| Sinyal açık | #F2A46F | --mp26-signal-bright | Yalnızca koyu zeminde ikon ve odak halkası |

Tema renk şemaları (config/settings_data.json): background-1 beyaz, background-2 ve accent-1 orman, inverse kağıt, accent-2 yosun açık. Eski altın tonları mp26.css içinde --mp-*, --pb-* ve --k-* değişkenleri üzerinden yeni palete bağlanır.

## Tipografi
- Başlık: Bricolage Grotesque 700 (bricolage_grotesque_n7), yedek sans-serif. Satır aralığı 0.94–1.05, harf aralığı -0.025em ile -0.04em, cümle düzeni.
- Metin: Instrument Sans 400/700 (instrument_sans_n4), yedek sans-serif. 15–18px, satır aralığı 1.5–1.6.
- Hero başlığı clamp(44px, 5.2vw, 84px); bölüm başlıkları clamp(34px, 4.4vw, 64px).
- Butonlar başlık fontunda, büyük harf yok.

## Boşluk ve kompozisyon
- Sayfa genişliği 1400px, yan boşluk clamp(20px, 4vw, 56px).
- Bölüm dikey boşluğu clamp(72px, 9vw, 136px).
- Köşe: kartlar 22–26px, butonlar hap (999px), küçük öğeler 12px.
- Gölge yalnızca ürün kartı çipinde: 0 18px 40px rgba(18,36,26,.14).

## Bileşenler
- Birincil buton (.mp26-btn): sinyal zemin, beyaz metin, 54px yükseklik, hap köşe, basınca 0.97 ölçek.
- İkincil buton (.mp26-btn--ghost): şeffaf, mevcut renkte 1.5px kenarlık.
- Hero (mp26-hero): tam genişlik görsel, metin solda, mobilde görsel üstte ve metin orman paneline taşar; görseldeki ürün çipi fiyatı ilk ekranda gösterir.
- Sorun kartları (mp26-problems): dikey 4:5.3 görsel kart, üstte ikonlu etiket, altta sorun cümlesi, ürün adı, fiyat ve sinyal butonu; mobilde yana kaydırmalı.
- Yürüyüş hikâyesi (mp26-story): saatle işaretlenmiş üç an, masaüstünde basamaklı, mobilde zaman çizgisi.
- Kombin (mp26-bundle): orman zemin, iki ürün görseli ve artı işareti, kombin kartı (mispati-kombin-item). Tutar yazılmaz, "Kombini Tamamla İndirimi Yakala".
- Müşteri kareleri (mp26-ugc): yalnızca gerçek müşteri fotoğrafı ve yorumu.
- Güvence bandı (mp26-assurance): beden güvencesi + 4 güvence kutusu.
- Ürün kartı: kare görsel, başlık fontunda ürün adı, 600 ağırlıkta fiyat.
- Header: beyaz, menü hover rengi sinyal; üstte orman zeminli kayan bilgi şeridi.
- Footer: orman zemin (accent-1), kağıt rengi destek bandından dalga ile geçiş.

## Yapılacaklar ve yapılmayacaklar
- Her bölümde tek ana fikir ve tek birincil eylem.
- Fiyat ilk ekranda ve her ürün kartında görünür.
- Mutlak iddia yok ("hiç ıslanmaz", "%100 su geçirmez", "kupkuru kalır", "asla düşmez").
- Askılı bot için yalnızca patik kısmı su geçirmez diye anlatılır; ceket için fermuar yazılmaz ve gösterilmez; Freewalk için "çekmeyi bitirir" denmez.
- Yorum ve puanlar yalnızca gerçek verilerden gelir.
- Sinyal turuncusu metin olarak koyu zeminde kullanılmaz; koyu zeminde sinyal açık kullanılır.
- Emoji, eğik görsel, dekoratif rozet ve gereksiz üst etiket yok.

## Hareket
- Kolaylaştırma: --mp26-ease-ui cubic-bezier(.16,1,.3,1), büyük yüzeyler için --mp26-ease-drawer.
- Buton basma 120ms, renk geçişi 160ms, kart görsel yakınlaşması 700ms (1.04).
- prefers-reduced-motion açıksa hiçbir animasyon ve video otomatik oynatma yok; videoda her zaman durdur butonu bulunur.