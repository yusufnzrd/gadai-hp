# Landing Page Gadai HP · Panduan Upload ke Lovable

Paket ini berisi **Variant A** (halaman saat ini, sebagai kontrol) dan **Variant B** ("Cerita & Video") untuk A/B test 50/50 di `/gadai-hp`.

Halaman dibuat sebagai HTML statis. **Mohon tidak dikonversi ke React lewat AI Lovable**, karena biasanya copy, styling, dan tracking ikut berubah. Cukup taruh file apa adanya di folder `public/`.

## Isi paket

```
public/
  gadai-hp.html          ← halaman split A/B (pakai ini sebagai final URL Google Ads)
  lp/
    variant-a.html       ← Variant A (kontrol)
    variant-b.html       ← Variant B
    assets/lp-shared.css
    assets/lp-shared.js  ← SEMUA konfigurasi ada di sini
    images/
src-optional/
  GadaiHp.tsx            ← opsional, untuk URL bersih /gadai-hp
```

## Langkah upload

1. **Hubungkan project Lovable ke GitHub** (Lovable: menu GitHub, Connect). File statis paling aman dimasukkan lewat repo GitHub.
2. **Salin isi folder `public/` dari paket ini ke folder `public/` di repo** (gabungkan, jangan timpa file lain). Commit dan push. Lovable akan sync otomatis.
3. **Opsional, URL bersih `/gadai-hp`:** salin `src-optional/GadaiHp.tsx` ke `src/pages/GadaiHp.tsx`, lalu tambahkan route di `src/App.tsx` (petunjuk ada di dalam file). Tanpa langkah ini, alamatnya adalah `/gadai-hp.html`.
4. **Publish** project di Lovable.

## Wajib diisi sebelum go live

Buka `public/lp/assets/lp-shared.js`, bagian `CONFIG` paling atas:

| Setting | Isi dengan |
|---|---|
| `GTM_ID` | ID container Google Tag Manager, contoh `GTM-ABC1234`. Tanpa ini, event tidak tercatat. |
| `SIMULASI_URL` | Alamat lengkap halaman simulasi/cek taksiran yang live, contoh `https://pandaigadai.com/...` |
| `WA_NUMBER` | Nomor WhatsApp CS untuk traffic landing page (format 62...) |
| `APP_URL` | Link download aplikasi (dipakai badge App Store / Google Play) |
| `DRAFT_MODE` | Ubah ke `false`. Kalau masih `true`, kotak placeholder video tampil di Variant B. |
| `VIDEO_SRC_V1`, `VIDEO_POSTER_V1` (dan V2, V3) | Link file video dan poster dari tim video. **Variant B jangan dijalankan sebelum video V1 ada.** |

`ACTIVE_VARIANTS` di `lp-shared.js` dan di `gadai-hp.html` sudah diset `['a', 'b']`. Kalau suatu saat diubah, ubah di kedua file.

## Cara kerja split

* Pengunjung yang membuka `/gadai-hp` (atau `/gadai-hp.html`) dibagi 50/50 ke Variant A atau B, lalu diarahkan ke `/lp/variant-a.html` atau `/lp/variant-b.html`.
* Pembagian disimpan di cookie `pg_lp_hp_variant` selama 30 hari, jadi pengunjung yang kembali selalu melihat variant yang sama.
* Semua parameter URL (UTM, gclid) ikut terbawa.
* **Untuk QA:** buka `/gadai-hp.html?v=a` atau `/gadai-hp.html?v=b`.
* Catatan: alamat di browser akan berubah ke `/lp/variant-a.html` atau `/lp/variant-b.html`. Ini normal.

## Tracking (cek di GTM Preview)

Semua event dikirim ke `dataLayer` dan membawa `lp_id: "hp"` dan `lp_variant: "a"` atau `"b"`:

* `lp_view`, `cta_click`, `wa_click`, `scroll_depth` (50 dan 75)
* Variant B tambahan: `video_play`, `video_50`, `video_complete`, `branch_click`
* **Metrik utama** adalah `simulasi_result_view`, yang harus dikirim dari halaman simulasi saat hasil resmi muncul (bukan dari landing page).

Agar sesi tidak terputus saat pindah dari landing page ke halaman simulasi (jika domainnya berbeda), aktifkan **cross domain tracking** di GA4.

## Domain

Jika `pandaigadai.com` tidak di host di Lovable, landing page akan berada di domain Lovable atau subdomain (contoh `lp.pandaigadai.com`). Pastikan final URL di Google Ads diarahkan ke alamat tersebut. Semua link footer sudah memakai alamat lengkap `https://pandaigadai.com/...`, jadi tetap berfungsi di domain mana pun.

## Durasi tes

Minimal 30 hari, per minggu penuh. Jangan diakhiri lebih awal karena pola transaksi berbeda di sekitar tanggal gajian.
