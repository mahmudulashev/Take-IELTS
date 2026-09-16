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
| 08-20 | writing-11, 294 so'z | 8.0 | 8.0 | 8.0 | 8.0 | 8.0 | **hammasi shiftda to'plandi** — haqiqiy baho ~7.0 |

**Mexanik shiftlar sinaldi va olib tashlandi.** Ular shift sifatida
ishladi (TR va CC aynan 8.0 ga tushdi), lekin model ularni **nishon**
deb o'qidi: hamma to'rt mezon 8.0 da to'plandi. Endi o'rniga langar
insholar ishlatiladi — pastdagi bo'limga qarang.

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

## Langar insholar (few-shot) — hozirgi asosiy yondashuv

**Nima uchun qoidalardan voz kechildi.** To'rt marta qoida qo'shildi va
har safar yangi artefakt tug'ildi:

```
1. "mezonlar bir xil bo'lmasin"   → LR doim 5.5 ga mixlandi
2. o'sha qoida olib tashlandi      → hamma narsa 8.5
3. "izohingga mos ball qo'y"       → umuman ta'sir qilmadi
4. mexanik shiftlar (max 8.0)      → hamma narsa 8.0 da to'plandi
```

Naqsh aniq: model **6.5–8.5 oralig'ida farqlay olmaydi**. Qoida langarni
suradi, ammo farqlash qobiliyatini yaratmaydi. Beshinchi qoida oltinchi
artefaktni tug'dirardi.

Shuning uchun promptda endi uchta haqiqiy insho parchasi bor, har biri
mezonlar kesimidagi bahosi va **nega aynan shu ball** izohi bilan:

| Langar | Umumiy | TR | CC | LR | GRA | Nimani o'rgatadi |
|---|---|---|---|---|---|---|
| A | 6.5 | 6.0 | 6.5 | 6.5 | 6.0 | tez-tez takrorlanuvchi artikl/predlog xatolari band 6 ko'rinishi; sodda-lekin-to'g'ri leksika band 5 emas |
| B | 7.0 | 7.0 | 7.0 | 7.0 | 7.5 | **eng muhimi:** xatosiz, ravon, aniq pozitsiyali insho ham 7 bo'lishi mumkin. Xato yo'qligi band 8 degani emas |
| C | 8.0 | 7.5 | 7.5 | 8.5 | 8.5 | 8.5 leksika va grammatika qanday ko'rinadi; va profil **notekis** bo'lishi normal |

Langar B — kalit. Avvalgi barcha inflatsiya aynan shundan kelib chiqqan:
model xatosizlikni band 8 deb o'qir edi.

Langar C notekis profilga ega — bu ataylab: model to'rtta bir xil raqam
qo'yishdan tiyilsin, lekin sun'iy tarqalish ham yasamasin.

Langar matnlari qayerdan olingan: A — foydalanuvchi ataylab 6.5 darajada
yozgan insho; B — writing-11 ga yozilgan 294 so'zlik insho; C — writing-9
ga yozilgan 272 so'zlik insho.

---

## Task 1 (Academic) — alohida prompt

`buildTask1Prompt` Task 2 promptidan ataylab ajratilgan. Task 2 prompti
langar insholar bilan kalibrlangan — ikkalasini bitta umumiy promptga
birlashtirish o'sha kalibratsiyani buzish xavfini tug'dirardi.

- **Grafik matn sifatida beriladi.** Model rasmni ko'rmaydi. Klient
  `chartToText` (lib/task1-chart.js) bilan jadval yuboradi — `taskData`.
  Aynan shu ma'lumot ekrandagi grafikni ham chizadi, shuning uchun
  "raqam noto'g'ri keltirilgan" degan izohni tekshirib bo'ladi.
- **Taxminiy qiymat xato emas.** Bar va line grafiklarda qiymat o'q
  bo'yicha taxminan o'qiladi — prompt buni ochiq aytadi. Pie va
  jadvalda raqam yozilgan, u yerda aniqlik talab qilinadi.
- **Overview — eng muhim belgi.** Busiz Task Achievement odatda 5 da
  ushlab turiladi, tafsilotlar qanchalik aniq bo'lmasin.
- **Langar javoblar — 2026-09-16 dan bor** (pastdagi "Uchinchi tekshiruv"
  bo'limiga qarang). Task 2 langarlari Task 1'ga yaramaydi, shuning uchun
  Task 1'ga o'z grafiklarimizga yozilgan haqiqiy javoblar qo'yilgan.
- JSON kaliti `task_response` ikkala task uchun bir xil (baza ustuni
  `band_task`). UI Task 1'da uni "Task Achievement" deb ko'rsatadi.
- `taskType` yubormagan eski klient avtomatik Task 2 deb qabul qilinadi.

### Birinchi sinov va tuzatish (2026-09-15)

Bar chart javobi (183 so'z) **8.0** oldi (TA 8 / CC 8 / LR 7.5 / GRA 8).
Javobda aniq xato bor edi: *"18 hours ... which was the highest figure in
the whole chart"* — aslida eng katta qiymat 19 (Watching TV, 50+), va buni
javobning o'zi keyingi paragrafda aytgan. Model xatoni belgilamadi va
xulosada "barcha raqamlar 100% aniq" deb yozdi. TV social media'dan o'zib
ketgan joy (25–34 → 35–49) ham aytilmagan edi — bu ham ko'rsatilmadi.

Sabab: model "eng yuqori" da'voni faqat gap tegishli seriya ichida
tekshirgan. Tuzatish — ikki qatlam, ikkalasi ham **adolat** uchun:

- **Tayanch faktlarni kod hisoblaydi** (`lib/task1-chart.js`): butun
  grafikdagi eng katta/kichik qiymat, har guruhdagi tartib, kesishishlar,
  tengliklar, o'qish ruxsati. Model hisob-kitobda adashmaydi.
- **O'qish ruxsati = o'q qadamining choragi** (0–20 o'qda ±1). Shu
  oraliqdagi raqam to'g'ri o'qilgan hisoblanadi. Tartib/"eng" da'vosi faqat
  haqiqiy qiymatlar farqi ruxsatdan **kichik** bo'lsa kechiriladi — 18 va 19
  (farq = 1) kechirilmaydi.
- **`data_checks` majburiy va birinchi.** Model ball qo'yishdan oldin har
  bir raqam, solishtirish va trend da'vosini yozib tekshiradi. `inaccurate`
  larni kod `task` belgisiga aylantiradi (`task1-checks.ts`), UI esa
  "Ma'lumot aniqligi" bo'limida ko'rsatadi.
- **Mutanosib jazo:** bitta kichik xato ≈ −0.5; bir nechta kichik yoki
  bitta asosiy xato ≈ −1 va TA 8 dan past; overview'ni buzuvchi xato → 5–6.
  Taxminiy qiymat hech qachon jazolanmaydi.
- **Ortiqcha jazoga qarshi qoidalar:** har bir tushirilgan ball aniq
  sababga bog'lanishi shart; tenglikdagi "eng" to'g'ri; hisoblangan
  nisbatlar to'g'ri; ma'lumot xatosi LR/GRA dan qayta tushirilmaydi.

Kutilgan natija: shu javob qayta yuborilsa "highest figure" da'vosi
`inaccurate` bo'lib belgilanadi, TA taxminan 7–7.5 ga tushadi.


### Ikkinchi tekshiruv — writing-t1-5 (2026-09-15)

Bar chart (France/UK, 5 ta mahsulot), 166 so'zlik javob **7.0** oldi:
TA 7.5 / CC 7.0 / LR 6.5 / GRA 7.0. Umumiy ball adolatli, lekin profil
noto'g'ri taqsimlangan — ikki mezon qarama-qarshi tomonga 0.5 dan adashgan:

- **TA 7.5 → ~7.0 bo'lishi kerak edi.** Overview'dagi *"Perfume was the
  product which people spent the least money on"* UK uchun to'g'ri
  (140k), lekin France uchun noto'g'ri — France eng kam Cameras'ga (150k)
  sarflagan. Model uni `correct` deb belgiladi va buni o'zi hisoblagan
  jami (340k) bilan oqladi, holbuki javobda "jami" deyilmagan. Natijada
  "barcha raqamlar to'liq mos" degan xulosa chiqdi.
- **LR 6.5 → ~7.0 bo'lishi kerak edi.** Birorta ham leksik xato topilmadi
  (yagona vocabulary izohi "Xato emas — yaxshilash"), javobda esa
  *expenditure, figure, the largest gap, more than twice as high,
  slightly lower* bor. Band 6–6.5 deskriptori "ba'zi noaniqlik" talab
  qiladi; model LR ni faqat takrorlanish uchun tushirgan.

Qo'shimcha topilgan xato: bu grafikda X o'qi mahsulotlar, ketma-ketlik
emas, lekin `tabularFacts` *"net change −250,000"*, *"France becomes
higher than UK between Cars and Computers"*, *"From Cars to Computers
every series fell"* degan ma'nosiz trend faktlarini yuborardi.

Tuzatish:

- `chart.ordered: false` — trend/kesishish faktlari o'rniga har seriya
  ichidagi tartib, kategoriya bo'yicha jami va tafovut beriladi; modelga
  "kategoriyalar ketma-ketlik emas" deb aytiladi.
- STEP 1 qoidasi: seriya nomini aytmagan umumiy "eng kam/eng ko'p"
  da'vo HAR BIR seriya uchun to'g'ri bo'lishi shart, aks holda
  `inaccurate` / `minor`. Jami bilan oqlash mumkin emas, agar nomzod
  o'zi "in total" demagan bo'lsa.
- LR qoidasi (faqat Task 1 prompti): leksik xato topilmasa va kamdan-kam
  so'zlar to'g'ri ishlatilgan bo'lsa LR ≥ 7.0; takrorlanish 7 va 8
  orasini hal qiladi. Task 2 dagi "LR poli 6.0" bilan bir mantiq — pol,
  shift emas. **Kuzatish kerak:** agar endi hamma Task 1 LR aynan 7.0
  da to'plansa, bu qoida nishonga aylangan bo'ladi (yuqoridagi "8.0 da
  to'planish" tarixini qarang).

Kutilgan natija: shu javob qayta yuborilsa perfume da'vosi `inaccurate`
(minor) bo'ladi, TA ≈ 7.0, LR ≈ 7.0, umumiy 7.0 o'zgarmaydi.


### Uchinchi tekshiruv — inflatsiya va langarlar (2026-09-16)

Foydalanuvchi writing-t1-1 grafigiga **ataylab 5.5–6 darajada** yozilgan
186 so'zlik javob yubordi. Natija: **7.0** (TA 7 / CC 7 / LR 6.5 / GRA 7).
Ya'ni taxminan bir bandga oshirilgan.

Tahlil: barcha raqamlar to'g'ri, overview bor, paragraflar mantiqiy — va
model shuning o'zini 7 deb o'qidi. Aslida:

- overview yuzaki ("not very popular in all age groups");
- tana qismi raqamlarni guruhma-guruh sanab chiqadi, solishtirmaydi;
  TV social media'dan o'zib ketgan joy xususiyat sifatida aytilmagan;
- bog'lovchilar oddiy (Also, but, while), leksika to'g'ri lekin sodda va
  takroriy ("spent", "went down", "did sport");
- gaplar asosan sodda/qo'shma, bitta moslashuv xatosi.

Bu Task 2'dagi "xatosizlik = band 8" inflatsiyasining Task 1 versiyasi:
**"aniq va xatosiz = band 7"**. Task 2'da bu qoidalar bilan emas, langar
insholar bilan tuzatilgan edi — Task 1'ga ham shu qo'llandi.

Qo'shilgan langarlar (`buildTask1Prompt`):

| Langar | Grafik | Umumiy | TA | CC | LR | GRA | Nimani o'rgatadi |
|---|---|---|---|---|---|---|---|
| A | writing-t1-1 (yosh guruhlari) | 6.0 | 6.0 | 6.0 | 6.0 | 6.5 | aniq + xatosiz + paragraflangan ≠ 7; sanab chiqish TA ≤ 6.5; sodda-to'g'ri leksika LR 6–6.5 |
| B | writing-t1-5 (France/UK) | 7.0 | 7.0 | 7.0 | 7.0 | 7.0 | solishtirishga qurilgan tana; bitta kichik overview xatosi TA ni 7 da ushlaydi |

Langar ballari qayerdan: A — foydalanuvchi 5.5–6 maqsad bilan yozdirgan
javob, 6.0 deb qabul qilindi; B — 2026-09-15 dagi tahlilda kelishilgan
taqsimot (TA 7.5 → 7, LR 6.5 → 7). Rasmiy ekspert bahosi emas.

Ma'lum cheklov: band 8 langari yo'q — haqiqiy namuna yo'q, to'qib
chiqarilmadi. Shu sababli 7.5+ uchun qoida "B dan aniq ustun bo'lsa va
qaysi jihatdan ekanini aytsa" ko'rinishida. Kuchli (8+) javob to'plangach
C langari qo'shilishi kerak.

Kutilgan natija: A javobi qayta yuborilsa ≈ 6.0; B javobi ≈ 7.0.
**Kuzatish kerak:** langar javobning o'zi yuborilganda model uni tanib
aynan langar balini ko'chirishi mumkin — bu test emas. Haqiqiy tekshiruv
boshqa, yangi yozilgan javoblarda.

---

## Ochiq ishlar

- Langar yondashuvi hali sinalmagan. Kutilgan natija: writing-11
  inshosi 8.0 emas, **7.0** olishi.
- Langarlar bahosi men va foydalanuvchi kelishuviga asoslangan, rasmiy
  ekspert bahosi emas. Agar langar noto'g'ri bo'lsa, butun shkala
  siljiydi — shuning uchun ular eng muhim fayl qismi.
- **Over-fitting xavfi:** prompt asosan bitta insho ustida sozlangan,
  ustiga u insho sun'iy yozilganga o'xshaydi (mutlaqo bir tekis
  registr, L2 izi yo'q). Haqiqiy 7.0–7.5 darajadagi insho bilan
  tekshirish kerak — agar u ham 8.0+ olsa, muammo prompt sozlashida
  emas.
- Umumiy ballni hozir **model o'zi aytadi**, kod hisoblamaydi.
  Hozirgacha to'g'ri hisoblab kelgan, lekin uni koddan hisoblash
  (to'rt mezon o'rtachasi + IELTS yaxlitlashi) bu manbani butunlay
  yo'q qilardi.
- **Task 1: langar A va B qo'shildi (2026-09-16).** Endi langar bo'lmagan
  yangi javoblarda sinash kerak: overview'siz javob (~5), raqam xatosi
  bilan javob, va kuchli (8+) javob — oxirgisi C langari uchun ham kerak.
