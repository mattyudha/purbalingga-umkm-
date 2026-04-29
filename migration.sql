-- 1. SKEMA TABEL BARU & RELASI
-- Jalankan bagian ini untuk membuat tabel Menu dan Review

CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    umkm_id UUID REFERENCES public.umkm(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    harga NUMERIC NOT NULL,
    deskripsi TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    umkm_id UUID REFERENCES public.umkm(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menambahkan kolom metadata ke tabel UMKM (Abaikan jika sudah ada)
ALTER TABLE public.umkm ADD COLUMN IF NOT EXISTS jam_operasional JSONB DEFAULT '{"buka": "08:00", "tutup": "21:00", "hari": "Senin - Minggu"}'::jsonb;
ALTER TABLE public.umkm ADD COLUMN IF NOT EXISTS rating_avg NUMERIC DEFAULT 4.5;
ALTER TABLE public.umkm ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.umkm ADD COLUMN IF NOT EXISTS price_range TEXT DEFAULT 'Rp 10.000 - Rp 50.000';


-- 2. SEEDING DATA (Contoh untuk Soto Kriyik & Bubur Ayam Matt)
-- Bagian ini untuk mengisi data agar tab "Menu" dan "Review" tidak kosong

-- Soto Kriyik Bu Karsini (ID: 94dc54fa-eeb6-4eac-af2f-9f0d0239b289)
INSERT INTO public.menu_items (umkm_id, nama, harga, deskripsi) VALUES 
('94dc54fa-eeb6-4eac-af2f-9f0d0239b289', 'Soto Kriyik Spesial', 25000, 'Soto dengan tambahan kriyik melimpah dan telur muda.'),
('94dc54fa-eeb6-4eac-af2f-9f0d0239b289', 'Soto Ayam Biasa', 15000, 'Soto ayam kuah bening segar dengan suwiran ayam kampung.'),
('94dc54fa-eeb6-4eac-af2f-9f0d0239b289', 'Mendoan Hangat', 2000, 'Tempe mendoan lebar khas banyumasan.'),
('94dc54fa-eeb6-4eac-af2f-9f0d0239b289', 'Es Jeruk Kelapa', 8000, 'Minuman segar campuran jeruk peras dan kelapa muda.');

-- Bubur Ayam Matt (ID: 0dcd3f96-8eae-4eab-9632-a9942e1ba756)
INSERT INTO public.menu_items (umkm_id, nama, harga, deskripsi) VALUES 
('0dcd3f96-8eae-4eab-9632-a9942e1ba756', 'Bubur Ayam Komplit', 15000, 'Bubur ayam dengan topping cakwe, kedelai, dan kerupuk.'),
('0dcd3f96-8eae-4eab-9632-a9942e1ba756', 'Sate Usus/Ati', 3000, 'Sate pelengkap bubur ayam.');

-- Data Review
INSERT INTO public.reviews (umkm_id, user_name, rating, comment) VALUES 
('94dc54fa-eeb6-4eac-af2f-9f0d0239b289', 'Budi Santoso', 5, 'Sotonya juara! Kriyiknya beneran renyah dan kuahnya gurih banget.'),
('94dc54fa-eeb6-4eac-af2f-9f0d0239b289', 'Siti Aminah', 4, 'Tempatnya bersih, pelayanan cepat. Parkir agak susah kalau jam makan siang.'),
('94dc54fa-eeb6-4eac-af2f-9f0d0239b289', 'Andi Wijaya', 5, 'Legenda kuliner Purbalingga, wajib coba kalau ke sini.');

-- Update Metadata UMKM
UPDATE public.umkm SET 
    rating_avg = 4.8, 
    review_count = 124, 
    price_range = 'Rp 15.000 - Rp 30.000',
    jam_operasional = '{"buka": "07:00", "tutup": "16:00", "hari": "Setiap Hari"}'::jsonb
WHERE id = '94dc54fa-eeb6-4eac-af2f-9f0d0239b289';

UPDATE public.umkm SET 
    rating_avg = 4.5, 
    review_count = 56, 
    price_range = 'Rp 10.000 - Rp 20.000',
    jam_operasional = '{"buka": "06:00", "tutup": "10:00", "hari": "Senin - Sabtu"}'::jsonb
WHERE id = '0dcd3f96-8eae-4eab-9632-a9942e1ba756';
