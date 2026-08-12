/**
 * IELTS Writing Task 2 — 5 ta belgilangan to'plam.
 *
 * Reading/Listening kabi har bir to'plam o'zgarmas: foydalanuvchi
 * "Writing Practice 3" ni tanlasa, har safar aynan o'sha mavzu
 * chiqadi. Bu tasodifiy mavzudan afzal, chunki:
 *   - natijalarni to'plam bo'yicha solishtirish mumkin
 *   - "topshirilgan / topshirilmagan" holati mantiqiy bo'ladi
 *   - foydalanuvchi bir mavzuni qayta yozib, o'sishini ko'radi
 *
 * `id` qiymati `test_id` sifatida bazaga yoziladi — o'zgartirmang,
 * aks holda eski natijalar to'plamga bog'lanmay qoladi.
 *
 * Task 2 rasmiy talablari: kamida 250 so'z, 40 daqiqa, Writing
 * ballining taxminan uchdan ikki qismi.
 */

export const WRITING_PACKS = [
  {
    id: 'writing-1',
    number: 1,
    title: 'Writing Practice 1',
    type: 'Discussion + Opinion',
    topic: 'Education',
    difficulty: "O'rta",
    text: 'Some people believe that university students should pay all the costs of their studies themselves, while others think education should be free for everyone. Discuss both views and give your own opinion.',
  },
  {
    id: 'writing-2',
    number: 2,
    title: 'Writing Practice 2',
    type: 'Advantages / Disadvantages',
    topic: 'Work & Technology',
    difficulty: "O'rta",
    text: 'More and more people are working from home rather than in an office. Do the advantages of this development outweigh the disadvantages?',
  },
  {
    id: 'writing-3',
    number: 3,
    title: 'Writing Practice 3',
    type: 'Problem / Solution',
    topic: 'Environment',
    difficulty: 'Qiyin',
    text: 'Many cities suffer from serious air pollution caused by traffic. What are the causes of this problem and what measures could be taken to solve it?',
  },
  {
    id: 'writing-4',
    number: 4,
    title: 'Writing Practice 4',
    type: 'Agree / Disagree',
    topic: 'Society & Health',
    difficulty: "O'rta",
    text: 'In many countries the number of overweight people is increasing. Some argue that governments should control what food companies sell. To what extent do you agree or disagree?',
  },
  {
    id: 'writing-5',
    number: 5,
    title: 'Writing Practice 5',
    type: 'Two-part question',
    topic: 'Culture',
    difficulty: 'Qiyin',
    text: 'Traditional skills and ways of life are disappearing in many countries. Why is this happening? Is it a positive or negative development?',
  },
  {
    id: 'writing-6',
    number: 6,
    title: 'Writing Practice 6',
    type: 'Agree / Disagree',
    topic: 'Education & Technology',
    difficulty: "O'rta",
    text: 'Computers are widely used in education, and some people think that computers will play an important role in the classroom. To what extent do you agree?',
  },
  {
    id: 'writing-7',
    number: 7,
    title: 'Writing Practice 7',
    type: 'Agree / Disagree',
    topic: 'Education',
    difficulty: "O'rta",
    text: 'Many people join distance-learning programs (study material, post, TV, Internet) and study at home, but some people think that it cannot bring the same benefit as attending colleges or universities does. Do you agree or disagree?',
  },
  {
    id: 'writing-8',
    number: 8,
    title: 'Writing Practice 8',
    type: 'Agree / Disagree',
    topic: 'Education & Assessment',
    difficulty: 'Qiyin',
    text: 'Too much emphasis is placed on testing these days. The need to prepare for tests and examinations is a restriction on teachers and also exerts unnecessary pressure on young learners, and they never learn to be creative. To what extent do you agree or disagree?',
  },
]

/** To'plamni id bo'yicha topish */
export function getPromptById(id) {
  return WRITING_PACKS.find((p) => p.id === id) || null
}

/** Eski nom bilan chaqiruvlar buzilmasin */
export const WRITING_TASK2_PROMPTS = WRITING_PACKS
