/**
 * Apple uslubidagi scroll animatsiya komponentlari
 * ================================================
 *
 * Hammasi bitta qoidaga bo'ysunadi: faqat `transform` va `opacity`
 * animatsiya qilinadi. Bu ikkisi kompozitor oqimida ishlaydi —
 * layout ham, paint ham qayta hisoblanmaydi.
 *
 * Har bir komponent GSAP'ni DINAMIK yuklaydi (motion-engine.js
 * orqali), shuning uchun bu fayl import qilinmagan sahifalarga
 * hech qanday og'irlik tushmaydi.
 *
 * prefers-reduced-motion yoqilgan bo'lsa — hech qanday animatsiya
 * ishlamaydi, kontent darhol to'liq ko'rinadi.
 */
import React, { useEffect, useRef, useState } from 'react'
import { loadGsap, prefersReducedMotion, startSmoothScroll } from '../../lib/motion-engine'

/* ------------------------------------------------------------------
   useSmoothScroll — Lenis inertial scroll'ni shu sahifada yoqadi

   Sahifa tark etilganda o'chiriladi, ya'ni Dashboard'da yoqib,
   test sahifasiga o'tganda avtomatik so'nadi.
   ------------------------------------------------------------------ */
export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    let stop = null
    let cancelled = false

    startSmoothScroll().then((fn) => {
      if (cancelled) { fn && fn(); return }
      stop = fn
    })

    return () => {
      cancelled = true
      stop && stop()
    }
  }, [enabled])
}

/* ------------------------------------------------------------------
   Reveal — element ekranga kirganda ochiladi
   ------------------------------------------------------------------ */
export function Reveal({
  children,
  as: Tag = 'div',
  y = 40,
  scale = 1,
  delay = 0,
  duration = 0.9,
  start = 'top 85%',
  className = '',
  ...rest
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    let ctx
    let cancelled = false

    loadGsap().then((engine) => {
      if (!engine || cancelled || !ref.current) return
      const { gsap } = engine

      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { opacity: 0, y, scale },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration,
            delay,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start, once: true }
          }
        )
      }, el)
    })

    return () => {
      cancelled = true
      ctx && ctx.revert()
    }
  }, [y, scale, delay, duration, start])

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}

/* ------------------------------------------------------------------
   RevealGroup — ichidagi bolalar ketma-ket ochiladi
   ------------------------------------------------------------------ */
export function RevealGroup({
  children,
  stagger = 0.12,
  y = 40,
  start = 'top 85%',
  className = '',
  childSelector = ':scope > *',
  ...rest
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    let ctx
    let cancelled = false

    loadGsap().then((engine) => {
      if (!engine || cancelled || !ref.current) return
      const { gsap } = engine

      const items = el.querySelectorAll(childSelector)
      if (!items.length) return

      ctx = gsap.context(() => {
        gsap.fromTo(
          items,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger,
            scrollTrigger: { trigger: el, start, once: true }
          }
        )
      }, el)
    })

    return () => {
      cancelled = true
      ctx && ctx.revert()
    }
  }, [stagger, y, start, childSelector])

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------
   SplitReveal — matn so'z-ba-so'z ko'tarilib chiqadi

   GSAP'ning SplitText plagini o'rniga oddiy split ishlatilgan:
   bog'liqlik kamroq, natija deyarli bir xil. Har bir so'z
   `overflow:hidden` ichida turadi va pastdan ko'tariladi —
   Apple sarlavhalaridagi effekt shu.
   ------------------------------------------------------------------ */
export function SplitReveal({
  text,
  as: Tag = 'h1',
  className = '',
  wordClassName = '',
  delay = 0,
  stagger = 0.055,
  start = 'top 88%',
  ...rest
}) {
  const ref = useRef(null)
  const words = String(text).split(' ')

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    let ctx
    let cancelled = false

    loadGsap().then((engine) => {
      if (!engine || cancelled || !ref.current) return
      const { gsap } = engine

      const inner = el.querySelectorAll('[data-word-inner]')
      if (!inner.length) return

      ctx = gsap.context(() => {
        gsap.fromTo(
          inner,
          { yPercent: 115, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            ease: 'power4.out',
            stagger,
            delay,
            scrollTrigger: { trigger: el, start, once: true }
          }
        )
      }, el)
    })

    return () => {
      cancelled = true
      ctx && ctx.revert()
    }
  }, [text, delay, stagger, start])

  const reduced = typeof window !== 'undefined' && prefersReducedMotion()

  return (
    <Tag ref={ref} className={className} {...rest}>
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: '0.08em' }}
        >
          <span
            data-word-inner
            className={'inline-block ' + wordClassName}
            style={reduced ? undefined : { willChange: 'transform' }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </Tag>
  )
}

/* ------------------------------------------------------------------
   Parallax — scroll bilan sekinroq/tezroq siljiydi
   ------------------------------------------------------------------ */
export function Parallax({
  children,
  speed = 0.25,
  className = '',
  ...rest
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    let ctx
    let cancelled = false

    loadGsap().then((engine) => {
      if (!engine || cancelled || !ref.current) return
      const { gsap } = engine

      ctx = gsap.context(() => {
        gsap.to(el, {
          yPercent: -speed * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            // scrub: animatsiya scroll pozitsiyasiga BOG'LANADI,
            // ya'ni orqaga scroll qilinsa orqaga qaytadi
            scrub: 0.6
          }
        })
      }, el)
    })

    return () => {
      cancelled = true
      ctx && ctx.revert()
    }
  }, [speed])

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }} {...rest}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------
   PinnedScene — seksiya ekranda "yopishib" turadi va ichidagi
   kontent scroll bilan sinxron o'zgaradi. Apple sahifalaridagi
   asosiy priyom shu.

   children — funksiya: (progress: 0..1) => JSX
   ------------------------------------------------------------------ */
export function PinnedScene({
  children,
  height = '260vh',
  className = '',
  ...rest
}) {
  const wrapRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = wrapRef.current
    if (!el || prefersReducedMotion()) {
      setProgress(1)
      return
    }

    let ctx
    let cancelled = false

    loadGsap().then((engine) => {
      if (!engine || cancelled || !wrapRef.current) return
      const { gsap } = engine

      ctx = gsap.context(() => {
        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            onUpdate: (self) => setProgress(self.progress)
          }
        })
      }, el)
    })

    return () => {
      cancelled = true
      ctx && ctx.revert()
    }
  }, [])

  return (
    <section ref={wrapRef} style={{ height }} className={className} {...rest}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {typeof children === 'function' ? children(progress) : children}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------
   CountUp — raqam ekranga kirganda sanaladi
   ------------------------------------------------------------------ */
export function CountUp({
  to = 0,
  decimals = 0,
  duration = 1.6,
  suffix = '',
  prefix = '',
  className = '',
  ...rest
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const target = Number(to) || 0

    if (prefersReducedMotion()) {
      el.textContent = prefix + target.toFixed(decimals) + suffix
      return
    }

    let ctx
    let cancelled = false

    loadGsap().then((engine) => {
      if (!engine || cancelled || !ref.current) return
      const { gsap } = engine

      ctx = gsap.context(() => {
        const obj = { v: 0 }
        gsap.to(obj, {
          v: target,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            if (ref.current) {
              ref.current.textContent = prefix + obj.v.toFixed(decimals) + suffix
            }
          },
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        })
      }, el)
    })

    return () => {
      cancelled = true
      ctx && ctx.revert()
    }
  }, [to, decimals, duration, suffix, prefix])

  // Boshlang'ich qiymat — JS ishlamasa ham raqam ko'rinadi
  return (
    <span ref={ref} className={className} {...rest}>
      {prefix}
      {(Number(to) || 0).toFixed(decimals)}
      {suffix}
    </span>
  )
}
