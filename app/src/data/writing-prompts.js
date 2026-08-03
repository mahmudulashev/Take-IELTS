/**
 * IELTS Writing Task 2 mavzulari.
 *
 * Task 2 rasmiy talablari: kamida 250 so'z, 40 daqiqa, Writing
 * ballining taxminan uchdan ikki qismi.
 *
 * `type` maydoni foydalanuvchiga qanday tuzilma kutilayotganini
 * ko'rsatish uchun — har bir savol turi boshqacha javob talab qiladi.
 */

export const WRITING_TASK2_PROMPTS = [
  {
    id: 'w2-01',
    type: 'Opinion',
    topic: 'Education',
    text: 'Some people believe that university students should pay all the costs of their studies themselves, while others think education should be free for everyone. Discuss both views and give your own opinion.',
  },
  {
    id: 'w2-02',
    type: 'Advantages / Disadvantages',
    topic: 'Technology',
    text: 'More and more people are working from home rather than in an office. Do the advantages of this development outweigh the disadvantages?',
  },
  {
    id: 'w2-03',
    type: 'Problem / Solution',
    topic: 'Environment',
    text: 'Many cities suffer from serious air pollution caused by traffic. What are the causes of this problem and what measures could be taken to solve it?',
  },
  {
    id: 'w2-04',
    type: 'Agree / Disagree',
    topic: 'Society',
    text: 'Some people think that the government should be responsible for looking after elderly citizens, rather than their families. To what extent do you agree or disagree?',
  },
  {
    id: 'w2-05',
    type: 'Discussion',
    topic: 'Work',
    text: 'Some believe that a high salary is the most important factor when choosing a job, while others argue that job satisfaction matters more. Discuss both views and give your own opinion.',
  },
  {
    id: 'w2-06',
    type: 'Opinion',
    topic: 'Health',
    text: 'In many countries the number of overweight people is increasing. Some argue that governments should control what food companies sell. To what extent do you agree or disagree?',
  },
  {
    id: 'w2-07',
    type: 'Two-part question',
    topic: 'Culture',
    text: 'Traditional skills and ways of life are disappearing in many countries. Why is this happening? Is it a positive or negative development?',
  },
  {
    id: 'w2-08',
    type: 'Advantages / Disadvantages',
    topic: 'Travel',
    text: 'International tourism has grown rapidly over the past few decades. Do the benefits of this growth outweigh the drawbacks for the countries that receive tourists?',
  },
  {
    id: 'w2-09',
    type: 'Problem / Solution',
    topic: 'Youth',
    text: 'Young people in many countries spend an increasing amount of time on social media. What problems does this cause, and what can be done to address them?',
  },
  {
    id: 'w2-10',
    type: 'Agree / Disagree',
    topic: 'Crime',
    text: 'Some people believe that prison is not an effective way of reducing crime and that education and training would work better. To what extent do you agree or disagree?',
  },
]

/** Tasodifiy mavzu — har safar yangi test uchun */
export function randomPrompt(excludeId = null) {
  const pool = excludeId
    ? WRITING_TASK2_PROMPTS.filter((p) => p.id !== excludeId)
    : WRITING_TASK2_PROMPTS
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getPromptById(id) {
  return WRITING_TASK2_PROMPTS.find((p) => p.id === id) || null
}
