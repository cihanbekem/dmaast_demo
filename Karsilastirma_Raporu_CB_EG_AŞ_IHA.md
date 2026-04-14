# 7 DES Product Hierarchy Dosyasının Karşılaştırmalı Analiz Raporu

---

## 1) Durum

7 Excel dosyasının tamamı başarıyla okundu ve karşılaştırıldı. Dosyaların hepsi aynı temel amaca hizmet ediyor: bir su sayacı (flowIQ® 2101) ürün ailesinin üretim yapısını simülasyon modeline dönüştürmek. Aralarındaki farklar çoğunlukla beklenen, kontrollü farklardır — ürün ailesi içindeki varyantları yansıtır.

---

## 2) Bu Dosyalar Ne İşe Yarıyor?

### Basit anlatım
Bir fabrikayı düşünün. Bu fabrikada bir su sayacı üretiliyor: **flowIQ® 2101**. Ama bu sayaç tek bir ürün değil — farklı ülkeler, farklı müşteriler veya farklı teknik gereksinimler için **biraz farklı versiyonları** (config'leri) var. Bazılarında ek parça var, bazılarında başka bir kullanım kılavuzu koyuluyor, bazılarında kapak veya vana farklı.

Bu 7 Excel dosyası, her bir versiyonun "reçetesini" (hangi parçalardan, hangi sırayla, ne miktarda yapıldığını) dijital simülasyona hazır hale getiren belgelerdir.

### Teknik gözlem
Bu dosyalar **DES (Discrete Event Simulation)** girdisi olarak tasarlanmıştır. Her biri bir ürün yapısını (BOM — Bill of Materials), üretim adımlarını (routing operations), parça-parça ilişkilerini (entity mapping, relations) ve mantıksal gruplamayı (phantom BOM) içerir. Amaç, fabrikadaki üretim sürecini bilgisayar ortamında simüle edebilmektir.

---

## 3) 7 Dosyanın Kısa Tanıtımı

| # | Dosya | Ürün | Config | Hazırlayan | Özellik |
|---|-------|------|--------|------------|---------|
| 1 | `021XBXXXXXXF04_v4.xlsx` | 021XBXXXXXXF04 | — | Işıl Hanım | **Farklı bir ürün**. Metodoloji referansı. |
| 2 | `Config1350381.xlsx` | 021XCXXXXXX | 1350381 | AŞ | AŞ tarafından oluşturulmuş örnek |
| 3 | `Config1743122.xlsx` | 021XCXXXXXX | 1743122 | AŞ | AŞ tarafından oluşturulmuş örnek |
| 4 | `Config2068624.xlsx` | 021XCXXXXXX | 2068624 | EG | EG tarafından oluşturulmuş |
| 5 | `Config2068625.xlsx` | 021XCXXXXXX | 2068625 | EG | EG tarafından oluşturulmuş |
| 6 | `Config2068626.xlsx` | 021XCXXXXXX | 2068626 | CB | CB tarafından oluşturulmuş |
| 7 | `Config2084356.xlsx` | 021XCXXXXXX | 2084356 | CB | CB tarafından oluşturulmuş |

### Basit anlatım
- 1 numaralı dosya **pilot çalışmadır** — farklı bir ürün için yapılmış ama yöntemi gösterir.
- 2–7 numaralı dosyalar **aynı ürünün 6 farklı versiyonudur** (aynı ailenin 11 config'inden 6'sı).

---

## 4) Yapısal Karşılaştırma

### 4.1) Sheet (Sayfa) Yapısı

| Sheet | F04 (Işıl) | 6 Config Dosyası |
|-------|-----------|-----------------|
| README_Guide | Var (53 satır) | Var (65–68 satır) |
| Product_Hierarchy | Var (farklı isimle) | Var (aynı isimle) |
| DES_Entity_Mapping | Var | Var |
| DES_Process_Mapping | Var | Var |
| DES_BOM_Relation_Nodes | Var | Var |
| DES_Relations | Var | Var |
| Level1_ERP_All | **Var (ekstra sheet)** | **Yok** |

**Basit anlatım**: F04 dosyasında 7 sayfa, diğerlerinde 6 sayfa var. F04'te ERP'den gelen ham veriyi gösteren fazladan bir kontrol sayfası mevcut — bu sayfa "neyi aldık, neyi eledik" diye doğrulama amaçlı. 6 config dosyasında bu sayfa bulunmuyor.

**Teknik gözlem**: `021XBXXXXXXF04_Level1_ERP_All` sayfası, qty=0 olan satırları da gösterir ve her satır için "DES hiyerarşisine dahil mi?" (Y/N) ile eleme nedenini (`reason_if_not_included`) içerir. Bu bir denetim katmanıdır. Config dosyalarında bu katman yoktur.

### 4.2) Kolon Yapısı Farkları

6 config dosyasının kendi aralarında **kolon yapısı birebir aynıdır**. Ancak F04 dosyasında birkaç önemli fark var:

| Sheet | F04 Kolon Sayısı | Config Kolon Sayısı | Fark |
|-------|:---:|:---:|------|
| Product_Hierarchy | 12 | 12 | Aynı kolonlar ama **sıraları farklı** |
| DES_Entity_Mapping | **7** | **6** | F04'te ekstra `part_type` kolonu |
| DES_Process_Mapping | **8** | **7** | F04'te ekstra `part_type` kolonu |
| DES_BOM_Relation_Nodes | **10** | **9** | F04'te ekstra `parent_part_type` kolonu |
| DES_Relations | **11** | **9** | F04'te ekstra `from_type` ve `to_type` kolonları |

**Basit anlatım**: F04 dosyası her yere "bu parça ne tür bir parça?" bilgisini ekstra olarak koymuş. Config dosyaları bu ek bilgiyi taşımıyor — daha sade bir yapı kullanıyor.

**Teknik gözlem**: F04'teki `part_type`, `from_type`, `to_type` alanları dokümantasyon zenginliği sağlar ama DES simülasyonunda zorunlu değildir. Config dosyalarının daha yalın yapısı, `component_part_type` bilgisini yalnızca `Product_Hierarchy` tablosunda tutar; diğer sheet'lere taşımaz. Ayrıca Hierarchy sheet'inde `component_desc` ve `component_part_type` kolon sırası F04 ile config dosyaları arasında ters çevrilmiştir.

### 4.3) 6 Config Dosyası Kendi Arasında Aynı mı?

**Evet, yapısal olarak birebir aynı şablonu kullanıyor.** Sheet isimleri, kolon isimleri, kolon sıraları — hepsi aynı. Bu çok önemli bir bulgu: 6 dosya tutarlı bir üretim hattından çıkmış görünüyor.

---

## 5) İçerik Karşılaştırması

### 5.1) Büyük Resim: Ortak İskelet + Varyant Katmanı

Tüm 6 config dosyasının yapısı şu mantıkla çalışıyor:

```
Katman 1 (Level 1): Config'e özel parçalar → FARKLI
Katman 2 (Level 2): Sub-assembly parçaları  → AYNI
Katman 3 (Level 3): Alt-alt montaj          → AYNI
Katman 4 (Level 4): En küçük bileşenler     → AYNI
```

**Basit anlatım**: Bir arabayı düşünün. Motor, şanzıman, tekerlekler hepsi aynı (katman 2-3-4). Ama arabanın rengi, döşemesi, navigasyon paketi farklı (katman 1). Bu su sayacında da durum aynı: iç mekanizma her config'te aynı, farklar ambalaj, kılavuz, conta/vana gibi "üst katman" parçalarda.

**Teknik gözlem**: 6 config dosyasının **level 2 ve üstü tam olarak 96 satırdır ve birebir aynıdır** — tek bir byte bile farklı değildir. Bu, assembly BOM'larının config-bağımsız olduğunu kesinlikle doğrular.

### 5.2) Level-1 Karşılaştırma Matrisi

Aşağıdaki tablo, her config'in "birinci seviye" (doğrudan bağlı) parçalarını gösterir:

| Parça | Açıklama | 1350381 (AŞ) | 1743122 (AŞ) | 2068624 (EG) | 2068625 (EG) | 2068626 (CB) | 2084356 (CB) |
|-------|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 1980385 | Ambalaj filmi (1200m) | **0.05** | **0.05** | 0.15 | 0.15 | 0.15 | 0.15 |
| 1980511 | Ambalaj tepsisi | 1 | 1 | 1 | 1 | 1 | 1 |
| 1980154 | Master kutu | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 |
| 1980434 | Ambalaj filmi (1600m) | **0.15** | **0.15** | — | — | — | — |
| 3024398 | Conta halkası | 1 | 1 | 1 | 1 | 1 | 1 |
| 3130137 | Gasket (conta) | 1 | 1 | 1 | 1 | 1 | — |
| 5962204 | Ana montaj grubu | 1 | 1 | 1 | 1 | 1 | 1 |
| 5512901 | Kullanım kılavuzu (GB) | — | — | **1** | **1** | **1** | **1** |
| 6699478 | Kapak (10'lu kutu) | **0.1** | — | — | — | — | **0.1** |
| 6556517 | Çekvalf DN15 | **1** | — | — | — | — | **1** |

**Basit anlatım**: 6 parça tüm config'lerde ortak (satır tonu gri olanlar). Farklar şunlar:

- **Ambalaj filmi miktarı**: AŞ dosyalarında 0.05, diğerlerinde 0.15. Ayrıca AŞ dosyalarında ek bir 1600m film var, diğerlerinde yok.
- **Kullanım kılavuzu**: AŞ dosyalarında yok, EG ve CB dosyalarında var (farklı ülke kılavuzu).
- **Kapak ve çekvalf**: Sadece 1350381 (AŞ) ve 2084356 (CB)'de var. Bu muhtemelen belirli pazar/müşteri gereksinimidir.
- **Gasket (conta)**: 2084356 hariç herkeste var. 2084356 bunun yerine kapak+çekvalf kombinasyonu kullanıyor.

**Teknik gözlem**: 1980434 (Thermosealing Film 1600m) yalnızca AŞ config'lerinde bulunur — bu filmin AŞ siparişlerine özel bir ambalaj varyantı olduğunu gösterir. EG/CB config'lerinde CSV'de bu parça hiç geçmemektedir.

### 5.3) Process Mapping (Üretim Adımları)

- **OP 10 = Ana Montaj (Base Assembly):** Sayaç gövdesi, ölçüm tüpü ve transdüser kutusunun temel mekanik olarak birleştirilmesi.

- **OP 22 = Elektronik Hazırlık (Electronics Prep):** LCD ekran ve PCB bileşenlerinin montajı ve hazırlanması.

- **OP 30 = Sızdırmazlık ve Kapatma (Sealing & Closing):** O-ringler, cam montajı ve ünitenin kapatılması dahil son fiziksel montaj.

- **OP 40 = Konfigürasyon ve Paketleme (Config & Packing):** Yazılımın (F-code’lar) yüklenmesi, etiketleme ve ürünün kutulanması.

- **OP 192 / 210 = Kit Hazırlama (Kitting & Prep):** Pil ve paketleme malzemelerinin (tepsi/köpük) hazırlanmasına yönelik alt süreç.

6 config dosyasının tamamında **12 adet üretim adımı** tanımlıdır ve bunlar birebir aynıdır:

| Parça | Op 10 | Op 22 | Op 30 | Op 40 | Op 60 | Op 192 | Op 210 |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 021XCXXXXXX (ana ürün) | Kundekonfiguration | | | Pakning | | | |
| 5962204 (ana montaj) | Bundsamling | | Topsamling | | | | |
| 55501572 (PCB) | | PCB montaj | SMD | | | Pressfit | Tray |
| 5401021 (Kapak) | Cover montaj | | | | | | |
| 55501649 (Radyo) | | PCB montaj | SMD | | Display | | |

**Basit anlatım**: Üretim adımları tüm config'lerde aynı. Yani sayacın nasıl üretildiği (montaj sırası, istasyonlar) config'ten config'e değişmiyor — sadece hangi malzemenin konulduğu değişiyor.

### 5.4) BOM Relation Nodes (Ürün Ağacı Grupları)

Tüm 6 config dosyasında **5 adet phantom BOM** tanımlıdır:

| Phantom BOM | Nerede | Ne yapar |
|-------------|--------|----------|
| 5915529 | 021XCXXXXXX Op 40 | Ambalaj malzemelerini gruplar |
| 2100000800 | 021XCXXXXXX Op 10 | Conta halkasını gruplar |
| 21BBC0D800 | 021XCXXXXXX Op 10 | Ana montaj grubunu (5962204) gruplar |
| 5908502.0 | 5962204 Op 10 | Alt montaj parçalarını gruplar |
| 5947202.0 | 5962204 Op 30 | Üst montaj parçalarını gruplar |

**Basit anlatım**: Phantom BOM'lar "sanal gruplar" gibidir. Fiziksel bir parça değildirler, ama bir grup malzemeyi bir arada tutmaya yararlar. Örneğin "ambalaj grubu" altında film, tepsi ve kutu birlikte tanımlanır.

### 5.5) Entity Mapping (Parça Tipi Tanımlamaları)

| Dosya | FinishedGood | SubAssembly | Component | Toplam |
|-------|:---:|:---:|:---:|:---:|
| 1350381 (AŞ) | 1 | 4 | 91 | 96 |
| 1743122 (AŞ) | 1 | 4 | 89 | 94 |
| 2068624 (EG) | 1 | 4 | 89 | 94 |
| 2068625 (EG) | 1 | 4 | 89 | 94 |
| 2068626 (CB) | 1 | 4 | 89 | 94 |
| 2084356 (CB) | 1 | 4 | 90 | 95 |

Farklar sadece level-1'deki config'e özel parça sayısından kaynaklanır. 4 SubAssembly her yerde aynı: 5962204, 55501572, 5401021, 55501649.

---

## 6) Işıl Hanım'ın Referans Dosyası ile Diğer 6 Dosya Arasındaki Fark

### Basit anlatım
Işıl Hanım'ın dosyası **farklı bir ürün** içindir (021XBXXXXXXF04 = "FV - MULTICAL® 21 q3 2.5 G3/4x110mm - PL"). Diğer 6 dosya ise 021XCXXXXXX (flowIQ® 2101) ürünü içindir. Bu iki ürün aynı **fabrikada**, aynı **ana montaj grubuyla** (5962204) üretilir, ama farklı ürün ailelerindedir. Dolayısıyla F04 dosyası "birebir kopyalanacak kaynak" değil, **"yöntemi gösteren ilk çalışma"dır**.

### Teknik gözlem — Fark ve Benzerlikler

**Aynı kalanlar:**
- Aynı 5 temel BOM grubu (phantom BOM'lar) her iki üründe de mevcut
- Level 2+ assembly yapısı büyük ölçüde aynı (5962204 ve alt montajları)
- Aynı DES modelleme mantığı: Entity → Process → BOM Node → Relation
- Aynı temel kural: qty > 0 olanlar dahil, qty = 0 olanlar hariç

**Farklılar:**

| Özellik | F04 (Işıl) | 6 Config Dosyası |
|---------|-----------|-----------------|
| Ürün kodu | 021XBXXXXXXF04 | 021XCXXXXXX |
| Sheet sayısı | **7** (ekstra ERP sayfası) | **6** |
| Entity Mapping kolonları | **7** (part_type dahil) | **6** |
| Relations kolonları | **11** (from_type, to_type dahil) | **9** |
| Hierarchy kolon sırası | desc → type | type → desc |
| Level-1 parçalar | 7 (PL kılavuzu dahil) | 7–9 (config'e göre değişken) |
| README yapısı | 53 satır, daha kısa | 65–68 satır, daha detaylı |
| Config bilgisi README'de | Yok | Var (Config ID, Basis Order, tüm 11 config listesi) |
| Source türleri | 4 tür (backfill dahil) | 3 tür |
| Level 2+ satır sayısı | 92 | 96 |

**Level 2+ fark detayı**: F04'te 92, XC config'lerde 96 satır var. XC'de fazladan 2 component mevcut: `5962204` (self-reference) ve `1713693` (Manufacturing Structures supplement). Her ikisi de XC config'lerine ait CSV verilerinden türetilmiş.

### Bu ne anlama geliyor?
F04, metodoloji açısından **"ana şablon"dur** — DES modelinin nasıl kurulacağını gösterir. Ama verisi farklı bir ürüne aittir. Config dosyaları bu metodolojiyi alıp, biraz sadeleştirerek (part_type kolonlarını çıkararak) ve kendi CSV verilerini doldurarak üretilmiştir.

---

## 7) AŞ / EG / CB Dosyalarının Kendi Aralarındaki Farklar

### 7.1) AŞ Dosyaları (1350381, 1743122)

**Basit anlatım**: Bu ikisi en eski örnekler ve birbirlerine benziyorlar ama aynı değiller.

| Özellik | 1350381 | 1743122 |
|---------|---------|---------|
| Level-1 parça sayısı | **9** | **7** |
| Ambalaj filmi (1980385) miktarı | 0.05 | 0.05 |
| Ambalaj filmi 1600m (1980434) | Var | Var |
| Kapak (6699478) | Var | Yok |
| Çekvalf (6556517) | Var | Yok |
| Kılavuz (5512901) | Yok | Yok |
| Basis Order | 25280152 | 25328951 |
| README satır sayısı | 65 | 65 |
| Toplam hierarchy | 105 | 103 |

**Teknik gözlem**: 1350381, 6 config arasında en fazla level-1 parçaya sahip olandır (9 adet). Kapak ve çekvalf yalnızca burada ve 2084356'da bulunur.

### 7.2) EG Dosyaları (2068624, 2068625)

**Basit anlatım**: Bu ikisi **tamamen aynıdır** — level-1 parçaları, miktarları, tüm satırları birebir aynı. Tek fark README'deki Config ID numarasıdır.

| Özellik | 2068624 | 2068625 |
|---------|---------|---------|
| Level-1 parça sayısı | 7 | 7 |
| Level-1 içerik | Aynı | Aynı |
| Basis Order | **25349431** | **25349431** |
| README satır sayısı | 68 | 68 |
| Shop Order Type | Prototype | Prototype |
| Lot Size | 1 | 1 |

**Teknik gözlem**: Her iki EG config'i aynı shop order'dan (25349431) üretilmiştir. CSV verisinde bu iki config aynı BOM'u paylaşır. Bu, onların aynı fiziksel sipariş için farklı "configuration ID" ile oluşturulmuş varyantlar olduğunu gösterir. EG dosyalarının README'si diğerlerinden 3 satır fazla bilgi içerir (Shop Order Type ve Lot Size alanları).

### 7.3) CB Dosyaları (2068626, 2084356)

**Basit anlatım**: Bu ikisi **farklıdır**. 2084356'da ek olarak kapak ve çekvalf var, ama gasket yok. 2068626 daha sade.

| Özellik | 2068626 | 2084356 |
|---------|---------|---------|
| Level-1 parça sayısı | 7 | **8** |
| Gasket (3130137) | Var | **Yok** |
| Kapak (6699478) | Yok | **Var** |
| Çekvalf (6556517) | Yok | **Var** |
| Basis Order | 25349431 | **25353792** |
| README satır sayısı | 65 | 65 |
| Toplam hierarchy | 103 | **104** |

**Teknik gözlem**: 2068626 ve 2084356 farklı shop order'lardan gelir. 2084356 (Manufacturing tipi, lot=2500), 2068626'dan (Prototype, lot=1) daha "gerçek üretim" temsili bir config'tir. Parça farkları da bunu doğrular — 2084356'da kapak ve çekvalf gibi ek parçalar muhtemelen belirli bir pazar/müşteri gereksinimini yansıtır.

### 7.4) Gruplar Arası Karşılaştırma

| Özellik | AŞ (1350381, 1743122) | EG (2068624, 2068625) | CB (2068626, 2084356) |
|---------|:---:|:---:|:---:|
| Film 1200m miktarı | **0.05** | 0.15 | 0.15 |
| Film 1600m var mı? | **Evet** | Hayır | Hayır |
| Kılavuz (5512901) | **Yok** | Var | Var |
| README detayı | 65 satır | **68 satır** | 65 satır |
| Shop Order Type bilgisi README'de | Yok | **Var** | Yok |

**Basit anlatım**: AŞ dosyaları daha "eski jenerasyon" gibi görünüyor — farklı bir ambalaj filmi kombinasyonu ve kılavuz eksikliği var. EG dosyaları en detaylı README'ye sahip (prototype/lot bilgisi var). CB dosyaları AŞ ile EG arasında bir yerde duruyor.

**Teknik gözlem**: Film miktarı farkı (0.05 vs 0.15) dikkat çekicidir. Bu ya gerçek bir config farkıdır, ya da AŞ dosyalarının farklı bir shop order'dan (farklı lot size ile) çekilmiş olmasından kaynaklanır. Ayrıca AŞ dosyalarında kılavuzun olmaması, o config'lerin kılavuz gerektirmeyen bir pazar varyantı olduğunu veya CSV'de bu satırın farklı bir nedenle bulunmadığını gösterebilir.

---

## 8) Genel Yorum

### Bu 7 dosya birlikte okunduğunda ne görüyoruz?

**Basit anlatım**: Bir fabrikanın, aynı temel ürünü (su sayacı) farklı müşteriler/pazarlar için nasıl konfigüre ettiğini gösteren, tutarlı bir dijital dönüşüm çalışması görüyoruz.

Hikâye şöyle:
1. **Işıl Hanım** önce başka bir ürün (021XBXXXXXXF04) üzerinde yöntemi geliştirip test etmiş — bu bir "pilot uygulama".
2. Sonra bu yöntem 021XCXXXXXX ürün ailesine taşınmış.
3. Aynı ürünün 11 konfigürasyonundan 6'sı için workbook üretilmiş.
4. Bu 6 workbook'un **%92'si aynı** (level 2-3-4 tamamen ortak). Sadece **%8'lik kısım** config'e özeldir (level-1 malzemeleri).

### Ürün Ailesi Mantığı

```
        021XCXXXXXX (flowIQ® 2101)
              │
    ┌─────────┼─────────┐
    │         │         │
  Config'e  Ortak     Ortak
  özel      Montaj    Alt-montaj
  L1 parça  (5962204) (55501572, 5401021, 55501649)
  │         │         │
  ├─ Ambalaj ├─ Housing ├─ PCB bileşenleri
  ├─ Kılavuz ├─ O-ring  ├─ Radyo modülü
  ├─ Conta   ├─ Cam     ├─ Batarya
  ├─ Kapak   ├─ Vida    └─ Display
  └─ Vana    └─ EMC plate
```

Bu yapı, klasik **"platform + varyant"** ürün mimarisinin doğru bir yansımasıdır.

### AŞ, EG, CB aynı standardı izliyor mu?

**Evet, büyük ölçüde evet.** 6 dosyanın yapısı (sheet isimleri, kolon isimleri, kolon sıraları, naming convention) birebir aynıdır. Küçük farklar:
- EG dosyalarının README'sinde 3 satır fazla bilgi var (Shop Order Type, Lot Size, Config type notu).
- AŞ dosyalarında README 65 satır, EG'de 68 satır.
- Tüm dosyalarda aynı entity naming convention: `FG_`, `SA_`, `CP_`, `OP_`, `BOM_` prefix'leri.

---

## 9) Riskler ve Dikkat Edilmesi Gerekenler

### 9.1) Dikkat Gerektiren Noktalar

| # | Risk / Gözlem | Önem | Açıklama |
|---|---------------|------|----------|
| 1 | **EG dosyaları neredeyse ikiz** | Orta | 2068624 ve 2068625 içerikleri aynı. Ya gerçekten aynı BOM'u paylaşıyorlar, ya da biri diğerinden kopyalanmış. Bu kasıtlıysa sorun yok, ama doğrulanmalı. |
| 2 | **Film miktarı tutarsızlığı** | Düşük-Orta | AŞ config'lerinde 1980385 qty=0.05, diğerlerinde 0.15. Bu gerçek bir config farkı mı, yoksa veri çekme farkı mı? |
| 3 | **1980434 sadece AŞ'da var** | Düşük | Thermosealing Film 1600m yalnızca AŞ config'lerinde mevcut. Eğer bu tüm config'lerde olması gereken bir malzemeyse, EG/CB dosyalarında eksiklik var. |
| 4 | **F04'teki denetim sheet'i config dosyalarında yok** | Orta | `Level1_ERP_All` sayfası hangi satırların elendiğini gösterir. Config dosyalarında bu yoktur — denetlenebilirlik açısından kayıp. |
| 5 | **F04'teki ekstra kolonlar config'lerde çıkarılmış** | Düşük | `part_type`, `from_type`, `to_type` kolonları sadeleştirme amacıyla çıkarılmış. Simülasyon için sorun olmaz ama dokümantasyon zenginliği azalmıştır. |
| 6 | **Config 2068626 Prototype (lot=1)** | Orta | Prototype siparişler gerçek üretimi temsil etmeyebilir. DES simülasyonunda bu config'in kullanılması dikkatli değerlendirilmeli. |
| 7 | **5 config eksik** | Bilgi | 021XCXXXXXX'in 11 config'inden yalnızca 6'sı mevcut. Kalan 5 (2106660, 2117004, 2147506, 2233327, 2562394) henüz üretilmemiş. |

### 9.2) En Güçlü Noktalar

- **Level 2+ tam tutarlılık**: 6 dosyada level 2 ve üstü birebir aynı — bu veri bütünlüğü açısından çok güçlü bir sinyal.
- **Yapısal standart**: Tüm dosyalar aynı şablon, kolon adları, naming convention kullanıyor.
- **CSV tabanlı kanıt**: Level-1 farklılıklar gerçek shop order verilerine dayanıyor.
- **Phantom BOM tutarlılığı**: 5 phantom BOM tüm dosyalarda aynı.

---

## 10) Yönetici Özeti

1. **7 dosyanın 6'sı aynı ürünün (flowIQ® 2101) farklı konfigürasyonlarıdır.** 1 tanesi (F04) farklı bir ürüne ait pilot çalışmadır.

2. **Dosyaların %92'si ortaktır.** Level 2-3-4 alt montaj yapısı 6 config'in tamamında satır satır aynıdır (96 ortak satır). Fark yalnızca level-1'deki 7–9 config'e özel parçadadır.

3. **F04 dosyası "yöntem referansı"dır, "veri kaynağı" değildir.** Farklı ürün ailesine ait olduğu için doğrudan kopyalanamaz, ama DES modelleme mantığını doğru şekilde ortaya koyar.

4. **6 config dosyası tutarlı bir standardı izler.** Sheet yapısı, kolon isimleri, naming convention birebir aynıdır. AŞ, EG, CB arasında yapısal sapma yoktur.

5. **Farklar beklenen, kontrollü farklardır:** ambalaj varyantları, ülkeye özel kılavuzlar, ek conta/vana/kapak gibi pazara özel parçalar.

6. **EG dosyaları (2068624 ve 2068625) içerik olarak aynıdır.** Bu kasıtlı bir durum olabilir (aynı fiziksel BOM) ama doğrulanması gerekir.

7. **AŞ dosyaları EG/CB'den iki yönde ayrışır:** farklı film miktarı (0.05 vs 0.15) ve ek bir ambalaj filmi türü (1980434). Bu, farklı shop order lot size'larından veya gerçek config farklarından kaynaklanabilir.

8. **F04 dosyası en zengin dokümantasyona sahiptir** — ekstra ERP kontrol sheet'i ve part_type bilgisi gibi öğeler config dosyalarına taşınmamıştır. Bu bir sadeleştirme tercihidir ama denetlenebilirliği azaltır.

9. **Kalan 5 config henüz üretilmemiştir.** 11 config'ten 6'sı tamamlanmıştır; 5'i (2106660, 2117004, 2147506, 2233327, 2562394) beklenmektedir.

10. **Genel değerlendirme: Bu dosyalar doğru bir ürün ailesi / platform yaklaşımını izlemektedir.** Ortak iskelet + varyant katmanı mantığı tutarlı şekilde uygulanmıştır ve ciddi bir yapısal sorun görülmemektedir.
