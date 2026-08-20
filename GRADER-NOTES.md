# Writing grader — kalibratsiya tarixi

Baholash natijalari bazadan o'chirilishi mumkin (`clearWritingHistory`
qaytarib bo'lmaydigan o'chirish qiladi), shuning uchun sozlash jarayoni
va test raqamlari shu faylda saqlanadi. Promptni keyingi safar
o'zgartirishdan oldin shu yerni o'qing — bir marta sinab, rad etilgan
variantlarni qayta urinmaslik uchun.

Tegishli kod: `supabase/functions/evaluate-writing/`

---

## Test natijalari

| Sana | Insho | TR | CC | LR | GRA | Umumiy | Izoh |
|---|---|---|---|---|---|---|---|
| 08-05 … 08-12 | 4 ta insho | 6.0–6.5 | 6.0–6.5 | **5.5** | 6.0 | 6.0 | LR 4 tasidan 4 tasida 5.5 |
| 08-06 | writing-7 | 7.0 | 6.5 | 6.0 | 6.0 | 6.5 | eng yuqori "eski" natija |
| 08-19 | writing-9, 275 so'z | 6.5 | 6.5 | **5.5** | 6.0 | 6.0 | imlo/kalibratsiya tuzatishlaridan oldin |
| 08-20 | writing-9, 272 so'z | 8.5 | 8.5 | **7.5** | 8.5 | 8.5 | LR ni 2 ta soxta imlo xatosi tushirgan |
| 08-20 | o'sha insho, qayta | 8.5 | **8.0** | **8.5** | 8.5 | 8.5 | imlo tuzatildi; CC qoidasi ishladi |

**Ochiq savol:** TR uchun mexanik shartlar deploy qilingan, lekin hali
sinalmagan. Kutilgan natija — TR 8.0 ga tushishi.

Diqqat, yaxlitlash: IELTS o'rtachani eng yaqin yarim ballga yaxlitlaydi
va 0.25 yuqoriga ketadi. `8.0 + 8.0 + 8.5 + 8.5 = 8.25 → 8.5`. Ya'ni
bitta mezonni tuzatish umumiy ballni o'zgartirmasligi mumkin.

---

## Model

`gemini-2.5-flash` 2026-avgustda yangi foydalanuvchilar uchun yopildi
(404 NOT_FOUND). Google o'z xato xabarida `gemini-3.6-flash` ni tavsiya
qildi — asosiy model shu.

Zaxira zanjiri: `gemini-3.6-flash` → `gemini-flash-latest` →
`gemini-3.5-flash-lite`.

**Tuzatilgan xato:** vaqtinchalik xato (503) urinishlari tugagach kod
`break outer` qilardi — natijada zaxira modellar umuman sinalmasdi va
foydalanuvchi darrov 503 olardi.

---

## Tezlik

| Bosqich | Vaqt |
|---|---|
| Boshlang'ich holat | 51–60 s |
| Hozir | **~30 s** |

Nima qilindi:

1. `thinkingLevel: 'medium'` — bu eng katta tugma. `'low'` sinab
   ko'rildi va **rad etildi**: tezroq, lekin baholash sifati pasaydi.
   Qayta urinmang.
2. Lug'at modul yuklanishida fon rejimida boshlanadi (`warmDictionary`).
   Logda ko'rinadi: boot dan 190 ms keyin 274926 ta so'z tayyor bo'ladi,
   ya'ni autentifikatsiya bilan parallel ketadi va vaqt yemaydi.
3. Annotatsiyalar 5–12 → 5–8.

Qolgan ~29 s — sof Gemini generatsiyasi. Undan pastga tushirish uchun
javobni stream qilish kerak (ballar oldin, annotatsiyalar keyin).

---

## Imlo tekshiruvi — tuzatilgan soxta xatolar

Bular LR ballini asossiz tushirayotgan edi, chunki topilgan imlo
xatolari promptga kiritiladi va model ularga qarab ball qo'yadi.

| So'z | Eski "tuzatish" | Sabab | Yechim |
|---|---|---|---|
| `Japanese` | `Japanise` | word-list da millat/til nomlari yo'q; gap boshida bo'lgani uchun tekshiruvga tushgan | 2-bosqich (tahrir masofasi) endi **bosh harfli so'zlarga umuman tegmaydi** |
| `francas` | `fracas` | `franca` ning ko'pligi lug'atda yo'q | `hasKnownStem` — qo'shimchali shakllar o'zak bo'yicha tekshiriladi |
| `stady` | `shady` / `stade` | bir xil masofadagi nomzodlardan birinchisi olinardi | unli harf almashgan nomzod ustun (`candidateScore`) |

`y` heuristikada **undosh** deb qaraladi — aks holda `y→e` ham "unli
almashuvi" bo'lib, `stade` va `study` teng ball oladi.

Test (lokal, `node`): 8.5 lik insho — **0 ta soxta xato**; 13 ta atayin
xato qo'yilgan nazorat matni — **13/13 topildi, 13/13 taklif to'g'ri**.
Gap boshidagi `Nowdays` va `Becuase` 1-bosqich ro'yxati orqali baribir
tutiladi.

---

## Prompt qoidalari — nima uchun qo'yilgan

Muhim kuzatuv: **mavhum qoida ishlamaydi, mexanik qoida ishlaydi.**
"Izohingga mos ball qo'y" degan umumiy talab TR ni qimirlatmadi;
"bunday bog'lovchilar bilan boshlansa CC 8 dan oshmaydi" degan aniq
shart esa darrov ishladi.

### Olib tashlangan

- ~~"To'rt mezon bir xil chiqsa, mustaqil baholamagansiz"~~ — bu
  model'ni **sun'iy tarqalish yasashga** majburlardi. Hamma narsa
  haqiqatan 6 bo'lsa ham bittasini pastga surardi, va odatda LR ni
  tanlardi. 5 ta yozuvdan 4 tasida LR = 5.5 bo'lgani shundan.
- ~~"Ikki ball orasida ikkilansang pastini tanla"~~ — tizimli pastga
  surish yasardi.

### Qo'shilgan

- **Yarim ballar** anchor ro'yxatiga kiritildi (7.5 / 6.5 / 5.5).
  Ilgari ro'yxatda faqat butun sonlar bor edi, model 6.5 dan qochardi.
- **LR poli:** har bir so'z to'g'ri ishlatilgan va ma'no buzilmagan
  bo'lsa — LR eng kami 6.0. Sodda leksika shiftni cheklaydi, ballni
  polga bosmaydi.
- **Imlo og'irligi deskriptorga bog'landi:** band 8 kamdan-kam imlo
  xatosiga yo'l qo'yadi, band 7 esa ba'zilariga. 1–2 ta xato butun
  bandga tushmaydi.
- **Annotatsiya halolligi:** to'g'ri inglizchani xato deb ko'rsatish
  taqiqlangan. To'g'ri, lekin sodda joylar uchun izoh majburan
  `"Xato emas — yaxshilash:"` bilan boshlanadi.
- **CC shifti:** paragraf `Firstly / Secondly / On the one hand /
  On the other hand / In conclusion` bilan ochilsa → CC eng ko'pi 8.0.
- **TR shiftlari** (mexanik): pozitsiya faqat kirish va xulosada tursa;
  da'vo asossiz qolsa; paragrafiga 1 fikr + 1 misol bo'lib insho ~290
  so'zdan kam bo'lsa; ikki paragraf orasidagi ziddiyat hal qilinmasa
  → TR eng ko'pi 8.0.
- **`to_improve` orqali qochish yo'li yopildi:** 8.5 da model kamchilik
  o'rniga "9.0 ga yo'l" yozib qo'yardi va qoidadan sirg'alib chiqardi.

---

## Ochiq ishlar

- TR mexanik shartlari sinalmagan.
- **Over-fitting xavfi:** prompt asosan bitta insho ustida sozlangan,
  ustiga u insho sun'iy yozilganga o'xshaydi (mutlaqo bir tekis
  registr, L2 izi yo'q). Haqiqiy 7.0–7.5 darajadagi insho bilan
  tekshirish kerak — agar u ham 8.0+ olsa, muammo prompt sozlashida
  emas.
- Umumiy ballni hozir **model o'zi aytadi**, kod hisoblamaydi.
  Hozirgacha to'g'ri hisoblab kelgan, lekin uni koddan hisoblash
  (to'rt mezon o'rtachasi + IELTS yaxlitlashi) bu manbani butunlay
  yo'q qilardi.
