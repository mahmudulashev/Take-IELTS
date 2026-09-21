/**
 * IELTS Academic Writing Task 1 — 8 ta belgilangan to'plam.
 *
 * Task 2 to'plamlaridan farqi: har birida `chart` bor. Grafik rasm emas,
 * shu ma'lumotdan chiziladi (components/writing/Task1Chart.jsx), AI
 * baholovchiga ham aynan shu raqamlar matn ko'rinishida yuboriladi
 * (lib/task1-chart.js → chartToText). Ma'lumotni o'zgartirsangiz,
 * ekrandagi grafik ham, baholash ham birga o'zgaradi.
 *
 * Ma'lumotlar mashq uchun o'ylab topilgan — real statistika emas.
 * Shahar nomlari ham shartli.
 *
 * `id` bazaga `prompt_id` sifatida yoziladi — o'zgartirmang.
 * `writing-t1-` prefiksi Task 2 id'lari bilan to'qnashmaslik uchun.
 *
 * Task 1 rasmiy talablari: kamida 150 so'z, 20 daqiqa.
 *
 * Yangi to'plam qo'shganda shu sarlavhadagi sonni ham yangilang.
 */

const INSTRUCTION =
  'Summarise the information by selecting and reporting the main features, and make comparisons where relevant.'

export const WRITING_TASK1_PACKS = [
  {
    id: 'writing-t1-1',
    number: 1,
    task: 'task1',
    title: 'Task 1 Practice 1',
    type: 'Bar chart',
    topic: 'Lifestyle & Leisure',
    difficulty: "O'rta",
    text: `The bar chart shows the average number of hours per week that people in four age groups spent on four leisure activities in 2023. ${INSTRUCTION}`,
    chart: {
      kind: 'bar',
      title: 'Average weekly time spent on leisure activities, by age group (2023)',
      unit: 'hours per week',
      axisLabel: 'Activity',
      categories: ['16–24', '25–34', '35–49', '50+'],
      series: [
        { name: 'Social media', values: [18, 12, 7, 3] },
        { name: 'Watching TV', values: [8, 10, 13, 19] },
        { name: 'Sport & exercise', values: [6, 5, 4, 3] },
        { name: 'Reading', values: [2, 3, 4, 7] },
      ],
    },
  },
  {
    id: 'writing-t1-2',
    number: 2,
    task: 'task1',
    title: 'Task 1 Practice 2',
    type: 'Line graph',
    topic: 'Tourism',
    difficulty: "O'rta",
    text: `The graph below shows the number of international tourists who visited three cities between 2000 and 2020. ${INSTRUCTION}`,
    chart: {
      kind: 'line',
      title: 'International tourist arrivals in three cities, 2000–2020',
      unit: 'millions',
      axisLabel: 'City',
      categories: ['2000', '2005', '2010', '2015', '2020'],
      series: [
        { name: 'Northport', values: [2.1, 2.8, 3.9, 5.2, 3.1] },
        { name: 'Riverton', values: [3.5, 3.6, 3.4, 3.8, 2.4] },
        { name: 'Lakeside', values: [0.8, 1.2, 2.0, 3.3, 2.9] },
      ],
    },
  },
  {
    id: 'writing-t1-3',
    number: 3,
    task: 'task1',
    title: 'Task 1 Practice 3',
    type: 'Pie charts',
    topic: 'Energy',
    difficulty: 'Qiyin',
    text: `The pie charts compare the sources of electricity generated in one country in 2000 and 2020. ${INSTRUCTION}`,
    chart: {
      kind: 'pie',
      title: 'Sources of electricity generation, 2000 and 2020',
      unit: '%',
      pies: [
        {
          label: '2000',
          slices: [
            { name: 'Coal', value: 52 },
            { name: 'Natural gas', value: 25 },
            { name: 'Nuclear', value: 13 },
            { name: 'Hydroelectric', value: 7 },
            { name: 'Solar & wind', value: 3 },
          ],
        },
        {
          label: '2020',
          slices: [
            { name: 'Coal', value: 21 },
            { name: 'Natural gas', value: 34 },
            { name: 'Nuclear', value: 11 },
            { name: 'Hydroelectric', value: 8 },
            { name: 'Solar & wind', value: 26 },
          ],
        },
      ],
    },
  },
  {
    id: 'writing-t1-4',
    number: 4,
    task: 'task1',
    title: 'Task 1 Practice 4',
    type: 'Table',
    topic: 'Economy & Households',
    difficulty: 'Qiyin',
    text: `The table gives information about the average amount of money that households in three income groups spent each month on four categories in 2022. ${INSTRUCTION}`,
    chart: {
      kind: 'table',
      title: 'Average monthly household spending by income group (2022)',
      unit: 'US dollars',
      axisLabel: 'Category',
      categories: ['Low income', 'Middle income', 'High income'],
      series: [
        { name: 'Housing', values: [420, 780, 1450] },
        { name: 'Food', values: [310, 450, 620] },
        { name: 'Transport', values: [90, 240, 510] },
        { name: 'Leisure', values: [40, 160, 480] },
      ],
    },
  },
  {
    id: 'writing-t1-5',
    number: 5,
    task: 'task1',
    title: 'Task 1 Practice 5',
    type: 'Bar chart',
    topic: 'Economy & Spending',
    difficulty: "O'rta",
    text: `The chart below shows the expenditure of two countries on consumer goods in 2010. ${INSTRUCTION}`,
    chart: {
      kind: 'bar',
      title: 'Expenditure of two countries on consumer goods (2010)',
      unit: 'pounds sterling',
      axisLabel: 'Country',
      // Mahsulotlar ketma-ketlik emas — trend faktlari hisoblanmaydi
      ordered: false,
      categories: ['Cars', 'Computers', 'Books', 'Perfume', 'Cameras'],
      series: [
        { name: 'France', values: [400000, 380000, 300000, 200000, 150000], color: '#4A9BD9' },
        { name: 'UK', values: [450000, 350000, 400000, 140000, 360000], color: '#F47B20' },
      ],
    },
  },
  {
    id: 'writing-t1-6',
    number: 6,
    task: 'task1',
    title: 'Task 1 Practice 6',
    type: 'Line graph',
    topic: 'Education',
    difficulty: "O'rta",
    text: `The line graph below shows the number of students enrolled in three types of university course in one country between 2005 and 2025. ${INSTRUCTION}`,
    chart: {
      kind: 'line',
      title: 'University enrolments by subject area, 2005–2025',
      unit: 'thousands of students',
      axisLabel: 'Subject area',
      categories: ['2005', '2010', '2015', '2020', '2025'],
      series: [
        { name: 'Business', values: [42, 48, 55, 51, 46] },
        { name: 'Engineering', values: [30, 33, 38, 47, 58] },
        { name: 'Arts & humanities', values: [38, 35, 31, 26, 20] },
      ],
    },
  },
  {
    id: 'writing-t1-7',
    number: 7,
    task: 'task1',
    title: 'Task 1 Practice 7',
    type: 'Bar chart',
    topic: 'Transport',
    difficulty: 'Qiyin',
    text: `The bar chart below shows the percentage of daily journeys made by four means of transport in one city in 1995, 2005, 2015 and 2025. ${INSTRUCTION}`,
    chart: {
      kind: 'bar',
      title: 'Share of daily journeys by means of transport, 1995–2025',
      unit: '%',
      axisLabel: 'Means of transport',
      categories: ['1995', '2005', '2015', '2025'],
      series: [
        { name: 'Car', values: [52, 58, 49, 38] },
        { name: 'Bus', values: [26, 20, 18, 17] },
        { name: 'Cycling', values: [8, 6, 13, 24] },
        { name: 'Walking', values: [14, 16, 20, 21] },
      ],
    },
  },
  {
    id: 'writing-t1-8',
    number: 8,
    task: 'task1',
    title: 'Task 1 Practice 8',
    type: 'Table',
    topic: 'Housing',
    difficulty: 'Qiyin',
    text: `The table below gives information about the average monthly rent for a two-bedroom flat in four cities in 2015, 2020 and 2025. ${INSTRUCTION}`,
    chart: {
      kind: 'table',
      title: 'Average monthly rent for a two-bedroom flat, 2015–2025',
      unit: 'US dollars',
      axisLabel: 'City',
      categories: ['2015', '2020', '2025'],
      series: [
        { name: 'Northport', values: [620, 810, 1180] },
        { name: 'Riverton', values: [540, 700, 905] },
        { name: 'Lakeside', values: [480, 520, 610] },
        { name: 'Eastvale', values: [700, 690, 640] },
      ],
    },
  },
]
