import { useEffect, useRef } from 'react'

/**
 * Ochiluvchi ro'yxatni tashqariga bosilganda yopadi.
 *
 * Ilgari ikkala ro'yxat uchun bitta effekt sahifada turardi va ularning
 * ref'lari ham sahifa darajasida edi. Endi har bir ro'yxat o'zini o'zi
 * yopadi — sahifa bu haqda bilishi shart emas.
 */
export function useClickOutside(onOutside) {
  const ref = useRef(null)
  const handler = useRef(onOutside)
  handler.current = onOutside

  useEffect(() => {
    function handle(event) {
      if (ref.current && !ref.current.contains(event.target)) handler.current()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return ref
}
