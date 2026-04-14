# DES Product Hierarchy Viewer

Excel tabanli DES urun hiyerarsilerini `React Flow` ile gorsellestiren uygulama.

## Ozellikler

- F04 referans urunu ve XC config dosyalarini secerek agac goruntuleme
- Node tiklamada bagli parent/child yollarini vurgulama
- Arama (parca no / aciklama)
- Config bazli karsilastirma ve okunakli hiyerarsi akisi

## Gereksinimler

- Node.js 18+ (onerilen: 20+)
- npm 9+
- (Opsiyonel) Veri yeniden uretilirse Python 3 + `openpyxl`

## Kurulum

```bash
npm install
```

## Gelistirme Ortami

```bash
npm run dev
```

Uygulama varsayilan olarak:

- `http://localhost:5173/`

## Production Build

```bash
npm run build
npm run preview
```

## Veri Yapisi

- Ham Excel dosyalari: `data/`
- Uygulamanin kullandigi parse edilmis veri: `src/data/hierarchyData.json`
- Ozet veri: `src/data/summary.json`

## Excel'den Veriyi Yeniden Uretme (Opsiyonel)

Eger `data/` klasorune yeni `.xlsx` dosyalari eklersen:

```bash
python3 parse_excel.py
```

Bu komut su dosyalari gunceller:

- `src/data/hierarchyData.json`
- `src/data/summary.json`

Not: Gerekirse once `openpyxl` kur:

```bash
pip3 install openpyxl
```

## Proje Komutlari

- `npm run dev` - gelistirme sunucusu
- `npm run build` - production build
- `npm run preview` - build onizleme
- `npm run lint` - lint kontrolu
