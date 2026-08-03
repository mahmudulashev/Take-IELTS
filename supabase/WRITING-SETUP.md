# Writing (AI baholash) — ishga tushirish

Uch qadam. Har birini bajarib, oxiridagi tekshiruvni o'tkazing.

---

## 1. Gemini API kalitini oling

1. [aistudio.google.com/apikey](https://aistudio.google.com/apikey) ga kiring
2. "Create API key" bosing
3. Kalitni nusxalang

**Kalitni hech qayerga commit qilmang.** `.env` faylga ham yozish shart emas —
u faqat Supabase serverida turadi.

**Bepul tier limitlari (2026):** `gemini-2.5-flash` — daqiqada 10, kunda 250
so'rov. Limit butun loyiha uchun, kalit uchun emas.

---

## 2. Bazani tayyorlang

Supabase Dashboard → SQL Editor → New query.

`supabase/writing-setup.sql` faylini to'liq nusxalab qo'ying va **Run** bosing.

Nima yaratiladi:

- `writing_results` jadvali (insho, to'rtta mezon bo'yicha band, feedback)
- RLS policy'lari — har kim faqat o'zinikini ko'radi
- `writing_attempts_today()` funksiyasi — kunlik limit uchun

> **Diqqat:** jadvalga `INSERT` policy'si ataylab qo'shilmagan. Yozishni
> faqat Edge Function (service role) bajaradi. Aks holda foydalanuvchi
> o'ziga xohlagan band score'ni yozib qo'ya olardi.

---

## 3. Edge Function'ni deploy qiling

Supabase CLI kerak:

```bash
# CLI o'rnatilmagan bo'lsa
brew install supabase/tap/supabase

cd ~/Desktop/"Take IELTS"

# Loyihaga ulanish (project ref Supabase Dashboard URL'ida)
supabase link --project-ref SIZNING_PROJECT_REF

# Gemini kalitini serverga joylash
supabase secrets set GEMINI_API_KEY=sizning_kalitingiz

# Funksiyani deploy qilish
supabase functions deploy evaluate-writing
```

`SUPABASE_URL` va `SUPABASE_SERVICE_ROLE_KEY` avtomatik beriladi —
ularni qo'lda qo'shish shart emas.

---

## Tekshirish

1. Saytga kiring, chap menyudan **Writing (AI)** ni tanlang
2. Mavzuni o'qing, "Boshlash" bosing
3. Qisqa insho yozing (kamida 50 so'z) va "Topshirish va baholash"
4. 20–30 soniyada natija chiqishi kerak: umumiy band, to'rtta mezon,
   kuchli tomonlar, tavsiyalar, jumla tuzatishlari

Xato chiqsa loglarni ko'ring:

```bash
supabase functions logs evaluate-writing
```

---

## Sozlamalar

`supabase/functions/evaluate-writing/index.ts` boshida:

| O'zgaruvchi | Hozirgi | Izoh |
|---|---|---|
| `GEMINI_MODEL` | `gemini-2.5-flash` | `gemini-2.5-flash-lite` — kuniga 1000 so'rov, lekin sifat pastroq |
| `DAILY_LIMIT` | `5` | Bitta foydalanuvchi uchun kunlik insho soni |
| `MIN_WORDS` | `50` | Bundan qisqa insho baholanmaydi |

O'zgartirgandan keyin qayta deploy qiling.

---

## Bilib qo'yish kerak bo'lgan narsalar

**Maxfiylik.** Google bepul tier so'rovlari modelni yaxshilash uchun
ishlatilishi mumkinligini ochiq aytadi. Talabalar insholari — foydalanuvchi
kontenti. Buni foydalanish shartlarida yozib qo'ying yoki pullik tierga o'ting.

**Kvota.** 250 so'rov/kun butun sayt uchun. `DAILY_LIMIT = 5` bo'lsa,
kuniga taxminan 50 ta faol foydalanuvchi sig'adi. O'sganda pullik tier
yoki `flash-lite` ga o'tish kerak.

**Aniqlik.** Band score LLM tomonidan band descriptor'lar asosida
taxmin qilinadi. Interfeysda "taxminiy baho" deb yozilgan — bu
ogohlantirishni olib tashlamang.

**Narx.** Bepul tier tugasa Google avtomatik pul yechmaydi — so'rovlar
429 bilan rad etiladi. Karta biriktirilmagan bo'lsa kutilmagan hisob
kelmaydi.
