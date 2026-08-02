/**
 * motion-engine.js — GSAP + Lenis uchun yagona kirish nuqtasi
 * ==========================================================
 *
 * NEGA BUNDAY QILINGAN:
 *
 * GSAP + ScrollTrigger + Lenis birgalikda ~37 KB gzip. Agar ular
 * oddiy `import` bilan ulansa, bu og'irlik BARCHA sahifalarga,
 * jumladan test sahifalariga ham tushadi. Shuning uchun bu yerda
 * faqat DINAMIK import ishlatiladi: kutubxona birinchi marta
 * kerak bo'lganda yuklanadi va keyin keshlanadi.
 *
 * Natijada Vite alohida chunk yaratadi va u faqat animatsiyali
 * sahifa ochilganda tarmoqdan keladi.
 *
 * MUHIM: bu fayldan hech qachon to'g'ridan-to'g'ri `gsap` yoki
 * `lenis` ni statik import qilmang — aks holda chunk ajratish
 * buziladi va hamma sahifa og'irlashadi.
 */

let enginePromise = null
let lenisInstance = null

/** Foydalanuvchi harakatni kamaytirishni so'raganmi? */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Sensorli/kuchsiz qurilmami? Bunday qurilmalarda og'ir sahnalarni yoqmaymiz. */
export function isLowPowerDevice() {
  if (typeof navigator === 'undefined') return false
  const cores = navigator.hardwareConcurrency || 8
  const mem = navigator.deviceMemory || 8
  return cores <= 4 || mem <= 4
}

/**
 * GSAP + ScrollTrigger ni yuklaydi (bir marta).
 * @returns {Promise<{gsap: any, ScrollTrigger: any} | null>}
 */
export async function loadGsap() {
  if (prefersReducedMotion()) return null

  if (!enginePromise) {
    enginePromise = (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger')
      ])
      gsap.registerPlugin(ScrollTrigger)

      // Barcha animatsiyalar uchun umumiy standart
      gsap.defaults({ ease: 'power3.out', duration: 0.9 })

      return { gsap, ScrollTrigger }
    })()
  }

  return enginePromise
}

/**
 * Lenis inertial scroll'ni ishga tushiradi va GSAP ticker'iga ulaydi.
 *
 * Ikkalasini bitta ticker'da yuritish shart: aks holda scroll
 * pozitsiyasi va ScrollTrigger hisob-kitobi bir kadrga farq qilib,
 * "kechikkan" hissi paydo bo'ladi.
 *
 * @returns {Promise<() => void>} tozalash funksiyasi
 */
export async function startSmoothScroll() {
  if (prefersReducedMotion()) return () => {}
  if (lenisInstance) return () => {}

  const engine = await loadGsap()
  if (!engine) return () => {}
  const { gsap, ScrollTrigger } = engine

  const { default: Lenis } = await import('lenis')

  lenisInstance = new Lenis({
    duration: 1.1,
    // Apple'ga xos "og'ir, lekin tez to'xtaydigan" egri chiziq
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // Sensorli ekranlarda tabiiy scroll qoladi — smooth scroll
    // telefonlarda ko'pincha noqulay va batareyani yeydi
    smoothTouch: false,
    touchMultiplier: 1.6
  })

  lenisInstance.on('scroll', ScrollTrigger.update)

  const raf = (time) => lenisInstance && lenisInstance.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(raf)
    if (lenisInstance) {
      lenisInstance.destroy()
      lenisInstance = null
    }
  }
}

/** Lenis faol bo'lsa, unga ma'lum bir joyga silliq o'tishni buyuradi */
export function scrollTo(target, options = {}) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { duration: 1.2, ...options })
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }
}

/**
 * Sahifa almashganda chaqiriladi — ScrollTrigger o'lchovlarini
 * yangilaydi. Busiz yangi sahifada triggerlar eski balandlikka
 * qarab ishlaydi va noto'g'ri joyda otiladi.
 */
export async function refreshTriggers() {
  const engine = await loadGsap()
  if (engine) engine.ScrollTrigger.refresh()
}
