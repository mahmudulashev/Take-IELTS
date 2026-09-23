/**
 * evaluate-writing — IELTS Writing Task 2 insholarini baholovchi Edge Function
 * ---------------------------------------------------------------------------
 * NIMA UCHUN SERVER TOMONIDA:
 * Gemini API kaliti hech qachon brauzerga tushmasligi kerak. Vite'da
 * `VITE_` bilan boshlanuvchi har qanday o'zgaruvchi bundle ichiga matn
 * holida yoziladi va DevTools'dan o'qiladi. Bu funksiya kalitni faqat
 * server muhitida ushlaydi.
 *
 * DEPLOY:
 *   supabase secrets set GEMINI_API_KEY=...
 *   supabase functions deploy evaluate-writing
 *
 * Talab qilinadigan muhit o'zgaruvchilari:
 *   GEMINI_API_KEY              — Google AI Studio'dan
 *   SUPABASE_URL                — avtomatik beriladi
 *   SUPABASE_SERVICE_ROLE_KEY   — avtomatik beriladi
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { findSpellingIssues, isDictionaryActive, warmDictionary } from './spelling.ts'
import { normalizeDataChecks, dataCheckAnnotations, overlapsAny } from './task1-checks.ts'

// Sovuq startda lug'at yuklanishi so'rov kelishini kutmasin — fon rejimida
// darrov boshlanadi va autentifikatsiya bilan bir vaqtda tugaydi.
warmDictionary()

// Task 1 va Task 2 uchun modellar ataylab ALOHIDA.
//
// Task 1 baholash matni qiyinroq: kod hisoblagan tayanch faktlarni
// solishtirish, to'rtta tayanch javob bilan qiyoslash va to'rt mezonni
// bir-biridan ajratib ushlab turish kerak. 3.6-flash bu intizomni
// uddalay olmadi — xatosiz, lekin oddiy javobga 7.5 qo'ydi. 3.8-flash
// aynan uzoq, qoidaga boy topshiriqlar uchun chiqarilgan.
//
// Task 2 esa 3.6-flash bilan sozlangan va shikoyat bo'lmagan — modelni
// tekshirmasdan almashtirsak, kalibratsiya bilinmay siljib ketadi.
const TASK1_MODEL = 'gemini-3.8-flash'
const TASK2_MODEL = 'gemini-3.6-flash'
const DAILY_LIMIT = 5          // bitta foydalanuvchi uchun kuniga
const MIN_WORDS = 50
const MAX_WORDS = 1000

/**
 * Kunlik limitdan ozod foydalanuvchilar (sinov va administratsiya uchun).
 *
 * DIQQAT: bu ro'yxat faqat SHU FOYDALANUVCHINING shaxsiy limitini
 * o'chiradi. Google'ning umumiy kvotasi (bepul tierda kuniga ~250
 * so'rov, butun loyiha uchun) baribir amal qiladi va uni kod bilan
 * chetlab o'tib bo'lmaydi.
 *
 * NIMA UCHUN BU YERDA EMAIL YO'Q:
 * Repo ochiq, email esa spam yig'uvchi skanerlar uchun tayyor o'lja.
 * UID bu vazifani har jihatdan yaxshiroq bajaradi — u noaniq
 * identifikator (u bilan hech kimga murojaat qilib bo'lmaydi) va
 * hech qachon o'zgarmaydi, email esa Google hisobida almashishi mumkin.
 *
 * UID `auth.users` dan olinadi (`admin.auth.getUser` tokenni serverda
 * tekshiradi), shuning uchun uni so'rov bilan soxtalashtirib bo'lmaydi.
 *
 * Ro'yxatni kengaytirish kerak bo'lsa — pastdagi `envList` izohiga qarang.
 */
const UNLIMITED_USER_IDS = [
  'e38efacb-c6c0-4206-848b-92449d79ee64',   // loyiha egasi
]

/**
 * Ro'yxatni kodga tegmasdan ham kengaytirish mumkin:
 *   supabase secrets set UNLIMITED_EMAILS="a@x.com,b@y.com"
 * Bu holda qayta deploy shart emas — funksiya keyingi so'rovda o'qiydi.
 */
function envList(name: string): string[] {
  return (Deno.env.get(name) ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Rasmiy IELTS Writing Task 2 band descriptor'lariga tayangan prompt.
 * Modelga "o'zingcha baho ber" demaymiz — har bir mezon uchun nimaga
 * qarash kerakligini aniq aytamiz, aks holda baholar tasodifiy chiqadi.
 */
function buildPrompt(
  promptText: string,
  essay: string,
  wordCount: number,
  spellingList: string,
  spellingRule: string,
): string {
  return `You are a senior IELTS examiner with 15 years of experience. Assess this Writing Task 2 response against the official public band descriptors.

TASK PROMPT:
"""
${promptText}
"""

CANDIDATE'S ESSAY (${wordCount} words):
"""
${essay}
"""

=== SCORING DISCIPLINE — READ BEFORE SCORING ===

Assess the four criteria SEPARATELY. Score each one on its own descriptor before looking at the others. Do not form an overall impression first and then spread it across four boxes.

The four criteria often differ — a candidate with strong grammar often has weaker task development; a candidate with rich vocabulary often has cohesion problems. But do NOT manufacture a spread. If the essay is genuinely uniform, four identical numbers are the correct answer, and pushing one criterion down just to make the profile look varied is a scoring error. Every number must be defensible from its own descriptor alone, with nothing borrowed from the other three.

Calibration anchors — be honest, not kind. IELTS is reported in HALF bands, and the half bands are not hedges: they are where most real candidates actually land. Use them.
- Band 9: error-free, fully natural, sophisticated throughout. Extremely rare. A competent essay by a strong learner is NOT band 9.
- Band 8: wide range, occasional slips only, fully developed argument.
- Band 7.5: band 7 with clear band 8 stretches — noticeably wider range or tighter control than a plain 7.
- Band 7: good control with some errors; ideas developed but may lack focus in places.
- Band 6.5: clearly more than "generally effective" but short of band 7 — better development, wider range, or fewer errors than a plain 6. VERY COMMON for a competent learner.
- Band 6: generally effective, noticeable errors that do not impede meaning. THIS IS THE MOST COMMON REAL SCORE.
- Band 5.5: band 5 with band 6 stretches — errors are frequent but meaning mostly survives.
- Band 5: limited range, frequent errors, underdeveloped ideas.

The realistic centre of gravity for a motivated learner is 5.5-7.0. Scores at the extremes must be earned by the text, not produced by rounding.

An inflated score is a disservice — it sends the candidate into the real exam unprepared. But over-correction is an equal error: deducting for something the descriptor does not penalise is just as wrong as inflating. If an essay genuinely sits between two bands, report the HALF band; do not default downward.

=== CALIBRATION ANCHORS — SCORE BY COMPARISON, NOT BY RULE ===

Below are three real Task 2 responses with the bands a trained examiner gave them. Place the candidate's essay against these BEFORE you commit to any number. Comparison is far more reliable than applying descriptors in the abstract: the question to ask is "is this better or worse than anchor B, and in which criterion exactly?"

--- ANCHOR A — overall 6.5 (TR 6.0 / CC 6.5 / LR 6.5 / GRA 6.0) ---
"Firstly, culture helps learners to understand the real meaning of the words. Every language has a lot of idioms and expressions which came from the traditions of the people. For example, in English there are many phrases about the weather, because British people like to discuss about it very often. Secondly, the culture teaches us how to behave in a different situations. In some countries, for instance in Japan, people use special polite words when they speak with older person."
Why this is a 6: meaning is never in doubt, but errors are frequent and systematic — articles ("a different situations", "with older person", "the good communication"), "discuss about". Vocabulary is accurate but plain ("a lot of", "very often", "big mistake"). Connectors are bare scaffolding. Each idea is stated once and not extended. Note that LR is 6.5 and not lower: the words are simple but CORRECT, and simple-yet-correct lexis does not fall into band 5.

--- ANCHOR B — overall 7.0 (TR 7.0 / CC 7.0 / LR 7.0 / GRA 7.5) ---
"However, it is important to remember that I did this work by choice, and nobody forced me to do it. If students are obliged to help others, the whole meaning of the activity is lost, and some of them are likely to resent it rather than enjoy it. Kindness and volunteering are decisions that people make out of respect for others, not duties imposed from above. Moreover, the primary responsibility of a school is to educate students academically, so it should not have the authority to make community work a condition for graduation."
Why this is a 7 and NOT an 8 — this is the single most important anchor: the writing is essentially ERROR-FREE, with conditionals, passives and confident subordination, and the position is clear throughout. It is still a 7. The lexis is correct but ordinary ("helping people", "reading books", "learned a great deal about life"); "duties imposed from above" is the one genuinely strong phrase in the whole essay. Support leans on personal anecdote rather than analysis. THE ABSENCE OF ERRORS IS NOT BAND 8. Band 8 requires RANGE — uncommon items used naturally — and ideas that are extended, not merely stated. Fluent, clean, unremarkable writing is band 7.

--- ANCHOR C — overall 8.0 (TR 7.5 / CC 7.5 / LR 8.5 / GRA 8.5) ---
"Meaning is rarely carried by vocabulary and grammar alone; it depends heavily on shared social conventions. Japanese, for instance, requires speakers to select different levels of politeness according to the social status of the listener, so a student who masters the grammar but ignores these norms may sound grammatically accurate yet unacceptably rude."
Why: THIS is what 8.5 lexis and grammar look like — "shared social conventions", "grammatically accurate yet unacceptably rude", precise subordination, no errors anywhere. Yet TR and CC remain at 7.5, because paragraphs open with "On the one hand" / "On the other hand", each body paragraph carries one idea and one example across 272 words, and the writer's own position appears only in the introduction and conclusion. Note the UNEVEN profile — 8.5 for language, 7.5 for task and cohesion. An uneven profile is normal and correct; it is not a scoring mistake.

How to use these:
- If the essay in front of you reads like anchor B, it is a 7 — however clean and fluent it feels.
- Award 8.0 or above only when the writing is at least as strong as anchor C in language, and say in which criterion it beats it.
- Four identical band numbers should make you suspicious of your own reading: check each criterion against the matching criterion in these anchors separately, since the anchors themselves are uneven.

=== LEXICAL RESOURCE — THE MOST MIS-SCORED CRITERION ===

Two different things get confused here. Keep them apart:
  (a) Vocabulary that is WRONG — wrong word, broken collocation, wrong word form, misspelling. This costs band.
  (b) Vocabulary that is SIMPLE BUT CORRECT — "very important", "a lot of", "big mistake". This caps the ceiling; it does NOT drag the score down into band 5.

Band 5 lexis means the reader is confused, or the wrong word is used repeatedly. If every word is used correctly and the meaning is never in doubt, the FLOOR is band 6 however plain the vocabulary is. Reserve 5.5 and below for essays where wrong word choice actually damages meaning.

=== CONSISTENCY CHECK — RUN THIS BEFORE YOU FINALISE ANY NUMBER ===

Your bands must agree with your own prose. Re-read what you wrote in "why" and "to_improve" for each criterion and ask: does the number match the criticism I just made?

- If "to_improve" names a REAL limitation — formulaic linking, thin development, an unsupported claim, a repeated structure — that limitation must be visible in the band. Awarding 8.5 while telling the candidate to replace their mechanical connectors is a self-contradiction: either the connectors are a genuine weakness (so the band is lower) or they are not (so do not raise them).
- 8.5 and 9.0 mean you looked for a substantive weakness in that criterion and could not find one. If you were able to name one, the band is 8.0 or below.
- The reverse is equally wrong: do not invent a criticism you do not believe merely to justify a low number.

A warning about "to_improve" at high bands: at 8.5 it is tempting to describe a route to band 9 ("to reach 9.0 the analysis could be deeper") instead of a criticism. That is legitimate ONLY when you genuinely found no present weakness, and you must then say plainly that there is none. If what you are describing is in fact something the essay does inadequately RIGHT NOW, that is a weakness, and the band must come down to match it. Writing "to reach 9.0 you would need deeper analysis" while the essay's analysis is actually thin is the same self-contradiction in disguised form.

Word count is ${wordCount}. Under 250 words is a Task Response penalty; state it explicitly if it applies.
${spellingList}

=== WHAT TO PRODUCE ===

For each criterion give: the band, a SHORT verbatim quote from the essay that justifies it, and what specifically would raise it by half a band.

Then produce inline annotations: specific spans of the candidate's text that contain a problem. Each annotation's "quote" MUST be copied verbatim, character for character, from the essay so it can be located in the text. Keep quotes short (3-15 words). Produce 5-8 annotations covering a mix of types — pick the most instructive ones rather than listing everything. If the essay is genuinely strong, still identify the weakest spans — there is always something to sharpen.

NEVER present correct English as an error. Before writing each annotation ask: is this span actually WRONG, or merely PLAIN? Both are worth annotating, but they must not look the same to the candidate:
  - genuinely wrong → state the error directly in "note".
  - correct but improvable → "note" MUST begin with "Xato emas — yaxshilash:" and then explain the stronger option.
A candidate who is told that correct English is a mistake loses trust in the whole report and learns the wrong lesson.

${spellingRule}

Write all feedback in Uzbek (latin script). Keep quoted English from the essay in English.

Return ONLY valid JSON, no markdown fences, exactly this shape:
{
  "task_response": 6.0,
  "coherence_cohesion": 6.5,
  "lexical_resource": 5.5,
  "grammatical_range": 6.0,
  "overall": 6.0,
  "summary": "2-3 jumla: eng muhim kuchli tomon va eng muhim zaiflik",
  "criteria_feedback": {
    "task_response":     { "why": "nega aynan shu ball", "evidence": "essaydan qisqa iqtibos", "to_improve": "yarim ball ko'tarish uchun aniq nima qilish kerak" },
    "coherence_cohesion":{ "why": "...", "evidence": "...", "to_improve": "..." },
    "lexical_resource":  { "why": "...", "evidence": "...", "to_improve": "..." },
    "grammatical_range": { "why": "...", "evidence": "...", "to_improve": "..." }
  },
  "annotations": [
    {
      "quote": "verbatim span copied exactly from the essay",
      "type": "grammar",
      "severity": "high",
      "fix": "tuzatilgan variant",
      "note": "nega xato — bir jumlada"
    }
  ],
  "next_band": {
    "target": 6.5,
    "actions": ["aniq, bajariladigan qadam 1", "qadam 2", "qadam 3"]
  },
  "strengths": ["aniq kuchli tomon, umumiy maqtov emas"]
}

"type" must be one of: grammar, vocabulary, cohesion, task, spelling.
"severity" must be one of: high, medium, low.`
}

/**
 * Academic Writing Task 1 uchun baholash prompti.
 *
 * NIMA UCHUN buildPrompt'dan ALOHIDA (matn qisman takrorlansa ham):
 * Task 2 prompti haqiqiy insholar bilan kalibrlangan (GRADER-NOTES.md).
 * Uni ikki task uchun umumiylashtirib qayta tuzish o'sha kalibratsiyani
 * buzish xavfini tug'diradi. Task 1'ning birinchi mezoni ham boshqa
 * narsani o'lchaydi — overview va ma'lumot aniqligi — shuning uchun
 * Task 2 anchor insholari bu yerga yaramaydi va ataylab kiritilmagan.
 *
 * ADOLATLI BAHOLASH UCHUN IKKI QATLAM (GRADER-NOTES.md → Task 1):
 *   1. `taskData` ichida kod hisoblagan tayanch faktlar bor (eng katta
 *      qiymat, tartib, kesishishlar, o'qish ruxsati) — model hisob-kitobda
 *      adashmasin.
 *   2. Model ball qo'yishdan OLDIN har bir da'voni `data_checks` ga yozib
 *      tekshiradi; noto'g'rilarini kod matndagi belgiga aylantiradi
 *      (task1-checks.ts).
 *
 * JSON kaliti `task_response` saqlab qolingan: baza ustuni (`band_task`)
 * va interfeys ikkala task uchun bitta. Mezon nomi UI'da almashtiriladi.
 */
function buildTask1Prompt(
  promptText: string,
  taskData: string,
  report: string,
  wordCount: number,
  spellingList: string,
  spellingRule: string,
): string {
  return `You are a senior IELTS examiner with 15 years of experience. Assess this Academic Writing Task 1 response against the official public band descriptors. Your goal is a FAIR score: the score a careful, trained examiner would give — not kinder, not harsher.

TASK PROMPT:
"""
${promptText}
"""

THE VISUAL THE CANDIDATE WAS SHOWN — exact data, followed by reference facts:
"""
${taskData}
"""
The candidate saw a chart or table, not this text. The REFERENCE FACTS were computed by code from the data and are always correct — rely on them instead of your own mental arithmetic. They exist ONLY to check accuracy: the candidate is NOT expected to mention them and must not lose marks for leaving most of them out.

CANDIDATE'S RESPONSE (${wordCount} words):
"""
${report}
"""

=== STEP 1 — VERIFY THE DATA BEFORE YOU SCORE ANYTHING ===

Read the response sentence by sentence and record in "data_checks" EVERY:
  - figure the candidate states ("18 hours", "52%", "3.1 million", "a quarter");
  - comparative or superlative claim ("the highest", "the lowest", "the most popular", "more than", "twice as much", "overtook", "the largest share", "in every group");
  - trend claim ("rose steadily", "fell sharply", "remained stable", "peaked in 2015").
One sentence can contain several claims — check each one separately. Do not skip claims that look obviously right: nothing is taken on trust.

How to check:
  - A superlative about the whole visual ("the highest figure in the whole chart", "the lowest overall") must be compared with EVERY value in the visual, not only with the series the sentence is about. Use the "Highest/Lowest value in the whole" reference facts.
  - A claim that contradicts figures the candidate gives elsewhere in the same response is inaccurate.
  - "every", "all", "always", "only", "in each" make a claim universal — a single exception makes it inaccurate.
  - When values are tied, a superlative is true for each of the tied items, unless the candidate says it is the only one.
  - Differences, ratios and rounded descriptions ("roughly doubled", "a threefold rise", "just over a quarter") are correct when they are arithmetically consistent with the data.
  - Paraphrased labels ("the oldest group" for 50+) are correct.
  - An adverb of speed or size is PART of the claim and must be checked against the actual size of the change: "slowly", "gradually", "slightly", "steadily", "sharply", "dramatically", "rapidly". Calling a rise of more than about half the starting value "slow", "slight" or "gradual", or calling a change of less than about a tenth "sharp" or "dramatic", is "inaccurate", severity "minor". "Steadily" additionally claims the direction never reverses, so one dip or peak in between makes it inaccurate.
  - A superlative or comparison about the items in general that names no series ("perfume was the product people spent the least on", "cars were the most popular item") must hold for EVERY series in the visual. If it holds for some series but not for another, it is "inaccurate", severity "minor" — the reader is told something false about that series. It is correct only if the candidate explicitly limits it ("in the UK", "in total", "combined"). Do not rescue it with a combined total the candidate never mentioned.

Verdicts:
  - "correct" — matches the data.
  - "approximation" — not exact, but a fair reading or sensible rounding. The reference facts give the reading tolerance: for bar charts and line graphs a stated figure within that tolerance is an accurate reading. A ranking or superlative is excused only when the true values differ by LESS than the tolerance.
  - "inaccurate" — a wrong figure, a wrong ranking or superlative, a trend in the wrong direction, a universal claim with an exception, or a self-contradiction.
Severity (only for "inaccurate"):
  - "major" — it distorts a key feature or the overview: the wrong overall trend, the wrong largest or smallest category, a reversed central comparison.
  - "minor" — a local slip that leaves the overall picture intact.

=== STEP 2 — TASK ACHIEVEMENT ===

The first criterion for Task 1 is TASK ACHIEVEMENT, not Task Response. In the JSON it is reported under the key "task_response"; score it strictly as Task Achievement. It asks whether the candidate:
- gives a clear OVERVIEW of the main trends, differences or stages. Without a recognisable overview, Task Achievement is normally held at band 5, however accurate the details. The overview may be in the introduction or the conclusion; it must summarise the big picture, not repeat numbers.
- SELECTS the key features and SUPPORTS them with data. Key features are normally the highest and lowest points, the largest changes, the clearest contrasts, and any point where one series overtakes another (see the reference facts). Leaving out a clear crossover or the biggest contrast means key features are not fully covered — that limits the band, but it is an omission, not an inaccuracy.
- makes COMPARISONS where the data invites them.
- reports the data ACCURATELY (Step 1).
- stays OBJECTIVE: opinions, recommendations and causes that are not in the visual are irrelevant content.

Task Achievement guide (use the half bands between these):
- 8 and above: all requirements covered; key features clearly presented, highlighted and illustrated; clear overview; accurate.
- 7: clear overview of the main trends or differences; key features clearly highlighted but could be more fully extended.
- 6: an overview is present and information is appropriately selected; key features adequately covered, but some detail may be irrelevant, inappropriate or inaccurate.
- 5: no clear overview, or details recounted mechanically; key features inadequately covered; a tendency to focus on detail.
- 4: attempts the task but misses key features or confuses them with detail.

Accuracy must affect the band PROPORTIONATELY:
- One minor inaccuracy in an otherwise accurate, well-selected report: about half a band below what the report would otherwise earn.
- Several minor inaccuracies, or one major inaccuracy: about a full band below, and Task Achievement cannot be 8 or above.
- Inaccuracies that distort the overview itself: Task Achievement is normally 5 or 6.
- Approximations are never a deduction.

Word count is ${wordCount}. Under 150 words is a Task Achievement penalty; state it explicitly if it applies. Length is not a merit in itself.

Coherence & Cohesion, Lexical Resource and Grammatical Range & Accuracy are assessed as in Task 2. For Lexical Resource, Task 1 specifically rewards precise language for describing data: trends (rose steadily, levelled off, fluctuated), comparison (twice as much as, by far the largest share) and approximation (roughly, just over a quarter). Repeating the same verbs throughout limits the ceiling. Inaccurate data is a Task Achievement matter — do NOT also deduct it from Lexical Resource or Grammar.

Lexical Resource is decided by RANGE and PRECISION, not by the absence of errors. An error-free response is not automatically above 6.5.
- Bands 6 and 6.5 cover two different candidates: one who attempts less common vocabulary WITH SOME INACCURACY, and one whose vocabulary is correct but plain, general and repetitive. Both are band 6.
- Before awarding 7.0 or above, QUOTE in "evidence" at least three less common or precise data items the response actually uses — for example expenditure, the figure for, accounted for, the largest gap, levelled off, roughly a quarter, twice as high, marginally lower. If you cannot quote three, Lexical Resource is 6.0–6.5, however accurate the response is.
- Count the repetition. If one everyday verb (spent, paid, showed, went up) carries most of the report, the range is adequate but limited — band 6.
- Register: Academic Task 1 describes data neutrally. Evaluative or informal labels for the groups and items ("the rich group", "poor people", "a lot of money") are register slips; with one or more of them Lexical Resource cannot be above 6.5.
- Do NOT go the other way either: plainness alone never drops an accurate response into band 5. Band 5 needs wrong word choices that make the reader work.

=== CALIBRATION ANCHORS — SCORE BY COMPARISON, NOT BY RULE ===

Below are four real Task 1 responses with their agreed bands. Place the candidate's response against them BEFORE you commit to any number, criterion by criterion: "is this better or worse than anchor B in Task Achievement, and why exactly?"

--- ANCHOR A — overall 6.0 (TA 6.0 / CC 6.0 / LR 6.0 / GRA 6.5) ---
Visual: bar chart, weekly hours on social media, watching TV, sport & exercise and reading, by age group (16–24, 25–34, 35–49, 50+), 2023.
"""
The bar chart shows how many hours per week people in four different age groups spent on four leisure activities in 2023. The activities are social media, watching TV, sport and exercise, and reading.

Overall, younger people spent more time on social media, while older people spent more time watching TV. Also, sport and exercise was not very popular in all age groups.

Looking at the younger groups, people aged 16–24 spent about 18 hours a week on social media, which was the highest figure for this group. They watched TV for 8 hours and did sport for 6 hours, but they read for only 2 hours. In the 25–34 group, social media time went down to 12 hours, and TV increased to 10 hours.

For older people, the situation was different. People aged 35–49 watched TV for 13 hours and used social media for only 7 hours. The 50+ group spent the most time on TV, at around 19 hours per week, but only 3 hours on social media. Reading was highest in this group with 7 hours, while sport was lowest at 3 hours.
"""
Why this is a 6 and NOT a 7 — the most important anchor: every figure is accurate, there is an overview and the paragraphs are sensible, and it is still a 6. The overview is thin ("not very popular in all age groups"). The body RECOUNTS figures group by group ("They watched TV for 8 hours and did sport for 6 hours, but they read for only 2 hours") instead of comparing and grouping them; the point where TV overtakes social media is never stated as a feature. Linking is basic and repetitive (Also, but, while, Looking at). Vocabulary is correct but plain and repeated ("spent" again and again, "went down", "did sport") — an adequate range, which is band 6. Sentences are mostly simple or compound with a few relative clauses and one agreement slip. ACCURATE, ERROR-FREE AND NEATLY PARAGRAPHED IS NOT BAND 7 IN TASK 1.

--- ANCHOR B — overall 7.0 (TA 7.0 / CC 7.0 / LR 7.0 / GRA 7.0) ---
Visual: bar chart, spending by France and the UK on cars, computers, books, perfume and cameras, 2010, pounds sterling.
"""
The bar chart compares how much money was spent by France and the UK on five different consumer products in 2010, measured in pounds sterling.
Overall, the UK spent more than France on most of the items, and cars was the biggest category for the both countries. Perfume was the product which people spent the least money on.
In 2010, British consumers spent about 455,000 pounds on cars, while the French figure was slightly lower, at 400,000 pounds. Books also showed a big difference: expenditure in the UK reached 408,000 pounds, compared with only 300,000 pounds in France. The largest gap was in cameras, where the UK spent 360,000 pounds, which is more than twice as high as France, at 150,000 pounds.
On the other hand, France spent more money in two categories. The expenditure on computers was 380,000 pounds in France and 350,000 pounds in the UK. Similarly, French people spent 200,000 pounds on perfume, but this number was only 140,000 pounds in the UK.
"""
Why this is a 7: the overview names the main contrast and the largest category; the body is organised by COMPARISON (where the UK spent more, then where France spent more) and picks out the largest gap. One minor inaccuracy in the overview — perfume was not the lowest item for France (cameras was) — holds Task Achievement at 7. Some less common data vocabulary is used accurately (expenditure, the French figure, the largest gap, more than twice as high, slightly lower), with noticeable repetition of "spent" and "pounds". Grammar mixes relative clauses and "compared with" structures with a few errors ("for the both countries", "twice as high as France"). Band 8 would need precise, varied data language used naturally and key features extended, not just stated.

--- ANCHOR C — overall 6.0 (TA 6.0 / CC 6.0 / LR 5.5 / GRA 6.0) ---
Visual: line graph, international tourist arrivals in Northport, Riverton and Lakeside, 2000–2020, millions.
"""
The line graph gives information about how many international tourists visited three different cities, which are Northport, Riverton and Lakeside, between 2000 and 2020.

Overall, it can be seen that the number of tourists in Northport and Lakeside went up during this period, but Riverton stayed almost the same and then dropped at the end. Also, Northport had the biggest number in 2015.

In 2000, Riverton was the most popular city with 3.5 million tourists, while Northport had 2.1 million and Lakeside had only 0.8 million. After that, Northport increased a lot and reached to 3.9 million in 2010 and 5.2 million in 2015, which was the highest point of all the cities.

For Lakeside, the number of tourists also raised slowly, from 0.8 million to 3.3 million in 2015. However, in 2020 all three cities went down. Northport fell to 3.1 million, Riverton to 2.4 million, and Lakeside to 2.9 million.
"""
Why this is a 6 and NOT a 6.5 or a 7 — the second most important anchor: there is a real overview, the paragraphs are tidy and almost every figure is read correctly, and it is STILL a 6. The body narrates the graph city by city and year by year ("In 2000... After that... For Lakeside... However, in 2020..."); it follows the lines instead of selecting features. Neither crossover is mentioned (Northport passes Riverton between 2005 and 2010; Lakeside passes Riverton between 2015 and 2020), and no gap between the cities is ever quantified, so key features are only adequately covered — band 6, not 7. "also raised slowly" describes a rise from 0.8 to 3.3 million, more than a fourfold increase, as slow: an inaccurate trend claim, minor. Linking is basic and repeated (Also, After that, However, For Lakeside) and the overview is glued on with "Also". Vocabulary keeps returning to "went up", "went down", "the number of tourists", "million", with "a lot" and the errors "reached to" and "raised" for "rose" — an attempt at data language with noticeable inaccuracy, which is Lexical Resource 5.5. Sentences are mostly simple and compound with one or two relative clauses. AN ACCURATE, TIDY, CHRONOLOGICAL NARRATION OF EACH SERIES IN TURN IS BAND 6.

--- ANCHOR D — overall 6.5 (TA 7.0 / CC 6.5 / LR 6.0 / GRA 6.5) ---
Visual: table, average monthly household spending on housing, food, transport and leisure by three income groups, 2022, US dollars.
"""
The table shows how much money households in three income groups spent every month on four categories, which are housing, food, transport and leisure, in 2022.

Overall, high income households spent more money than the other two groups in all categories. Also, housing was the biggest expense for every group, while leisure was the smallest.

Looking at housing, low income families spent $420 per month, while middle income families spent $780. High income households spent much more, at $1,450, which is more than three times the amount of the low income group. Food was the second biggest category. The low income group paid $310 and the middle group paid $450, and the high income group spent $620 on it.

Transport and leisure showed bigger differences between the groups. Low income households spent only $90 on transport, but high income households spent $510. Similarly, leisure spending was just $40 for low income people, compared to $480 for the rich group, which is twelve times more. Middle income households spent $240 on transport and $160 on leisure.
"""
Why this is 6.5 overall — the anchor that shows the criteria PULLING APART: every figure is correct, every superlative holds, and the response really does compare (three times the amount, twelve times more), so Task Achievement earns 7.0 — but that does not carry the other three criteria with it.
- Task Achievement 7.0: clear overview naming the biggest and smallest category and the main contrast; comparisons are quantified as ratios, not just listed. It is not 7.5, because the middle-income figures are added mechanically at the end ("Middle income households spent $240 on transport and $160 on leisure") and nothing is extended beyond stating the gaps.
- Coherence & Cohesion 6.5: the paragraphs are logical and "Similarly", "while", "compared to" are used correctly, but the overview is attached with "Also" and the last sentence is a leftover rather than a conclusion.
- Lexical Resource 6.0: THE KEY POINT. There is not a single lexical error, and it is still a 6. "spent" appears nine times and "paid" twice; the rest is "money", "categories", "much more", "bigger differences". No less common data vocabulary at all — no expenditure, no figure, no accounted for, no gap. And "the rich group" is a register slip in an academic description. No errors + plain, repeated vocabulary = band 6.
- Grammatical Range 6.5: correct throughout, with a few relative clauses, but nearly every sentence follows "X spent $Y, while Z spent $W". Accuracy without variety is 6.5, not 7.5.
ACCURACY IS A TASK ACHIEVEMENT MATTER. IT MUST NOT BE PAID FOR A SECOND AND THIRD TIME IN LEXIS AND GRAMMAR.

How to use the anchors:
- A response that recounts figures one by one like anchor A, or narrates each series in turn like anchor C, has Task Achievement of 6.0–6.5, however accurate it is.
- The test that separates 6 from 7 in Task Achievement: find a sentence in the BODY that puts two series side by side to make a point — a quantified gap, a crossover, a ratio, or two series grouped because they behave alike. A comparison that only appears in the overview does not count. If you cannot quote such a sentence, Task Achievement is 6.0–6.5 and you must say in "why" that the response reports the data rather than comparing it.
- Plain, repeated but correct vocabulary like anchor A is Lexical Resource 6.0–6.5, not 7.
- Award 7.5 or above in any criterion only when the response clearly beats anchor B in that criterion — say in which way in "why". "The data is accurate" is not such a way.
- The four criteria are allowed to diverge, as in anchor D. Strong Task Achievement does not lift Lexical Resource or Grammatical Range with it; a response can be TA 7.0 and LR 6.0 at the same time.

=== FAIRNESS — DEDUCT ONLY WHAT THE DESCRIPTORS PENALISE ===

- Every deduction must be traceable to something specific: a data check, a named key feature that was left out, or a quoted language problem. If you cannot point to it, do not deduct.
- Do not deduct for omitting minor details or most of the reference facts.
- A separate conclusion is not required; an overview in the introduction is enough.
- Giving many figures is not a fault when they are grouped by trend and compared; it is a fault only when figures are listed mechanically without selection.
- Do not count the same weakness twice across criteria.
- Simple but correct vocabulary caps the Lexical Resource ceiling; it does not pull the score into band 5.

=== SCORING DISCIPLINE ===

Assess the four criteria SEPARATELY, each against its own descriptor. Do not form an overall impression first and spread it across four boxes, and do not manufacture a spread either.

IELTS is reported in HALF bands and most real candidates land on them. Band 9 is extremely rare. Band 6 is the most common real score; the realistic range for a motivated learner is 5.5-7.0. The absence of errors is not band 8 — band 8 requires range used naturally and a fully developed response. An inflated score sends the candidate into the exam unprepared; an over-harsh one is an equal error.

"overall" is the mean of the four criteria rounded to the nearest half band.

=== CONSISTENCY CHECK — BEFORE YOU FINALISE ===

- If any data check is "inaccurate", the Task Achievement "why" must name it with the correct value, and neither "why" nor "summary" may describe the figures as fully accurate.
- If the Task Achievement "to_improve" asks for a key feature that is missing from the response — a crossover, the largest gap, the main contrast — then key features were NOT fully covered, and Task Achievement cannot be above 6.5. Do not praise the response for accuracy in "why" and then ask for a missing feature in "to_improve" without that showing in the band.
- A trend claim whose adverb you judged wrong belongs in "data_checks" as "inaccurate", not only in "annotations".
- If "to_improve" names a real present weakness — no overview, a misreported figure, an uncovered key feature, formulaic linking — that weakness must be visible in the band.
- Count how many criteria you put at 7.0 or above. For EACH of them, name the specific way it beats anchor B. If you cannot name one for a criterion, that criterion is below 7.0.
- Data accuracy belongs to Task Achievement ALONE. If your "why" for Coherence, Lexical Resource or Grammatical Range rests on the figures being correct, the reason is wrong — rewrite it around cohesion, range or structures, and lower the band if nothing else supports it.
- 8.5 and 9.0 mean you looked for a substantive weakness in that criterion and found none.
- Do not invent a criticism merely to justify a low number.
${spellingList}

=== WHAT TO PRODUCE ===

For each criterion: the band, a SHORT verbatim quote that justifies it, and what specifically would raise it by half a band.

Every data check marked "inaccurate" is automatically highlighted in the candidate's text, so do NOT repeat those spans in "annotations". Use 4-7 annotations for language, cohesion and other task problems such as a missing comparison or irrelevant opinion. Each annotation's "quote" MUST be copied verbatim, character for character, from the response. Keep quotes short (3-15 words).

In "data_checks", "quote" must also be copied verbatim from the response — the shortest span that contains the claim.

NEVER present correct English as an error. Before writing each annotation ask: is this span actually WRONG, or merely PLAIN?
  - genuinely wrong → state the error directly in "note".
  - correct but improvable → "note" MUST begin with "Xato emas — yaxshilash:" and then explain the stronger option.

${spellingRule}

Write all feedback in Uzbek (latin script), including every "note" and "correct_value". Keep quoted English from the response in English.

Return ONLY valid JSON, no markdown fences, exactly this shape — fill "data_checks" FIRST:
{
  "data_checks": [
    { "quote": "verbatim span from the response", "claim": "what it asserts, briefly", "verdict": "correct", "correct_value": "grafikdagi haqiqiy qiymat", "severity": "minor", "note": "faqat inaccurate bo'lsa: nega noto'g'ri — bir jumlada" }
  ],
  "task_response": 6.0,
  "coherence_cohesion": 6.5,
  "lexical_resource": 5.5,
  "grammatical_range": 6.0,
  "overall": 6.0,
  "summary": "2-3 jumla: eng muhim kuchli tomon va eng muhim zaiflik",
  "criteria_feedback": {
    "task_response":     { "why": "nega aynan shu ball (overview bormi, asosiy xususiyatlar, raqamlar aniqligi)", "evidence": "javobdan qisqa iqtibos", "to_improve": "yarim ball ko'tarish uchun aniq nima qilish kerak" },
    "coherence_cohesion":{ "why": "...", "evidence": "...", "to_improve": "..." },
    "lexical_resource":  { "why": "...", "evidence": "...", "to_improve": "..." },
    "grammatical_range": { "why": "...", "evidence": "...", "to_improve": "..." }
  },
  "annotations": [
    {
      "quote": "verbatim span copied exactly from the response",
      "type": "vocabulary",
      "severity": "medium",
      "fix": "tuzatilgan variant",
      "note": "nega xato — bir jumlada"
    }
  ],
  "next_band": {
    "target": 6.5,
    "actions": ["aniq, bajariladigan qadam 1", "qadam 2", "qadam 3"]
  },
  "strengths": ["aniq kuchli tomon, umumiy maqtov emas"]
}

"verdict" must be one of: correct, approximation, inaccurate.
"type" must be one of: grammar, vocabulary, cohesion, task, spelling.
"severity" in annotations must be one of: high, medium, low; in data_checks one of: minor, major.`
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Faqat POST' }, 405)

  try {
    // ---------------------------------------------------------------
    // 1. Foydalanuvchini aniqlash
    // ---------------------------------------------------------------
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) return json({ error: 'Avval tizimga kiring.' }, 401)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: userData, error: userErr } = await admin.auth.getUser(token)
    const user = userData?.user
    if (userErr || !user) return json({ error: 'Sessiya yaroqsiz. Qayta kiring.' }, 401)

    // ---------------------------------------------------------------
    // 2. Kirish ma'lumotlarini tekshirish
    // ---------------------------------------------------------------
    const body = await req.json().catch(() => null)
    if (!body) return json({ error: "So'rov formati noto'g'ri." }, 400)

    const { promptId, promptText, essay, timeSpent, taskData } = body
    // Eski klientlar taskType yubormaydi — ular faqat Task 2 bilan ishlagan.
    const taskType = body.taskType === 'task1' ? 'task1' : 'task2'
    const isTask1 = taskType === 'task1'
    if (typeof promptText !== 'string' || typeof essay !== 'string') {
      return json({ error: 'promptText va essay matn bo\'lishi kerak.' }, 400)
    }
    // Task 1'ni grafik ma'lumotisiz baholab bo'lmaydi: model raqamlar to'g'ri
    // keltirilganini tekshira olmaydi va Task Achievement taxminga aylanadi.
    if (taskType === 'task1' && (typeof taskData !== 'string' || !taskData.trim())) {
      return json({ error: 'Task 1 uchun grafik ma\'lumoti (taskData) kerak.' }, 400)
    }
    if (typeof taskData === 'string' && taskData.length > 4000) {
      return json({ error: 'Grafik ma\'lumoti juda katta.' }, 400)
    }

    const wordCount = countWords(essay)

    // Imlo tekshiruvini shu yerda BOSHLAYMIZ, lekin kutmaymiz: quyidagi
    // limit so'rovi (baza) bilan parallel ketadi. Natijasi prompt
    // qurilishidan oldin kerak bo'ladi.
    const spellingPromise = wordCount >= MIN_WORDS && wordCount <= MAX_WORDS
      ? findSpellingIssues(essay)
      : Promise.resolve([])

    if (wordCount < MIN_WORDS) {
      return json({ error: `Insho juda qisqa (${wordCount} so'z). Kamida ${MIN_WORDS} so'z yozing.` }, 400)
    }
    if (wordCount > MAX_WORDS) {
      return json({ error: `Insho juda uzun (${wordCount} so'z).` }, 400)
    }

    // ---------------------------------------------------------------
    // 3. Kunlik limit
    // ---------------------------------------------------------------
    // Email JWT'dan emas, bazadagi auth.users yozuvidan olinadi
    // (admin.auth.getUser tokenni serverda tekshirib qaytargan),
    // shuning uchun uni so'rov bilan soxtalashtirib bo'lmaydi.
    const email = (user.email ?? '').toLowerCase()
    const isUnlimited =
      UNLIMITED_USER_IDS.includes(user.id) ||
      envList('UNLIMITED_EMAILS').includes(email) ||
      envList('UNLIMITED_USER_IDS').includes(user.id.toLowerCase())

    // Limit har bir task uchun alohida — Task 1 yozgan odam Task 2 uchun
    // kunlik hisobini yo'qotmasin.
    const { data: attempts } = await admin.rpc('writing_attempts_today', {
      p_user_id: user.id,
      p_task_type: taskType,
    })

    if (!isUnlimited && typeof attempts === 'number' && attempts >= DAILY_LIMIT) {
      return json({
        error: `Kunlik limit tugadi: ${taskType === 'task1' ? 'Task 1' : 'Task 2'} uchun kuniga ${DAILY_LIMIT} ta javob. Ertaga qayta urinib ko'ring.`,
        limitReached: true,
        // Nega limitsiz ro'yxatga tushmagani darrov ko'rinsin.
        // Bu foydalanuvchining O'Z ma'lumoti — sir emas.
        checked: { userId: user.id, email },
      }, 429)
    }

    // ---------------------------------------------------------------
    // 4. Gemini
    // ---------------------------------------------------------------
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return json({
        error: "Server sozlanmagan: GEMINI_API_KEY o'rnatilmagan. Terminalda: supabase secrets set GEMINI_API_KEY=...",
      }, 500)
    }

    // ---------------------------------------------------------------
    // 3.5. Imlo — modelga emas, lug'atga ishonamiz
    // ---------------------------------------------------------------
    const spellingIssues = await spellingPromise

    // Topilgan xatolarni prompt'ga kiritamiz: model ularni bilgan holda
    // Lexical Resource va umumiy ballni qo'ysin. Aks holda model
    // "imlo mukammal" deb hisoblab, ballni oshirib yuboradi.
    const spellingList = spellingIssues.length
      ? `\nA dictionary check has already found ${spellingIssues.length} misspelled word(s) in this essay: ${
          spellingIssues.map((s) => `"${s.quote}" (should be "${s.fix}")`).join(', ')
        }. Factor these into Lexical Resource — spelling is explicitly part of that criterion — but weigh them against the descriptor rather than reacting to their mere presence: band 8 explicitly tolerates RARE spelling errors and band 7 tolerates SOME. One or two slips in an otherwise strong essay must NOT cost a whole band; only errors frequent enough to make the reader work harder do. Do not claim the spelling is accurate.`
      : ''

    // Lug'at ishlayotgan bo'lsa imlo faqat undan keladi (aniqroq).
    // Ishlamasa modelga qaytarib beramiz — aks holda imlo umuman
    // tekshirilmay qolardi.
    const spellingRule = isDictionaryActive()
      ? 'Do NOT produce annotations of type "spelling" — spelling is checked separately by a dictionary and any errors are listed above. Cover grammar, vocabulary, cohesion and task instead.'
      : 'The dictionary check is unavailable for this request, so you must check spelling yourself. Include annotations of type "spelling" for any misspelled word, quoting it exactly as written.'

    // Model nomlari vaqt o'tishi bilan o'zgaradi va eskilari o'chiriladi.
    // Bittasi 404 bersa keyingisiga o'tamiz — sayt to'xtab qolmasin.
    // `gemini-2.5-flash` 2026-yil avgustda yangi foydalanuvchilar uchun
    // yopildi (404 NOT_FOUND) — Google o'rniga 3.6-flash'ni tavsiya qildi.
    // ZAXIRA ZANJIRIDA `gemini-3.5-flash-lite` ATAYLAB YO'Q.
    //
    // 2026-09-23 da shunday bo'ldi: 3.6-flash ham, flash-latest ham 503
    // ("high demand") qaytardi va baholash flash-lite'ga tushdi. U esa
    // xatosiz, lekin oddiy javobga 7.5 qo'ydi — to'g'ri ball 6.5 edi.
    // Foydalanuvchi buni ko'rmaydi: natija tarixga xuddi boshqalari kabi
    // yozilib qoladi.
    //
    // Baholash mahsulotida noto'g'ri ball — xatodan yomonroq. Model
    // topilmasa, "keyinroq urinib ko'ring" deymiz: zanjirda faqat shu
    // vazifani uddalay oladigan modellar turadi.
    const primaryModel = isTask1 ? TASK1_MODEL : TASK2_MODEL
    const MODELS = [primaryModel, TASK2_MODEL, TASK1_MODEL, 'gemini-flash-latest']
      .filter((m, i, all) => all.indexOf(m) === i)

    let geminiJson: any = null
    let usedModel = primaryModel
    let lastError = ''
    let lastStatus = 0

    // Har bir urinishda bir xil so'rov yuboriladi — bir marta tayyorlaymiz.
    // Nomi `geminiBody`, chunki `body` yuqorida so'rov tanasi uchun band.
    //
    // `thinkingLevel` — tezlik va sifat orasidagi asosiy tugma.
    // 'low' da baholash sezilarli tezlashadi, lekin sifat pasayadi:
    // to'rt mezonni mustaqil taqqoslash va band chegarasini to'g'ri
    // tanlash uchun model'ga o'ylash vaqti kerak ekan. Shuning uchun
    // 'medium' — tezlik uchun quyidagi ikki optimizatsiyaga tayanamiz
    // (lug'atni oldindan yuklash + chiqish hajmini qisqartirish).
    const promptText_ = taskType === 'task1'
      ? buildTask1Prompt(promptText, taskData, essay, wordCount, spellingList, spellingRule)
      : buildPrompt(promptText, essay, wordCount, spellingList, spellingRule)
    const buildGeminiBody = (withThinking: boolean) => JSON.stringify({
      contents: [{ parts: [{ text: promptText_ }] }],
      generationConfig: {
        temperature: 0.3,          // baho barqaror bo'lsin
        responseMimeType: 'application/json',
        // Task 1 da baho qo'yish uchun taqqoslash ko'p — chuqurroq o'ylasin.
        ...(withThinking ? { thinkingConfig: { thinkingLevel: isTask1 ? 'high' : 'medium' } } : {}),
      },
    })

    // Eski modellar `thinkingLevel` ni tanimaydi va 400 qaytaradi.
    // Bunday holatda shu paramsiz bir marta qayta yuboramiz — zaxira
    // model tufayli sayt to'xtab qolmasin.
    let geminiBody = buildGeminiBody(true)
    let thinkingRejected = false

    // 503 UNAVAILABLE va 500 — Google tomonidagi vaqtinchalik yuklama.
    // Google hujjatlari bunday holatda qayta urinishni tavsiya qiladi.
    // Kutish vaqti oshib boradi: 1s, 2s, 4s — serverni yanada
    // yuklamaslik uchun (exponential backoff).
    const TRANSIENT = new Set([500, 502, 503, 504])
    const MAX_ATTEMPTS = 3
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

    outer:
    for (const model of MODELS) {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        let res: Response
        try {
          res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
              body: geminiBody,
            },
          )
        } catch (netErr) {
          // Tarmoq uzilishi ham vaqtinchalik — qayta urinamiz
          lastStatus = 0
          lastError = String(netErr)
          console.error(`Tarmoq xatosi [${model}] urinish ${attempt}:`, netErr)
          if (attempt < MAX_ATTEMPTS) { await sleep(1000 * 2 ** (attempt - 1)); continue }
          break
        }

        if (res.ok) {
          geminiJson = await res.json()
          usedModel = model
          if (model !== primaryModel) console.warn(`Zaxira model ishlatildi: ${model}`)
          if (attempt > 1) console.warn(`${attempt}-urinishda muvaffaqiyat`)
          break outer
        }

        lastStatus = res.status
        const detail = await res.text()
        console.error(`Gemini xatosi [${model}] urinish ${attempt}:`, res.status, detail)

        // Google xato JSON'idan tushunarli sababni ajratamiz
        try {
          const parsed = JSON.parse(detail)
          lastError = parsed?.error?.status || parsed?.error?.message || detail.slice(0, 200)
        } catch {
          lastError = detail.slice(0, 200)
        }

        // `thinkingLevel` qo'llab-quvvatlanmasa — shu paramsiz qayta yuboramiz
        if (res.status === 400 && !thinkingRejected && /thinking/i.test(detail)) {
          thinkingRejected = true
          geminiBody = buildGeminiBody(false)
          console.warn(`[${model}] thinkingLevel qabul qilinmadi — paramsiz qayta yuborilmoqda`)
          continue
        }

        // Vaqtinchalik xato — kutib qayta urinamiz. Urinishlar tugasa
        // shu model band demakdir: `break` bilan keyingi modelga o'tamiz
        // (ilgari bu yerda `break outer` bo'lib, zaxira modellar
        // umuman sinalmay qolar edi — 503 to'g'ridan-to'g'ri qaytardi).
        if (TRANSIENT.has(res.status)) {
          if (attempt < MAX_ATTEMPTS) {
            await sleep(1000 * 2 ** (attempt - 1))
            continue
          }
          break
        }

        // 404 — bu model yo'q, keyingi modelga o'tamiz
        if (res.status === 404) break

        // Kalit, ruxsat, kvota xatolari — qayta urinish yordam bermaydi
        break outer
      }
    }

    if (!geminiJson) {
      if (lastStatus === 429) {
        return json({ error: "Kvota tugadi yoki juda ko'p so'rov yuborildi. Bir necha daqiqadan keyin urinib ko'ring." }, 429)
      }
      // Sababni foydalanuvchiga ochiq aytamiz — API kaliti hech qachon
      // xato matniga tushmaydi, faqat Google'ning status kodi va izohi.
      // Vaqtinchalik yuklama — foydalanuvchiga tushunarli tilda aytamiz.
      // Bu yerga yetib kelgan bo'lsak, 3 marta qayta urinib ko'rilgan.
      if (TRANSIENT.has(lastStatus) || lastStatus === 0) {
        return json({
          error: "Google baholash xizmati hozir band. Insho matningiz saqlanib qoldi — 1-2 daqiqadan keyin \"Topshirish\" tugmasini qayta bosing.",
          retryable: true,
        }, 503)
      }

      const hint =
        lastStatus === 400 ? " — GEMINI_API_KEY noto'g'ri ko'rinadi"
        : lastStatus === 403 ? ' — Generative Language API yoqilmagan yoki kalitga ruxsat yo\'q'
        : lastStatus === 404 ? ' — model nomi topilmadi'
        : ''
      return json({ error: `Baholash xizmati xatosi (${lastStatus}${hint}): ${lastError}` }, 502)
    }

    const raw = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!raw) {
      const reason = geminiJson?.candidates?.[0]?.finishReason
      if (reason === 'SAFETY') {
        return json({ error: 'Insho mazmuni xavfsizlik filtridan o\'tmadi. Boshqa mavzuda yozib ko\'ring.' }, 400)
      }
      console.error('Bo\'sh javob:', JSON.stringify(geminiJson).slice(0, 400))
      return json({ error: `Baholash natijasi bo'sh keldi${reason ? ` (${reason})` : ''}.` }, 502)
    }

    let assessment: any
    try {
      assessment = JSON.parse(raw)
    } catch {
      // responseMimeType bo'lsa ham ba'zan ```json bilan o'raladi
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')
      try {
        assessment = JSON.parse(cleaned)
      } catch {
        console.error('JSON parse xatosi:', raw.slice(0, 400))
        return json({ error: 'Baholash natijasini o\'qib bo\'lmadi.' }, 502)
      }
    }

    // Band qiymatlarini 0-9 oralig'iga va 0.5 qadamga keltiramiz —
    // model chegaradan chiqib ketsa baza cheklovi xato bermasin.
    const band = (v: unknown) => {
      const n = Number(v)
      if (!isFinite(n)) return null
      return Math.min(9, Math.max(0, Math.round(n * 2) / 2))
    }

    // Task 1: model har bir raqam va solishtiruvchi da'voni `data_checks` ga
    // yozadi; noto'g'rilari kod bilan matndagi belgiga aylantiriladi —
    // model ularni `annotations` ga qo'shishni unutsa ham (task1-checks.ts).
    const dataChecks = taskType === 'task1' ? normalizeDataChecks(assessment.data_checks, essay) : []
    const taskAnnotations = dataCheckAnnotations(dataChecks)
    const taskQuotes = taskAnnotations.map((a) => a.quote)

    const record = {
      user_id: user.id,
      task_type: taskType,
      prompt_id: typeof promptId === 'string' ? promptId : null,
      prompt_text: promptText,
      essay,
      word_count: wordCount,
      time_spent: Number.isFinite(timeSpent) ? Math.round(timeSpent) : null,
      band_overall: band(assessment.overall),
      band_task: band(assessment.task_response),
      band_coherence: band(assessment.coherence_cohesion),
      band_lexical: band(assessment.lexical_resource),
      band_grammar: band(assessment.grammatical_range),
      feedback: {
        summary: assessment.summary ?? '',
        criteria_feedback: assessment.criteria_feedback ?? {},
        data_checks: dataChecks,
        // Matn ichida belgilash uchun — quote essaydan aynan ko'chirilgan bo'lishi shart.
        // Imlo xatolari lug'atdan keladi (kafolatlangan), qolganlari modeldan.
        annotations: [
          ...spellingIssues,
          ...taskAnnotations,
          ...(Array.isArray(assessment.annotations)
            ? assessment.annotations.filter((a: any) =>
                a && typeof a.quote === 'string'
                // Lug'at ishlayotgan bo'lsa modelning imlo taxminlarini
                // qabul qilmaymiz — u xato aytadi. Lug'at ishlamasa
                // uning imlo annotatsiyalari yagona manba bo'lib qoladi.
                && (isDictionaryActive() ? a.type !== 'spelling' : true)
                && essay.includes(a.quote)
                // Ma'lumot tekshiruvi belgilagan joyni ikkinchi marta belgilamaymiz
                && !overlapsAny(a.quote, taskQuotes))
            : []),
        ],
        spelling_count: spellingIssues.reduce((n, s) => n + s.count, 0),
        next_band: assessment.next_band ?? null,
        strengths: assessment.strengths ?? [],
      },
      model: usedModel,
    }

    // ---------------------------------------------------------------
    // 5. Saqlash
    // ---------------------------------------------------------------
    const { data: saved, error: saveErr } = await admin
      .from('writing_results')
      .insert(record)
      .select()
      .single()

    if (saveErr) {
      console.error('Saqlash xatosi:', saveErr)
      // Baho tayyor — saqlanmasa ham foydalanuvchiga ko'rsatamiz
      return json({ ...record, id: null, saveFailed: true })
    }

    return json({
      ...saved,
      attemptsToday: (attempts ?? 0) + 1,
      // null → UI "bugun 3/5" o'rniga hech narsa ko'rsatmaydi
      dailyLimit: isUnlimited ? null : DAILY_LIMIT,
      unlimited: isUnlimited,
    })

  } catch (err) {
    console.error('Kutilmagan xato:', err)
    return json({ error: 'Serverda kutilmagan xato yuz berdi.' }, 500)
  }
})
