import re

# We will read transcript using grep or python line reading from transcript.jsonl
import json

transcript_path = '/Users/mahmudulashev/.gemini/antigravity/brain/e3e3fa80-3506-407b-ae4a-77888acd60be/.system_generated/logs/transcript.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

user_texts = []
for line in lines:
    try:
        data = json.loads(line)
        if data.get('type') == 'USER_INPUT' or data.get('source') == 'USER_EXPLICIT':
            content = data.get('content', '')
            if '<!DOCTYPE html>' in content:
                user_texts.append(content)
    except Exception:
        pass

if user_texts:
    last_text = user_texts[-1]
    blocks = re.findall(r'<!DOCTYPE html>.*?(?=<!DOCTYPE html>|$)', last_text, re.DOTALL)
    print(f"Extracted {len(blocks)} HTML blocks from transcript.jsonl")

    # Block 0 is "Spider silk" (Already reading-test.html) -> SKIP
    # Block 1 is "Prosopagnosia" -> reading-test-3.html
    # Block 2 is "The rise and fall of detective stories" -> reading-test-4.html
    # Block 3 is "The development of the silk industry" -> reading-test-5.html

    def make_reading_file(raw_html, num, test_id):
        # Apply standard styles & header
        cleaned = raw_html

        new_header = '''<div class="header">
            <div class="part-indicator" id="part-indicator">Reading Passage 1</div>
            <a href="/dashboard" class="exit-header-btn" style="display:inline-flex;align-items:center;gap:6px;padding:6px 16px;background:#FFF0F0;color:#FF3131;border:1.5px solid #FF3131;border-radius:9999px;font-weight:700;font-size:13px;text-decoration:none;transition:all 0.2s;">← Exit to Dashboard</a>
        </div>'''
        cleaned = re.sub(r'<div class="header">.*?</div>', new_header, cleaned, flags=re.DOTALL)

        # Remove watermark
        cleaned = re.sub(r'body::after\s*\{[^}]*\}', 'body::after { display: none; }', cleaned, flags=re.DOTALL)

        # Fonts & styling
        cleaned = cleaned.replace("font-family: Arial, sans-serif;", "font-family: 'Plus Jakarta Sans', Arial, sans-serif;")
        cleaned = cleaned.replace("background-color: #f1f2ec;", "background-color: #FFF0F0; color: #FF3131; border-radius: 12px; border: 1px solid rgba(255,49,49,0.2);")

        cleaned = re.sub(r'<title>.*?</title>', f'<title>Reading Practice {num} — Take IELTS</title>', cleaned)

        font_link = '''<link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet">'''
        cleaned = cleaned.replace('</head>', f'{font_link}\n</head>')

        cleaned = cleaned.replace('<script>', '<script>\n        window.testStartTime = Date.now();')

        save_code = f'''
                // Save to localStorage for Dashboard & Reports
                try {{
                    const userStored = localStorage.getItem('ielts_user');
                    const userId = userStored ? JSON.parse(userStored).id : 'guest-user';
                    const currentResults = JSON.parse(localStorage.getItem('ielts_test_results') || '[]');
                    const userAnswersObj = {{}};
                    if (typeof resultsData !== 'undefined') {{
                        resultsData.forEach(r => {{
                            if (r.question) userAnswersObj[r.question] = r.userAnswer;
                        }});
                    }}
                    const newRes = {{
                        id: 'res-' + Date.now(),
                        user_id: userId,
                        test_type: 'reading',
                        test_id: '{test_id}',
                        score: score,
                        total_questions: 40,
                        band_score: calculateBandScore(score),
                        time_spent: Math.max(1, Math.round((Date.now() - (window.testStartTime || Date.now())) / 1000)),
                        answers: userAnswersObj,
                        completed_at: new Date().toISOString()
                    }};
                    currentResults.unshift(newRes);
                    localStorage.setItem('ielts_test_results', JSON.stringify(currentResults));
                }} catch(e) {{ console.error('Save error:', e); }}
        '''

        cleaned = cleaned.replace("document.body.classList.add('results-mode');", f"{save_code}\n            document.body.classList.add('results-mode');")

        modal_buttons = '''
                    <div style="display: flex; gap: 12px; margin-top: 20px;">
                        <button id="exit-dashboard-btn" type="button" style="flex: 1; padding: 12px 16px; border: 1.5px solid #d1d5db; background: #ffffff; color: #374151; font-weight: 700; border-radius: 12px; cursor: pointer; font-size: 14px;">Exit to Dashboard</button>
                        <button id="review-answers-btn" type="button" style="flex: 1; padding: 12px 16px; border: none; background: #FF3131; color: #ffffff; font-weight: 700; border-radius: 12px; cursor: pointer; font-size: 14px; box-shadow: 0 4px 12px rgba(255,49,49,0.25);">Review Answers</button>
                    </div>
        '''
        if 'exit-dashboard-btn' not in cleaned:
            cleaned = cleaned.replace('</div>\n        </div>\n    </div>\n\n    <script>', f'{modal_buttons}\n            </div>\n        </div>\n    </div>\n\n    <script>')
            cleaned = cleaned.replace('</div>\n        </div>\n    </div>\n    <script>', f'{modal_buttons}\n            </div>\n        </div>\n    </div>\n    <script>')

            exit_listeners = '''
            document.addEventListener('DOMContentLoaded', () => {
                const exitBtn = document.getElementById('exit-dashboard-btn');
                if (exitBtn) exitBtn.addEventListener('click', () => window.location.href = '/dashboard');
                const reviewBtn = document.getElementById('review-answers-btn');
                if (reviewBtn) reviewBtn.addEventListener('click', () => {
                    const modal = document.getElementById('results-modal') || document.getElementById('result-modal');
                    if (modal) modal.classList.add('hidden');
                });
            });
            '''
            cleaned = cleaned.replace('</script>', f'{exit_listeners}\n</script>')

        out_path = f'app/reading-test-{num}.html'
        with open(out_path, 'w', encoding='utf-8') as out_f:
            out_f.write(cleaned)
        print(f"Created {out_path} successfully.")

    if len(blocks) >= 2:
        make_reading_file(blocks[1], 3, 'reading-3')
    if len(blocks) >= 3:
        make_reading_file(blocks[2], 4, 'reading-4')
    if len(blocks) >= 4:
        make_reading_file(blocks[3], 5, 'reading-5')
