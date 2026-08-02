import re

# We will read transcript to get exact HTML for tests 2, 3, 4 from the user's prompt
transcript_path = '/Users/mahmudulashev/.gemini/antigravity/brain/e3e3fa80-3506-407b-ae4a-77888acd60be/.system_generated/logs/transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

last_user_line = lines[-1]
# find all <!DOCTYPE html> occurrences in the last user line
html_blocks = re.findall(r'<!DOCTYPE html>.*?(?=<!DOCTYPE html>|$)', last_user_line, re.DOTALL)

print(f"Found {len(html_blocks)} HTML blocks in user prompt.")

# Block 0: "Spider silk" (Duplicate of reading-test.html) -> SKIP
# Block 1: "Prosopagnosia" -> reading-test-3.html
# Block 2: "The rise and fall of detective stories" -> reading-test-4.html
# Block 3: "The development of the silk industry" -> reading-test-5.html

def process_and_save(raw_html, test_num, test_id):
    # Standardize fonts & styles
    # Replace header telegram link with Exit to Dashboard button
    # Replace background watermark if any
    # Inject localStorage save in checkAnswers()

    cleaned = raw_html

    # Replace header
    header_pattern = r'<div class="header">.*?</div>'
    new_header = '''<div class="header">
        <div class="part-indicator" id="part-indicator">Reading Passage 1</div>
        <a href="/dashboard" class="exit-header-btn" style="display:inline-flex;align-items:center;gap:6px;padding:6px 16px;background:#FFF0F0;color:#FF3131;border:1.5px solid #FF3131;border-radius:9999px;font-weight:700;font-size:13px;text-decoration:none;transition:all 0.2s;">← Exit to Dashboard</a>
    </div>'''
    cleaned = re.sub(header_pattern, new_header, cleaned, flags=re.DOTALL)

    # Remove watermark style
    cleaned = re.sub(r'body::after\s*\{[^}]*\}', 'body::after { display: none; }', cleaned, flags=re.DOTALL)

    # Replace font family
    cleaned = cleaned.replace("font-family: Arial, sans-serif;", "font-family: 'Plus Jakarta Sans', Arial, sans-serif;")
    cleaned = cleaned.replace("background-color: #f1f2ec;", "background-color: #FFF0F0; color: #FF3131; border-radius: 12px; border: 1px solid rgba(255,49,49,0.2);")

    # Inject title
    cleaned = re.sub(r'<title>.*?</title>', f'<title>Reading Practice {test_num} — Take IELTS</title>', cleaned)

    # Inject font link in head
    font_link = '''<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet">'''
    cleaned = cleaned.replace('</head>', f'{font_link}\n</head>')

    # Inject testStartTime
    cleaned = cleaned.replace('<script>', '<script>\n        window.testStartTime = Date.now();')

    # Inject localStorage save into checkAnswers()
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

    # Add Exit buttons to result modal if missing
    modal_buttons = '''
                <div style="display: flex; gap: 12px; margin-top: 20px;">
                    <button id="exit-dashboard-btn" type="button" style="flex: 1; padding: 12px 16px; border: 1.5px solid #d1d5db; background: #ffffff; color: #374151; font-weight: 700; border-radius: 12px; cursor: pointer; font-size: 14px;">Exit to Dashboard</button>
                    <button id="review-answers-btn" type="button" style="flex: 1; padding: 12px 16px; border: none; background: #FF3131; color: #ffffff; font-weight: 700; border-radius: 12px; cursor: pointer; font-size: 14px; box-shadow: 0 4px 12px rgba(255,49,49,0.25);">Review Answers</button>
                </div>
    '''
    if 'exit-dashboard-btn' not in cleaned:
        cleaned = cleaned.replace('</div>\n        </div>\n    </div>\n\n    <script>', f'{modal_buttons}\n            </div>\n        </div>\n    </div>\n\n    <script>')
        cleaned = cleaned.replace('</div>\n        </div>\n    </div>\n    <script>', f'{modal_buttons}\n            </div>\n        </div>\n    </div>\n    <script>')

        # Add event listeners for modal exit buttons
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

    filename = f'app/reading-test-{test_num}.html'
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    print(f'Successfully created {filename}')

# Process block 1 -> reading-test-3.html
if len(html_blocks) >= 2:
    process_and_save(html_blocks[1], 3, 'reading-3')

# Process block 2 -> reading-test-4.html
if len(html_blocks) >= 3:
    process_and_save(html_blocks[2], 4, 'reading-4')

# Process block 3 -> reading-test-5.html
if len(html_blocks) >= 4:
    process_and_save(html_blocks[3], 5, 'reading-5')
