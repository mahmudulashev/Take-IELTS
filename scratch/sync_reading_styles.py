import os
import re

APP_DIR = "/Users/mahmudulashev/Desktop/Take IELTS/app"

reading1_path = os.path.join(APP_DIR, "reading-test.html")

with open(reading1_path, 'r', encoding='utf-8') as f:
    reading1_content = f.read()

# Extract <style>...</style> block from reading-test.html
match_style = re.search(r'<style>.*?</style>', reading1_content, flags=re.DOTALL)
if not match_style:
    print("Could not find <style> in reading-test.html!")
    exit(1)

reading1_style = match_style.group(0)

# Process reading-test-2, 3, 4, 5
for i in [2, 3, 4, 5]:
    filename = f"reading-test-{i}.html"
    filepath = os.path.join(APP_DIR, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace <style>...</style> with reading1_style
    content = re.sub(r'<style>.*?</style>', reading1_style, content, flags=re.DOTALL)

    # Double check no @MINDLESS_WRITER remains
    content = content.replace('"@MINDLESS_WRITER"', '""')
    content = content.replace("'@MINDLESS_WRITER'", "''")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Successfully synced styles for {filename}")
