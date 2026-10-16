/**
 * IELTS Academic Writing Task 1 — 16 ta belgilangan to'plam.
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

// Xarita ranglari darslikdagi xaritaga yaqin: bir xil rang — bir xil turdagi joy
const MAP_COLORS = {
  green: '#A9D063',
  blue: '#8DB3E2',
  pink: '#F19C9C',
  orange: '#F6A33C',
  cyan: '#9FDCEB',
}

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
  {
    id: 'writing-t1-9',
    number: 9,
    task: 'task1',
    title: 'Task 1 Practice 9',
    type: 'Maps',
    topic: 'Urban Development',
    difficulty: 'Qiyin',
    text: `The maps below show the town of Frenton in 1990 and 2012. ${INSTRUCTION}`,
    // Koordinatalar darslikdagi xaritadan olingan (900 × 570, shimol tepada).
    // Bir xil joydagi obyektlar ikki xaritada bir xil to'rtburchakka ega —
    // "nima nimaga aylandi" shundan hisoblanadi (lib/task1-chart.js).
    chart: {
      kind: 'map',
      title: 'Frenton, 1990 and 2012',
      road: { name: 'High Street', from: [615, 0], to: [290, 570], width: 50 },
      maps: [
        {
          label: '1990',
          features: [
            { name: 'School', x: 4, y: 53, w: 248, h: 95, color: MAP_COLORS.blue, use: 'Public services' },
            { name: 'Playing fields with trees', label: 'PLAYING\nFIELDS\nWITH TREES', x: 270, y: 0, w: 240, h: 132, color: MAP_COLORS.green, use: 'Public green space' },
            { name: 'Bank', x: 36, y: 161, w: 177, h: 129, use: 'Shops and business' },
            { name: 'Hospital', x: 290, y: 168, w: 148, h: 75, color: MAP_COLORS.pink, use: 'Public services' },
            { name: 'Library', x: 200, y: 312, w: 177, h: 54, use: 'Public services' },
            { name: 'Trees', x: 4, y: 418, w: 295, h: 86, color: MAP_COLORS.green, use: 'Public green space' },
            { name: 'Café and park', label: 'CAFÉ AND\nPARK', x: 455, y: 160, w: 270, h: 260, shape: 'blob', color: MAP_COLORS.green, use: 'Public green space' },
            { name: 'Houses', x: 727, y: 63, w: 146, h: 403, color: MAP_COLORS.orange, use: 'Housing' },
            { name: 'Theatre', x: 419, y: 436, w: 209, h: 84, use: 'Leisure and entertainment' },
            { name: 'Shops', x: 538, y: 513, w: 357, h: 55, color: MAP_COLORS.cyan, use: 'Shops and business' },
          ],
        },
        {
          label: '2012',
          features: [
            { name: 'School', x: 4, y: 53, w: 248, h: 95, color: MAP_COLORS.blue, use: 'Public services' },
            { name: 'Blocks of flats', label: 'BLOCKS OF\nFLATS', x: 270, y: 0, w: 240, h: 132, use: 'Housing' },
            { name: 'Flats', x: 618, y: 13, w: 112, h: 83, use: 'Housing' },
            { name: 'Restaurant', x: 36, y: 160, w: 208, h: 130, use: 'Shops and business' },
            { name: 'Hospital', x: 272, y: 138, w: 190, h: 164, color: MAP_COLORS.pink, use: 'Public services' },
            { name: 'Library', x: 200, y: 312, w: 177, h: 54, use: 'Public services' },
            { name: 'Technopark', x: 4, y: 418, w: 295, h: 86, use: 'Shops and business' },
            { name: 'Hotel and golf course', label: 'HOTEL AND\nGOLF\nCOURSE', x: 455, y: 160, w: 270, h: 260, shape: 'blob', color: MAP_COLORS.green, use: 'Leisure and entertainment', note: 'still a green area, but now part of a hotel rather than a public park' },
            { name: 'Blocks of flats', label: 'BLOCKS\nOF\nFLATS', x: 727, y: 63, w: 146, h: 403, use: 'Housing' },
            { name: 'Cinema', x: 419, y: 436, w: 209, h: 84, use: 'Leisure and entertainment' },
            { name: 'Supermarket', x: 538, y: 513, w: 357, h: 55, color: MAP_COLORS.cyan, use: 'Shops and business' },
          ],
        },
      ],
    },
  },
  {
    id: 'writing-t1-10',
    number: 10,
    task: 'task1',
    title: 'Task 1 Practice 10',
    type: 'Bar chart',
    topic: 'Economy & Spending',
    difficulty: "O'rta",
    text: `The bar chart shows the proportion of household income spent on four categories in Westland in 2000 and 2020. ${INSTRUCTION}`,
    chart: {
      kind: 'bar',
      title: 'Proportion of household income spent on four categories in Westland, 2000 and 2020',
      unit: '%',
      axisLabel: 'Year',
      // Xarajat turlari ketma-ketlik emas, lekin seriyalar — yillar:
      // asosiy trend har bir tur bo'yicha 2000 → 2020 o'zgarishi
      ordered: false,
      seriesOrdered: true,
      // Darslikdagi grafikda har ustun ustida foiz yozilgan
      valueLabels: true,
      categories: ['Housing', 'Food', 'Transport', 'Entertainment'],
      series: [
        { name: '2000', values: [25, 30, 15, 8], color: '#7F9CC4' },
        { name: '2020', values: [35, 20, 18, 12], color: '#204F78' },
      ],
    },
  },
  {
    id: 'writing-t1-11',
    number: 11,
    task: 'task1',
    title: 'Task 1 Practice 11',
    type: 'Line graph',
    topic: 'Transport',
    difficulty: "O'rta",
    text: `The graph shows the percentage of commuters in Greenfield city who used three main modes of transport to travel to work between 1990 and 2020. ${INSTRUCTION}`,
    chart: {
      kind: 'line',
      title: 'Percentage of commuters in Greenfield city by main mode of transport, 1990–2020',
      unit: '%',
      axisLabel: 'Mode of transport',
      categories: ['1990', '1995', '2000', '2005', '2010', '2015', '2020'],
      series: [
        { name: 'Car', values: [35, 42, 48, 55, 58, 57, 52], color: '#1F4E79' },
        { name: 'Bus', values: [45, 40, 34, 28, 25, 22, 20], color: '#C55A11' },
        { name: 'Bicycle', values: [10, 8, 8, 9, 12, 16, 24], color: '#548235' },
      ],
    },
  },
  {
    id: 'writing-t1-12',
    number: 12,
    task: 'task1',
    title: 'Task 1 Practice 12',
    type: 'Maps',
    topic: 'Village Development',
    difficulty: 'Qiyin',
    text: `The maps below show the village of Westbury in 2005 and 2025. ${INSTRUCTION}`,
    chart: {
      kind: 'map',
      title: 'Westbury, 2005 and 2025',
      road: { name: 'Station Road', from: [0, 290], to: [900, 290], width: 50 },
      maps: [
        {
          label: '2005',
          features: [
            { name: 'Farmland', x: 20, y: 20, w: 280, h: 220, color: MAP_COLORS.green, use: 'Farmland and green space' },
            { name: 'Village hall', label: 'VILLAGE\nHALL', x: 340, y: 60, w: 160, h: 100, use: 'Public services' },
            { name: 'Woodland', x: 560, y: 20, w: 300, h: 220, shape: 'blob', color: MAP_COLORS.green, use: 'Farmland and green space' },
            { name: 'Houses', x: 20, y: 340, w: 220, h: 210, color: MAP_COLORS.orange, use: 'Housing' },
            { name: 'Primary school', label: 'PRIMARY\nSCHOOL', x: 280, y: 340, w: 190, h: 100, color: MAP_COLORS.blue, use: 'Public services' },
            { name: 'Post office', label: 'POST\nOFFICE', x: 280, y: 465, w: 190, h: 85, use: 'Shops and business' },
            { name: 'Car park', x: 510, y: 340, w: 200, h: 110, use: 'Transport' },
            { name: 'Shops', x: 510, y: 480, w: 370, h: 70, color: MAP_COLORS.cyan, use: 'Shops and business' },
          ],
        },
        {
          label: '2025',
          features: [
            { name: 'Housing estate', label: 'HOUSING\nESTATE', x: 20, y: 20, w: 280, h: 220, color: MAP_COLORS.orange, use: 'Housing' },
            { name: 'Village hall', label: 'VILLAGE\nHALL', x: 340, y: 60, w: 160, h: 100, use: 'Public services' },
            { name: 'Medical centre', label: 'MEDICAL\nCENTRE', x: 340, y: 175, w: 160, h: 70, color: MAP_COLORS.pink, use: 'Public services' },
            { name: 'Woodland', x: 670, y: 20, w: 200, h: 220, shape: 'blob', color: MAP_COLORS.green, use: 'Farmland and green space' },
            { name: 'Sports centre', label: 'SPORTS\nCENTRE', x: 540, y: 40, w: 125, h: 180, use: 'Leisure' },
            { name: 'Houses', x: 20, y: 340, w: 220, h: 210, color: MAP_COLORS.orange, use: 'Housing' },
            // Maktab kengayib, pochta joyini egallagan
            { name: 'Primary school', label: 'PRIMARY\nSCHOOL', x: 280, y: 340, w: 190, h: 210, color: MAP_COLORS.blue, use: 'Public services' },
            { name: 'Supermarket', x: 505, y: 340, w: 215, h: 110, color: MAP_COLORS.cyan, use: 'Shops and business' },
            { name: 'Car park', label: 'CAR\nPARK', x: 745, y: 340, w: 135, h: 110, use: 'Transport' },
            { name: 'Shops', x: 510, y: 480, w: 370, h: 70, color: MAP_COLORS.cyan, use: 'Shops and business' },
          ],
        },
      ],
    },
  },
  {
    id: 'writing-t1-13',
    number: 13,
    task: 'task1',
    title: 'Task 1 Practice 13',
    type: 'Bar chart',
    topic: 'Reading & Culture',
    difficulty: "O'rta",
    text: `The bar chart below shows the number of books borrowed from a city library, by type of book, in 2015, 2019 and 2023. ${INSTRUCTION}`,
    chart: {
      kind: 'bar',
      title: 'Books borrowed from a city library by type, 2015–2023',
      unit: 'thousands of loans',
      axisLabel: 'Year',
      // Kitob turlari ketma-ketlik emas, seriyalar esa yillar
      ordered: false,
      seriesOrdered: true,
      categories: ['Fiction', 'Non-fiction', "Children's books", 'E-books'],
      series: [
        { name: '2015', values: [95, 62, 40, 8] },
        { name: '2019', values: [84, 58, 48, 30] },
        { name: '2023', values: [70, 55, 64, 78] },
      ],
    },
  },
  {
    id: 'writing-t1-14',
    number: 14,
    task: 'task1',
    title: 'Task 1 Practice 14',
    type: 'Table',
    topic: 'Food & Health',
    difficulty: "O'rta",
    text: `The table below shows the average amount of four types of food eaten per person each week in one country in 1990, 2005 and 2020. ${INSTRUCTION}`,
    chart: {
      kind: 'table',
      title: 'Average weekly consumption of four types of food per person, 1990–2020',
      unit: 'grams per person per week',
      axisLabel: 'Type of food',
      categories: ['1990', '2005', '2020'],
      series: [
        { name: 'Red meat', values: [820, 690, 540] },
        { name: 'Fish', values: [180, 210, 260] },
        { name: 'Fresh vegetables', values: [1100, 1050, 1230] },
        { name: 'Takeaway food', values: [300, 520, 610] },
      ],
    },
  },
  {
    id: 'writing-t1-15',
    number: 15,
    task: 'task1',
    title: 'Task 1 Practice 15',
    type: 'Bar chart',
    topic: 'Work & Employment',
    difficulty: "O'rta",
    text: `The bar chart below shows the percentage of workers employed in agriculture, industry and services in one country between 1960 and 2000. ${INSTRUCTION}`,
    // Qiymatlar manba grafikdan o'qilgan (unda sarlavha yo'q edi, savol shu
    // ma'lumotga qarab tuzilgan). Har yil yig'indisi taxminan 100.
    chart: {
      kind: 'bar',
      title: 'Percentage of workers employed in three sectors, 1960–2000',
      unit: '%',
      axisLabel: 'Sector',
      categories: ['1960', '1970', '1980', '1990', '2000'],
      series: [
        { name: 'Agriculture', values: [63, 54, 46, 31, 14], color: '#8E4440' },
        { name: 'Industry', values: [16, 21, 25, 25, 25], color: '#B0534D' },
        { name: 'Services', values: [17, 24, 28, 45, 63], color: '#D4A9A6' },
      ],
    },
  },
  {
    id: 'writing-t1-16',
    number: 16,
    task: 'task1',
    title: 'Task 1 Practice 16',
    type: 'Line graph',
    topic: 'Environment & Recycling',
    difficulty: "O'rta",
    text: `The graph below shows the amount of four types of household waste recycled in one city between 2000 and 2020. ${INSTRUCTION}`,
    // Imtihondagi line graph'larga xos xususiyatlar ataylab kiritilgan:
    // cho'qqidan keyin pasayish (Paper), tez o'sish va ikki kesishish
    // (Plastic), barqarorlik (Glass), davr o'rtasida noldan boshlanish (Food).
    chart: {
      kind: 'line',
      title: 'Household waste recycled in one city, 2000–2020',
      unit: 'thousand tonnes',
      axisLabel: 'Type of waste',
      categories: ['2000', '2004', '2008', '2012', '2016', '2020'],
      series: [
        { name: 'Paper', values: [44, 50, 55, 58, 51, 43] },
        { name: 'Plastic', values: [6, 11, 20, 31, 42, 52] },
        { name: 'Glass', values: [24, 27, 23, 26, 24, 25] },
        { name: 'Food waste', values: [0, 0, 5, 14, 22, 29] },
      ],
    },
  },
]
