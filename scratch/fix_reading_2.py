import os
import re

APP_DIR = "/Users/mahmudulashev/Desktop/Take IELTS/app"
filepath = os.path.join(APP_DIR, "reading-test-2.html")

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add panels-container if missing
if 'class="panels-container"' not in content:
    # Wrap passage-panel, resizer, questions-panel in panels-container
    content = re.sub(
        r'(<!-- =* PASSAGE PANEL =* -->\s*<div class="passage-panel")',
        r'<div class="panels-container" id="panels-container">\n        \1',
        content
    )
    content = re.sub(
        r'(</div>\s*<!-- Bottom Navigation -->)',
        r'</div>\n    \1',
        content
    )

# 2. Hide passage-intro duplicate blocks
content = content.replace('.passage-intro {', '.passage-intro { display: none; ')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed reading-test-2.html panels-container and passage-intro!")
