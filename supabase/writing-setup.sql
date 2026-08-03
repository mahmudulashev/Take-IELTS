-- ============================================================
-- Take IELTS — Writing moduli uchun baza sozlamalari
-- ============================================================
-- Supabase Dashboard -> SQL Editor -> New query -> shu faylni
-- to'liq nusxalab qo'ying va "Run" bosing.
--
-- Oldindan `rls-setup.sql` bajarilgan bo'lishi kerak.
-- ============================================================


-- ------------------------------------------------------------
-- 1. JADVAL
-- ------------------------------------------------------------

create table if not exists public.writing_results (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,

  task_type     text not null default 'task2' check (task_type in ('task1', 'task2')),
  prompt_id     text,
  prompt_text   text not null,
  essay         text not null,
  word_count    integer not null default 0,
  time_spent    integer,

  -- IELTS Writing to'rtta mezon bo'yicha baholanadi.
  -- Har biri 0.0–9.0, 0.5 qadam bilan.
  band_overall  numeric(2,1),
  band_task     numeric(2,1),   -- Task Response
  band_coherence numeric(2,1),  -- Coherence and Cohesion
  band_lexical  numeric(2,1),   -- Lexical Resource
  band_grammar  numeric(2,1),   -- Grammatical Range and Accuracy

  feedback      jsonb,          -- mezonlar bo'yicha izoh + tuzatish takliflari
  model         text,           -- qaysi model baholagani (keyin taqqoslash uchun)

  created_at    timestamptz default now()
);

create index if not exists writing_results_user_created_idx
  on public.writing_results (user_id, created_at desc);


-- ------------------------------------------------------------
-- 2. RLS
-- ------------------------------------------------------------
-- Boshqa jadvallardagi kabi: har kim faqat o'zinikini ko'radi.
-- INSERT'ni ataylab qo'shmaymiz — yozishni faqat Edge Function
-- (service role) bajaradi. Shunda foydalanuvchi o'ziga xohlagan
-- band score'ni yozib qo'ya olmaydi.

alter table public.writing_results enable row level security;

drop policy if exists "insho: o'zinikini o'qish"   on public.writing_results;
drop policy if exists "insho: o'zinikini o'chirish" on public.writing_results;

create policy "insho: o'zinikini o'qish"
  on public.writing_results for select
  using (auth.uid() = user_id);

create policy "insho: o'zinikini o'chirish"
  on public.writing_results for delete
  using (auth.uid() = user_id);


-- ------------------------------------------------------------
-- 3. KUNLIK LIMIT
-- ------------------------------------------------------------
-- Gemini bepul tier: Flash modelida kuniga 250 so'rov (butun loyiha
-- uchun). Bitta foydalanuvchi hammasini yeb qo'ymasligi uchun
-- shaxsiy limit qo'yamiz. Edge Function shu funksiyani chaqiradi.
--
-- security definer — funksiya jadvalni RLS'dan qat'i nazar o'qiy
-- oladi, lekin faqat sanoq qaytaradi, ma'lumot chiqarmaydi.

create or replace function public.writing_attempts_today(p_user_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.writing_results
  where user_id = p_user_id
    and created_at >= date_trunc('day', now());
$$;

revoke all on function public.writing_attempts_today(uuid) from public, anon;
grant execute on function public.writing_attempts_today(uuid) to service_role;


-- ------------------------------------------------------------
-- 4. TEKSHIRISH
-- ------------------------------------------------------------

select tablename, rowsecurity
from   pg_tables
where  schemaname = 'public' and tablename = 'writing_results';

select policyname, cmd
from   pg_policies
where  schemaname = 'public' and tablename = 'writing_results';
