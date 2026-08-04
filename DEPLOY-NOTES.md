# Deploy sozlamalari — nima uchun shunday

`vercel.json` da izoh yozib bo'lmaydi: Vercel sxemasi begona kalitlarni
rad etadi (`should NOT have additional property`). Shuning uchun
tushuntirishlar shu faylda.

---

## Ikkita `vercel.json` bor

| Fayl | Qachon o'qiladi |
|---|---|
| `vercel.json` (ildizda) | Vercel Root Directory = repo ildizi |
| `app/vercel.json` | Vercel Root Directory = `app` |

Faqat bittasi ishlaydi, lekin qaysi biri ekani dashboard sozlamasiga
bog'liq. **Ikkalasini bir xil holatda saqlang** — birini o'zgartirsangiz
ikkinchisini ham yangilang. Aks holda Root Directory sozlamasi
o'zgarganda sayt kutilmaganda buziladi.

---

## `rewrites` — nega oddiy `/(.*)` emas

```json
{ "source": "/((?!.*\\.[a-zA-Z0-9]+$).*)", "destination": "/index.html" }
```

Regex kengaytmasi bor yo'llarni SPA fallback'dan chiqarib tashlaydi.

**Muammo shunday edi:** `/(.*)` qoidasi bilan `/assets/main-ABC123.js`
fayli topilmasa, u ham `index.html` ga yo'naltirilardi. Brauzer JS
kutayotgan joyda HTML olib, quyidagi xatoni berardi:

```
Loading module was blocked because of a disallowed MIME type ("text/html")
```

Endi topilmagan fayl halol **404** qaytaradi — xato aniq ko'rinadi.

SPA marshrutlarida (`/dashboard`, `/test/writing/writing-3`) nuqta
bo'lmaydi, shuning uchun ular avvalgidek `index.html` ga boradi.
`/reading-test-2.html` kabi statik sahifalar fayl tizimidan beriladi.

---

## `headers` — kesh qoidalari

| Yo'l | Cache-Control | Sabab |
|---|---|---|
| `/` va `*.html` | `max-age=0, must-revalidate` | Har safar tekshiriladi |
| `/assets/*` | `max-age=31536000, immutable` | Nomida hash bor |
| `/manifest.json` | `max-age=0, must-revalidate` | PWA sozlamasi |

**`index.html` ni keshlash mumkin emas.** U har build'da yangi asset
nomlarini ko'rsatadi (`main-ABC123.js` → `main-XYZ789.js`). Keshlanib
qolsa, foydalanuvchi o'chirilgan eski fayllarni so'rab, sayt ishlamay
qoladi.

**Asset fayllarini abadiy keshlash xavfsiz**, chunki mazmuni
o'zgarganda nomi ham o'zgaradi.

---

## Deploy tartibi

Frontend va Edge Function **alohida** deploy qilinadi:

```bash
# Frontend (Vercel avtomatik, push yetarli)
git push origin main

# Edge Function (qo'lda)
supabase functions deploy evaluate-writing
```

`supabase/functions/` ichidagi kodni o'zgartirsangiz, `git push`
yetarli emas — `supabase functions deploy` ham kerak. Bu ikkisini
adashtirish oson.
