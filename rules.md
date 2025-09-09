# Panduan Pengembangan Proyek Next.js

Berikut adalah panduan dan aturan yang harus diikuti untuk pengembangan dalam proyek ini.

## Backend & Server Actions (WAJIB)

1. **Wajib Server Actions**
   - Seluruh proses backend (CRUD, validasi, auth-guard sisi server, dsb.) **harus menggunakan Server Actions** (`'use server'`).
   - **Dilarang** membuat endpoint API (`/app/api/*` atau `Route Handlers`) untuk fitur yang bisa dikerjakan oleh Server Actions.

2. **Penempatan File Actions**
   - Setiap halaman punya file actions **di folder yang sama** dengan `page.tsx`.
   - **Nama file disarankan**: `actions.ts` (atau `actions.[fitur].ts` kalau banyak).
   - Contoh:
     ```
     app/
       dashboard/
         page.tsx           // Server Component
         actions.ts         // Server Actions untuk halaman dashboard
         _components/       // Client Components khusus halaman ini
       profile/
         page.tsx
         actions.ts
     src/_components/       // Komponen global
     ```

3. **Cara Pakai di Komponen**
   - Panggil Server Actions dari Server Component (langsung) **atau** dari Client Component via form/action atau `useTransition` + `action` binding.
   - Contoh `actions.ts`:
     ```ts
     'use server';

     import { revalidatePath } from 'next/cache';
     import { prisma } from '@/lib/prisma';

     export async function createItem(input: { name: string; note?: string }) {
       if (!input.name?.trim()) {
         throw new Error('Nama wajib diisi');
       }
       await prisma.item.create({ data: { name: input.name, note: input.note ?? '' } });
       revalidatePath('/dashboard');
     }
     ```
   - Contoh pemakaian di `page.tsx`:
     ```tsx
     import { createItem } from './actions';

     const page = async () => {
       return (
         <form action={async (formData) => {
           'use server';
           await createItem({
             name: String(formData.get('name') ?? ''),
             note: String(formData.get('note') ?? ''),
           });
         }}>
           <input name="name" />
           <input name="note" />
           <button type="submit">Simpan</button>
         </form>
       );
     };

     export default page;
     ```

   - Contoh pemakaian di Client Component:
     ```tsx
     'use client';

     import { useTransition } from 'react';
     import { createItem } from '../actions';

     export default function AddItem() {
       const [pending, start] = useTransition();

       return (
         <button
           onClick={() => start(() => createItem({ name: 'Sample', note: '' }))}
           disabled={pending}
         >
           {pending ? 'Menyimpan...' : 'Tambah'}
         </button>
       );
     }
     ```

4. **Pengecualian (boleh pakai API/Route Handler)**
   - Hanya jika **benar-benar tidak bisa** via Server Actions:
     - Webhook dari layanan eksternal (Stripe, Midtrans, dsb.).
     - Streaming SSE khusus atau WebSocket.
     - Callback OAuth/OpenID.
     - Long-running job/queue worker trigger.
     - File upload dengan signed URL pihak ketiga.
   - Setiap pengecualian **wajib** dicatat di README modul + alasan teknisnya.

5. **Keamanan & Praktik Baik**
   - Validasi **di server** (jangan percaya input klien).
   - Jangan expose **server secrets** ke Client Component.
   - Akses DB hanya di Server Actions / util server-only.
   - Gunakan `revalidatePath`/`revalidateTag` setelah mutasi data.
   - Gunakan TypeScript ketat untuk input/return dari Server Actions.

## Pola Koding (Coding Patterns)

1. **Struktur Halaman (`page.tsx`)**
   - Semua `page.tsx` **harus** berupa **Server Component**. Jangan gunakan `"use client"`.
   - Struktur fungsi utama:
     ```tsx
     const page = () => {
       // ... logika server di sini
     };

     export default page;
     ```

2. **Komponen Interaktif (Client Component)**
   - Buat terpisah jika butuh `useState`, `useEffect`, `onClick`.
   - Letakkan di folder `_components`.

3. **Struktur Folder `_components`**
   - Global: `/src/_components`
   - Lokal: `_components` sejajar dengan `page.tsx`.

4. **Aturan Import Komponen**
   - Wajib pakai dynamic import.
     ```ts
     import dynamic from 'next/dynamic';

     const MyComponent = dynamic(() => import('./_components/MyComponent'));
     ```

## Pola Desain (Design Patterns)

1. **Responsif & Modern**
   - UI responsif (desktop, tablet, mobile).
   - Estetika modern.

2. **Konsistensi**
   - Ikuti pola desain yang ada.
   - Warna konsisten.

3. **Palet Warna**
   - Primary: `#047857`
   - Accent: `#FBBF24`
   - Background: `#F9FAFB`
   - Surface: `#FFFFFF`
   - Text Primary: `#111827`
   - Text Secondary: `#6B7281`
   - Border: `#E5E7EB`
   - Success: `#059669`
   - Warning: `#F59E0B`
   - Error: `#EF4444`
   - Info: `#3B82F6`

4. **Ikon**
   - Wajib pakai `react-icons`.
   ```bash
   npm install react-icons
   ```
   ```tsx
   import { FaReact } from 'react-icons/fa';

   const MyIcon = () => <FaReact />;
   ```

   

## Aturan Output Kode dari Agent AI (Tanpa Komentar)

1. **Tanpa Komentar di Kode**
   - Agent AI **dilarang menuliskan komentar** dalam bentuk apa pun di dalam file kode: `// ...`, `/* ... */`, `/** ... */`, komentar JSX `{/* ... */}`, atau bentuk komentar lain pada bahasa yang digunakan.
   - Penjelasan, catatan, atau konteks ditulis **di luar file kode** (misalnya di PR description, README, atau instruksi task), **bukan** sebagai komentar di dalam kode.
   - Kode harus **self-descriptive** melalui penamaan variabel, fungsi, dan tipe yang jelas. Hindari meninggalkan kode yang di-*comment out* (dead code).

2. **Konsekuensi & Enforce**
   - Setiap PR yang memuat komentar di dalam file kode **harus direvisi** untuk menghapus komentar tersebut sebelum merge.
   - Disarankan menambahkan pemeriksaan pada pipeline (pre-commit/pre-push CI) yang menolak commit yang mengandung pola komentar umum (`//`, `/*`, `*/`, `{/*`, `*/}`) untuk berkas `*.ts`, `*.tsx`, `*.js`, `*.jsx`.
