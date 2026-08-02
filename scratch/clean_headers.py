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

for i in [2, 3, 4, 5]:
    filepath = os.path.join(APP_DIR, f"reading-test-{i}.html")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Clean up duplicate exit-header-btn links / headers
    # Match from <body...> up to <div class="main-container...
    pattern = r'(<body>\s*)(.*?)(?=<div class="main-container")'
    match = re.search(pattern, content, flags=re.DOTALL)
    if match:
        content = content[:match.start(2)] + HEADER_TEMPLATE + '\n\n    ' + content[match.end(2):]

    # Clean duplicate passage-header-containers if any
    ph_count = content.count('id="passage-header-container"')
    if ph_count > 1:
        first_idx = content.find('id="passage-header-container"')
        second_idx = content.find('id="passage-header-container"', first_idx + 1)
        # Find ending </div> of the second passage-header-container
        end_idx = content.find('</div>\n        </div>', second_idx) + len('</div>\n        </div>')
        content = content[:second_idx - 13] + content[end_idx:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Cleaned up {f.name}")
