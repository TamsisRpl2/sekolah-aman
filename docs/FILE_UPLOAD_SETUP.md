# Setup File Upload dengan Cloudinary

## Environment Variables

Tambahkan konfigurasi berikut ke file `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

## Cara Mendapatkan Cloudinary Credentials

1. **Daftar/Login ke Cloudinary**
   - Kunjungi [https://cloudinary.com/](https://cloudinary.com/)
   - Daftar account baru atau login jika sudah punya

2. **Dapatkan Credentials**
   - Masuk ke Dashboard Cloudinary
   - Di bagian "Product Environment Credentials" akan ada:
     - **Cloud Name**: Nama cloud Anda
     - **API Key**: Key untuk API
     - **API Secret**: Secret untuk API (klik "View API Key" untuk melihat)

3. **Copy ke .env**
   - Copy nilai-nilai tersebut ke file `.env` sesuai format di atas

## Fitur File Upload

### Spesifikasi:
- **Jenis File**: Gambar (JPEG, PNG, GIF, WebP) dan PDF
- **Ukuran Maksimal**: 10MB per file
- **Jumlah Maksimal**: 5 file per kasus
- **Folder Storage**: `sekolah-aman/evidence/`
- **Optimisasi**: Otomatis resize gambar maks 1200x1200px dengan kualitas auto

### Penggunaan:
- Drag & drop file ke area upload
- Atau klik area upload untuk memilih file
- File akan langsung diupload ke Cloudinary
- URL file akan disimpan di database
- Bisa preview dan hapus file yang sudah diupload

### Security:
- Hanya user ADMIN dan GURU yang bisa upload
- Validasi jenis file dan ukuran
- File disimpan di folder terorganisir dengan timestamp

## Testing

Tanpa konfigurasi Cloudinary yang benar, fitur upload akan menampilkan error.
Pastikan environment variables sudah diset dengan benar sebelum testing.

## Troubleshooting

### Error: "Cloudinary configuration is missing"
- Pastikan semua 3 environment variables sudah diset
- Restart development server setelah mengubah .env
- Periksa tidak ada typo di nama variables

### Error: "Invalid signature"
- Periksa CLOUDINARY_API_SECRET benar
- Pastikan tidak ada whitespace di environment variables

### Error: "File too large"
- File melebihi batas 10MB
- Kompres file terlebih dahulu

### Error: "Invalid file type"
- Hanya file gambar dan PDF yang diizinkan
- Convert file ke format yang didukung
