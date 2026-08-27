<div align="center">

# Take IELTS

**IELTS'ga haqiqiy imtihon formatida tayyorlanish platformasi**

Reading, Listening va Writing bo'limlari · AI baholash · natijalar tahlili

<p>
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?style=flat-square&logo=supabase&logoColor=white">
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-deploy-000000?style=flat-square&logo=vercel&logoColor=white">
</p>

</div>

---

## Loyiha haqida

Take IELTS — o'zbek tilidagi interfeys bilan ishlaydigan IELTS mashq platformasi.
Testlar haqiqiy imtihon formatida: bir xil vaqt chegarasi, bir xil savol turlari,
bir xil ball hisoblash jadvali. Har bir urinish saqlanadi, natijalar esa vaqt
o'tishi bilan qanday o'zgarayotganini grafiklarda ko'rsatadi.

## Imkoniyatlar

| Bo'lim | Nima bor |
|---|---|
| **Reading** | 5 ta to'liq test · 3 passage · 40 savol · 60 daqiqa · avtomatik ball |
| **Listening** | 4 ta faol test · audio bilan · 40 savol · avtomatik ball |
| **Writing** | Task 2 uchun 11 ta mavzu · AI baholash · to'rt mezon bo'yicha band |
| **Hisobotlar** | Band score dinamikasi, mezonlar kesimi, chuqur tahlil bo'limi |
| **Profil** | Supabase auth (email/parol va Google), natijalar tarixi |

### Writing AI baholash qanday ishlaydi

Insho Supabase Edge Function orqali Gemini modeliga yuboriladi va IELTS'ning
to'rtta rasmiy mezoni bo'yicha baholanadi:

- **Task Response** — savolga qanchalik to'liq javob berilgan
- **Coherence & Cohesion** — tuzilma va bog'lovchi vositalar
- **Lexical Resource** — so'z boyligi
- **Grammatical Range & Accuracy** — grammatika

Baholashdan oldin insho deterministik lug'at asosida imlo tekshiruvidan o'tadi —
model taxmin qilmasin, xatolar aniq ro'yxat bo'lib bersin uchun. Javobda insho
ustiga qo'yilgan izohlar (annotated essay) va har bir mezon uchun izohli fikr
qaytadi.

> API kalit hech qachon brauzerga tushmaydi — u faqat Edge Function muhitida
> turadi. Sababi va tafsilotlari: [`supabase/WRITING-SETUP.md`](supabase/WRITING-SETUP.md).

## Texnologiyalar

- **Frontend** — React 18, Vite 6, Tailwind CSS, React Router, Framer Motion
- **Backend** — Supabase (Postgres, Auth, Row Level Security, Edge Functions)
- **AI** — Google Gemini (server tomonida, Edge Function ichida)
- **Deploy** — Vercel

## Ishga tushirish

```bash
git clone https://github.com/mahmudulashev/Take-IELTS.git
cd Take-IELTS
npm --prefix app install
```

Supabase ma'lumotlarini kiriting:

```bash
cp app/.env.example app/.env
```

`app/.env` ichiga o'z loyihangiz qiymatlarini yozing:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Keyin dev serverni oching:

```bash
npm run dev
```

### Bazani tayyorlash

Supabase Dashboard → SQL Editor'da quyidagilarni ishga tushiring:

| Fayl | Nima qiladi |
|---|---|
| [`supabase/rls-setup.sql`](supabase/rls-setup.sql) | Jadvallar va RLS policy'lari — har kim faqat o'z natijasini ko'radi |
| [`supabase/writing-setup.sql`](supabase/writing-setup.sql) | `writing_results` jadvali va unga tegishli policy'lar |

Writing bo'limini to'liq yoqish uchun (Gemini kaliti, funksiyani deploy qilish)
[`supabase/WRITING-SETUP.md`](supabase/WRITING-SETUP.md) dagi uch qadamni bajaring.

## Buyruqlar

| Buyruq | Nima qiladi |
|---|---|
| `npm run dev` | Dev server (Vite) |
| `npm run build` | Production build |
| `npm run preview` | Build'ni lokalda ko'rish |

## Tuzilma

```
.
├── app/                      # React ilova (Vite)
│   ├── src/
│   │   ├── pages/            # Landing, Dashboard, Reports, test sahifalari
│   │   ├── components/       # Grafiklar, layout, writing natija komponentlari
│   │   ├── data/             # Test katalogi, reading/listening/writing kontenti
│   │   ├── lib/              # Supabase klient, ball hisoblash, writing mantiqi
│   │   └── context/          # Auth konteksti
│   ├── *.html                # Legacy formatdagi reading/listening testlari
│   └── public/               # Audio va statik fayllar
├── supabase/
│   ├── functions/            # evaluate-writing Edge Function
│   └── *.sql                 # Jadvallar va RLS sozlamalari
└── scratch/                  # Kontent generatsiya skriptlari (ishlab chiqish uchun)
```

## Hujjatlar

| Fayl | Mavzu |
|---|---|
| [`DEPLOY-NOTES.md`](DEPLOY-NOTES.md) | Vercel sozlamalari va nega aynan shunday |
| [`GRADER-NOTES.md`](GRADER-NOTES.md) | Writing baholash tarixi, kalibratsiya, prompt qoidalari |
| [`supabase/WRITING-SETUP.md`](supabase/WRITING-SETUP.md) | AI baholashni noldan ishga tushirish |

## Deploy

Vercel'da Root Directory sozlamasiga qarab ikkita `vercel.json` dan biri o'qiladi
(ildizdagi yoki `app/` ichidagi). **Ikkalasini bir xil holatda saqlang** — birini
o'zgartirsangiz, ikkinchisini ham yangilang. Batafsil: [`DEPLOY-NOTES.md`](DEPLOY-NOTES.md).

---

<div align="center">
<sub>Muallif: <a href="https://github.com/mahmudulashev">Mahmud Ulashev</a></sub>
</div>
