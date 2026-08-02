-- ============================================================
-- Take IELTS — Supabase xavfsizlik sozlamalari (RLS)
-- ============================================================
-- Supabase Dashboard -> SQL Editor -> New query -> shu faylni
-- to'liq nusxalab qo'ying va "Run" bosing.
--
-- NIMA UCHUN KERAK:
-- Frontend'da ishlatiladigan anon key brauzerda ochiq turadi.
-- RLS yoqilmasa, istalgan odam bu kalit bilan barcha
-- foydalanuvchilarning natijalarini o'qiy, o'zgartira va
-- o'chira oladi. Quyidagi policy'lar har bir foydalanuvchini
-- faqat o'z ma'lumotlari bilan cheklaydi.
-- ============================================================


-- ------------------------------------------------------------
-- 1. JADVALLAR (agar hali yaratilmagan bo'lsa)
-- ------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  target_band text,
  exam_date   date,
  bio         text,
  updated_at  timestamptz default now()
);

create table if not exists public.test_results (
  id              text primary key,
  user_id         uuid not null references auth.users (id) on delete cascade,
  test_type       text not null check (test_type in ('reading', 'listening')),
  test_id         text,
  score           integer not null check (score >= 0 and score <= 40),
  total_questions integer default 40,
  band_score      numeric(2,1),
  time_spent      integer,
  answers         jsonb,
  completed_at    timestamptz default now()
);

-- So'rovlar tez ishlashi uchun indeks
create index if not exists test_results_user_completed_idx
  on public.test_results (user_id, completed_at desc);


-- ------------------------------------------------------------
-- 2. RLS'NI YOQISH
-- ------------------------------------------------------------
-- Bu qatordan keyin, policy qo'shilmaguncha, jadvalga
-- hech kim (anon key bilan) kira olmaydi.

alter table public.profiles     enable row level security;
alter table public.test_results enable row level security;


-- ------------------------------------------------------------
-- 3. PROFILES POLICY'LARI
-- ------------------------------------------------------------
-- Har bir foydalanuvchi faqat o'z profilini ko'radi va
-- o'zgartiradi. profiles.id = auth.users.id bo'lgani uchun
-- solishtirish to'g'ridan-to'g'ri id bo'yicha ketadi.

drop policy if exists "profil: o'zini o'qish"      on public.profiles;
drop policy if exists "profil: o'zini yaratish"    on public.profiles;
drop policy if exists "profil: o'zini yangilash"   on public.profiles;

create policy "profil: o'zini o'qish"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profil: o'zini yaratish"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profil: o'zini yangilash"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ------------------------------------------------------------
-- 4. TEST_RESULTS POLICY'LARI
-- ------------------------------------------------------------
-- with check — yozishda user_id'ni almashtirib yuborishning
-- oldini oladi (boshqa odam nomidan natija yozib bo'lmaydi).

drop policy if exists "natija: o'zinikini o'qish"    on public.test_results;
drop policy if exists "natija: o'zinikini yozish"    on public.test_results;
drop policy if exists "natija: o'zinikini yangilash" on public.test_results;
drop policy if exists "natija: o'zinikini o'chirish" on public.test_results;

create policy "natija: o'zinikini o'qish"
  on public.test_results for select
  using (auth.uid() = user_id);

create policy "natija: o'zinikini yozish"
  on public.test_results for insert
  with check (auth.uid() = user_id);

create policy "natija: o'zinikini yangilash"
  on public.test_results for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "natija: o'zinikini o'chirish"
  on public.test_results for delete
  using (auth.uid() = user_id);


-- ------------------------------------------------------------
-- 5. YANGI FOYDALANUVCHI UCHUN PROFIL AVTOMATIK YARATILSIN
-- ------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name',
             new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url',
             new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ------------------------------------------------------------
-- 6. TEKSHIRISH
-- ------------------------------------------------------------
-- Quyidagi so'rov ikkala jadval uchun ham rowsecurity = true
-- qaytarishi kerak.

select tablename, rowsecurity
from   pg_tables
where  schemaname = 'public'
  and  tablename in ('profiles', 'test_results');

-- Policy'lar ro'yxati:
select tablename, policyname, cmd
from   pg_policies
where  schemaname = 'public'
order  by tablename, policyname;
