import json
import re

log_path = "/Users/mahmudulashev/.gemini/antigravity/brain/e3e3fa80-3506-407b-ae4a-77888acd60be/.system_generated/logs/transcript_full.jsonl"

last_user_input = ""
with open(log_path, 'r') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'USER_INPUT':
            last_user_input = data.get('content', '')

# Extract HTML blocks
html_blocks = re.findall(r'(<!DOCTYPE html>.*?</html>)', last_user_input, re.DOTALL)

print(f"Found {len(html_blocks)} HTML blocks.")

if len(html_blocks) >= 3:
    with open('reading-test-3.html', 'w') as f:
        f.write(html_blocks[0])
    with open('reading-test-4.html', 'w') as f:
        f.write(html_blocks[1])
    with open('reading-test-5.html', 'w') as f:
        f.write(html_blocks[2])
    print("Wrote reading-test-3.html, reading-test-4.html, and reading-test-5.html")
else:
    print("Could not find 3 HTML blocks.")
