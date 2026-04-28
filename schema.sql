-- ==========================================
-- ENUMS
-- ==========================================
CREATE TYPE public.umkm_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin_dinas', 'operator_kecamatan', 'pemilik_umkm', 'public_user');

-- ==========================================
-- TABLES
-- ==========================================

-- 1. profiles
CREATE TABLE public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role default 'public_user',
  kecamatan_id uuid, -- Akan di set foreign key setelah tabel kecamatan dibuat
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. kecamatan
CREATE TABLE public.kecamatan (
  id uuid primary key default gen_random_uuid(),
  kode_kecamatan text not null unique,
  nama_kecamatan text not null,
  geojson jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
ALTER TABLE public.kecamatan ENABLE ROW LEVEL SECURITY;

-- Tambahkan foreign key constraint ke profiles
ALTER TABLE public.profiles ADD CONSTRAINT fk_kecamatan FOREIGN KEY (kecamatan_id) REFERENCES public.kecamatan(id) ON DELETE SET NULL;

-- 3. kategori_umkm
CREATE TABLE public.kategori_umkm (
  id uuid primary key default gen_random_uuid(),
  nama text not null unique,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
ALTER TABLE public.kategori_umkm ENABLE ROW LEVEL SECURITY;

-- 4. umkm
CREATE TABLE public.umkm (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  nama_umkm text not null,
  nama_pemilik text not null,
  kategori_id uuid references public.kategori_umkm(id) on delete set null,
  kecamatan_id uuid references public.kecamatan(id) on delete set null,
  alamat text not null,
  deskripsi text,
  whatsapp text,
  latitude double precision,
  longitude double precision,
  status_verifikasi public.umkm_status default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
ALTER TABLE public.umkm ENABLE ROW LEVEL SECURITY;

-- 5. umkm_photos
CREATE TABLE public.umkm_photos (
  id uuid primary key default gen_random_uuid(),
  umkm_id uuid references public.umkm(id) on delete cascade,
  cloudinary_url text not null,
  cloudinary_public_id text not null,
  caption text,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
ALTER TABLE public.umkm_photos ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- TRIGGERS & FUNCTIONS
-- ==========================================

-- Trigger untuk update 'updated_at' otomatis di tabel umkm
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_umkm_updated
  BEFORE UPDATE ON public.umkm
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger untuk membuat profil secara otomatis setelah user sign up di Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'User Baru'), 'pemilik_umkm'); -- Default role: pemilik_umkm agar bisa daftar mandiri
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Fungsi pembantu untuk mendapatkan role user saat ini (untuk RLS)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- profiles: Public bisa baca profile (untuk melihat pemilik UMKM), User hanya bisa update profilnya sendiri
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- kecamatan: Semua orang bisa melihat, hanya admin yang bisa kelola (via service role / admin)
CREATE POLICY "Kecamatan viewable by everyone." ON public.kecamatan FOR SELECT USING (true);

-- kategori_umkm: Semua orang bisa melihat
CREATE POLICY "Kategori viewable by everyone." ON public.kategori_umkm FOR SELECT USING (true);

-- umkm:
-- 1. Semua orang (public) HANYA bisa melihat UMKM yang berstatus 'approved'
CREATE POLICY "Approved UMKM viewable by everyone." ON public.umkm FOR SELECT USING (status_verifikasi = 'approved');
-- 2. Pemilik bisa melihat UMKM miliknya sendiri (walaupun statusnya masih pending/rejected)
CREATE POLICY "Owner can view own UMKM." ON public.umkm FOR SELECT USING (auth.uid() = owner_id);
-- 3. Pemilik bisa menambahkan data UMKM miliknya
CREATE POLICY "Owner can insert own UMKM." ON public.umkm FOR INSERT WITH CHECK (auth.uid() = owner_id);
-- 4. Pemilik bisa mengupdate data UMKM miliknya
CREATE POLICY "Owner can update own UMKM." ON public.umkm FOR UPDATE USING (auth.uid() = owner_id);
-- 5. Admin dan Operator Kecamatan bisa melihat dan mengelola semua UMKM
CREATE POLICY "Admin view all UMKM" ON public.umkm FOR SELECT USING (public.get_user_role() IN ('super_admin', 'admin_dinas', 'operator_kecamatan'));
CREATE POLICY "Admin update all UMKM" ON public.umkm FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'admin_dinas', 'operator_kecamatan'));
CREATE POLICY "Admin delete all UMKM" ON public.umkm FOR DELETE USING (public.get_user_role() IN ('super_admin', 'admin_dinas'));

-- umkm_photos: Semua orang bisa melihat foto, hanya pemilik dan admin yang bisa menambah/hapus
CREATE POLICY "Photos viewable by everyone." ON public.umkm_photos FOR SELECT USING (true);
CREATE POLICY "Owner can manage photos." ON public.umkm_photos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.umkm WHERE id = umkm_id AND owner_id = auth.uid()) 
  OR public.get_user_role() IN ('super_admin', 'admin_dinas')
);

-- ==========================================
-- SEED DATA (Data Awal MVP)
-- ==========================================

INSERT INTO public.kategori_umkm (nama, icon) VALUES
('Kuliner', 'Utensils'),
('Fashion', 'Shirt'),
('Kerajinan', 'Scissors'),
('Jasa', 'Wrench'),
('Agribisnis', 'Tractor');

-- Memasukkan data 18 Kecamatan Purbalingga (GeoJSON dibiarkan kosong, diurus via /public)
INSERT INTO public.kecamatan (kode_kecamatan, nama_kecamatan) VALUES
('33.03.01', 'Kemangkon'),
('33.03.02', 'Bukateja'),
('33.03.03', 'Kejobong'),
('33.03.04', 'Kaligondang'),
('33.03.05', 'Purbalingga'),
('33.03.06', 'Kalimanah'),
('33.03.07', 'Kutasari'),
('33.03.08', 'Mrebet'),
('33.03.09', 'Bobotsari'),
('33.03.10', 'Karangreja'),
('33.03.11', 'Karanganyar'),
('33.03.12', 'Karangmoncol'),
('33.03.13', 'Rembang'),
('33.03.14', 'Bojongsari'),
('33.03.15', 'Padamara'),
('33.03.16', 'Pengadegan'),
('33.03.17', 'Karangjambu'),
('33.03.18', 'Kertanegara');
