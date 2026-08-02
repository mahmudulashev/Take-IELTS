import os
import re

APP_DIR = "/Users/mahmudulashev/Desktop/Take IELTS/app"

HEADER_TEMPLATE = '''    <div class="header">
        <div class="timer-container">
            <span class="timer-display">60:00</span>
            <div class="timer-controls">
                <button id="timer-toggle-btn" title="Pause/Resume Timer">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8 5v14l11-7L8 5z"/></svg>
                </button>
                <button id="timer-reset-btn" title="Reset Timer">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                </button>
            </div>
        </div>
        <a href="/dashboard" class="exit-header-btn" style="display:inline-flex;align-items:center;gap:6px;padding:6px 16px;background:#FFF0F0;color:#FF3131;border:1.5px solid #FF3131;border-radius:9999px;font-weight:700;font-size:13px;text-decoration:none;transition:all 0.2s;">← Exit to Dashboard</a>
    </div>'''

PASSAGE_HEADER_CONTAINER = '''        <div id="passage-header-container">
            <div id="part-header-1" class="part-header">
                <p><strong>Part 1</strong></p>
                <p>Read the text and answer questions 1-13.</p>
            </div>
            <div id="part-header-2" class="part-header hidden">
                <p><strong>Part 2</strong></p>
                <p>Read the text and answer questions 14-26.</p>
            </div>
            <div id="part-header-3" class="part-header hidden">
                <p><strong>Part 3</strong></p>
                <p>Read the text and answer questions 27-40.</p>
            </div>
        </div>'''

NAV_ARROWS_MARKUP = '''    <div class="nav-arrows">
        <button class="nav-arrow prev" id="prev-btn" onclick="previousQuestion()">❮</button>
        <button class="nav-arrow next" id="next-btn" onclick="nextQuestion()">❯</button>
    </div>'''

HEAD_LINKS = '''    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/test.css">
    <script src="/js/mobile-test-helper.js" defer></script>'''

TIMER_JS_CODE = '''
        // --- TIMER & NAVIGATION FUNCTIONALITY ---
        let timeInSeconds = 3600;
        let timerInterval = null;
        const timerDisplay = document.querySelector('.timer-display');
        const timerToggleButton = document.getElementById('timer-toggle-btn');
        const timerResetButton = document.getElementById('timer-reset-btn');

        const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8 5v14l11-7L8 5z"/></svg>`;
        const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

        function startTimer() {
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timeInSeconds--;
                if (timeInSeconds < 0) timeInSeconds = 0;
                const minutes = Math.floor(timeInSeconds / 60);
                const seconds = timeInSeconds % 60;
                if (timerDisplay) {
                    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
                if (timeInSeconds <= 0) {
                    clearInterval(timerInterval);
                    if (timerDisplay) timerDisplay.textContent = "Time's up!";
                }
            }, 1000);
            if (timerToggleButton) timerToggleButton.innerHTML = pauseIcon;
        }

        function pauseTimer() {
            clearInterval(timerInterval);
            if (timerToggleButton) timerToggleButton.innerHTML = playIcon;
        }

        function toggleTimer() {
            if (timerToggleButton && timerToggleButton.innerHTML.includes('M6 19h4V5H6v14z')) {
                pauseTimer();
            } else {
                startTimer();
            }
        }

        function resetTimer() {
            timeInSeconds = 3600;
            const minutes = Math.floor(timeInSeconds / 60);
            const seconds = timeInSeconds % 60;
            if (timerDisplay) {
                timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            startTimer();
        }

        function previousQuestion() {
            if (typeof currentQuestion !== 'undefined' && currentQuestion > 1) {
                goToQuestion(currentQuestion - 1);
            }
        }

        function nextQuestion() {
            if (typeof currentQuestion !== 'undefined' && currentQuestion < 40) {
                goToQuestion(currentQuestion + 1);
            }
        }

        window.previousQuestion = previousQuestion;
        window.nextQuestion = nextQuestion;
        window.toggleTimer = toggleTimer;
        window.resetTimer = resetTimer;

        document.addEventListener('DOMContentLoaded', () => {
            if (timerToggleButton) timerToggleButton.addEventListener('click', toggleTimer);
            if (timerResetButton) timerResetButton.addEventListener('click', resetTimer);
            startTimer();
        });
'''

def process_file(filename):
    filepath = os.path.join(APP_DIR, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Head Links
    if 'fonts.googleapis.com' not in content:
        content = content.replace('<head>', f'<head>\n{HEAD_LINKS}')

    if '/css/test.css' not in content:
        content = content.replace('</head>', f'    <link rel="stylesheet" href="/css/test.css">\n    <script src="/js/mobile-test-helper.js" defer></script>\n</head>')

    # 2. Update Font Family
    content = content.replace("font-family: Arial, sans-serif;", "font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif;")
    content = content.replace("font-family: 'Plus Jakarta Sans', Arial, sans-serif;", "font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif;")

    # 3. Replace Header
    content = re.sub(r'<div class="header">.*?</div>', HEADER_TEMPLATE, content, flags=re.DOTALL)

    # 4. Insert Passage Header Container if missing
    if 'id="passage-header-container"' not in content:
        content = re.sub(r'(<div class="main-container"[^>]*>)', r'\1\n' + PASSAGE_HEADER_CONTAINER, content)

    # 5. Insert Nav Arrows if missing
    if 'class="nav-arrows"' not in content:
        content = content.replace('<nav class="nav-row"', f'{NAV_ARROWS_MARKUP}\n    <nav class="nav-row"')

    # 6. Update Footer Tab Labels: Passage 1 -> Part 1
    content = re.sub(r'Passage <span class="sectionNr">(\d+)</span>', r'<span class="section-prefix">Part </span><span class="sectionNr">\1</span>', content)

    # 7. Add Timer JS logic if timer-toggle-btn listener or startTimer missing
    if 'startTimer()' not in content:
        content = content.replace('</script>\n</body>', f'{TIMER_JS_CODE}\n</script>\n</body>')
        content = content.replace('</script>\n </body>', f'{TIMER_JS_CODE}\n</script>\n</body>')

    # Update switchToPassage or switchToPart to sync part-header active state
    if 'part-header-' in content:
        old_switch = "document.getElementById('passage-' + n).classList.add('active');"
        new_switch = "document.getElementById('passage-' + n).classList.add('active');\n            [1, 2, 3].forEach(p => { const ph = document.getElementById('part-header-' + p); if (ph) ph.classList.toggle('hidden', p !== n); });"
        if old_switch in content:
            content = content.replace(old_switch, new_switch)
        
        old_switch_part = "document.getElementById('passage-text-' + n).classList.remove('hidden');"
        new_switch_part = "document.getElementById('passage-text-' + n).classList.remove('hidden');\n            [1, 2, 3].forEach(p => { const ph = document.getElementById('part-header-' + p); if (ph) ph.classList.toggle('hidden', p !== n); });"
        if old_switch_part in content:
            content = content.replace(old_switch_part, new_switch_part)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Successfully processed {filename}")

for i in [2, 3, 4, 5]:
    process_file(f"reading-test-{i}.html")
