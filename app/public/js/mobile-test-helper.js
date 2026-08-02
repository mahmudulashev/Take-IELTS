/**
 * Mobile Test Layout Helper
 * Telefondan kirganda (<= 768px) Matn va Savollar o'rtasida 100% sig'imli tab almashishni va Part 1, 2, 3 o'tishni boshqaradi.
 */
document.addEventListener('DOMContentLoaded', () => {
  initMobileTestTabs()
})

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initMobileTestTabs()
}

function initMobileTestTabs() {
  if (document.getElementById('mobile-test-tabs')) return

  const mainContainer = document.querySelector('.main-container') || 
                        document.querySelector('.test-main') || 
                        document.querySelector('.panels-container') || 
                        document.getElementById('panels-container')

  if (!mainContainer) return

  // Boshlang'ich holatda Matn (Passage) ko'rinadi
  mainContainer.classList.add('show-passage')

  // Mobile Tabs barini yaratish
  const tabsBar = document.createElement('div')
  tabsBar.id = 'mobile-test-tabs'
  tabsBar.className = 'mobile-test-tabs'
  tabsBar.innerHTML = `
    <button type="button" class="mobile-test-tab-btn active" id="mobile-tab-passage">
      📖 Matn (Passage)
    </button>
    <button type="button" class="mobile-test-tab-btn" id="mobile-tab-questions">
      ❓ Savollar (Questions)
    </button>
  `

  // Main container boshiga joylashtirish
  mainContainer.parentNode.insertBefore(tabsBar, mainContainer)

  const passageBtn = document.getElementById('mobile-tab-passage')
  const questionsBtn = document.getElementById('mobile-tab-questions')

  if (passageBtn && questionsBtn) {
    passageBtn.addEventListener('click', () => {
      mainContainer.classList.remove('show-questions')
      mainContainer.classList.add('show-passage')
      passageBtn.classList.add('active')
      questionsBtn.classList.remove('active')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })

    questionsBtn.addEventListener('click', () => {
      mainContainer.classList.remove('show-passage')
      mainContainer.classList.add('show-questions')
      questionsBtn.classList.add('active')
      passageBtn.classList.remove('active')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  // Part 1, 2, 3 tugmalari bosilganda sahifani tepaga silliq skroll qilish
  document.addEventListener('click', (e) => {
    const partBtn = e.target.closest('.footer__questionNo___3WNct') || e.target.closest('.footer__questionWrapper___1tZ46')
    if (partBtn && window.innerWidth <= 768) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 50)
    }
  })
}
