import os
import re

files_to_fix = [
    'reading-test.html',
    'reading-test-2.html',
    'reading-test-3.html',
    'reading-test-4.html',
    'reading-test-5.html',
    'listening-test.html',
    'listening-test-2.html',
    'listening-test-3.html',
    'listening-test-4.html'
]

for f_name in files_to_fix:
    f_path = os.path.join('/Users/mahmudulashev/Desktop/Take IELTS/app', f_name)
    if not os.path.exists(f_path): continue
    
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Increase general answer-input size
    content = re.sub(
        r'(\.answer-input\s*\{[^}]*height:\s*)28px;',
        r'\g<1>36px;',
        content
    )
    
    # Increase summary-text answer-input size
    content = re.sub(
        r'(\.summary-text\s*\.answer-input\s*\{[^}]*width:\s*)120px;',
        r'\g<1>150px;',
        content
    )
    content = re.sub(
        r'(\.summary-text\s*\.answer-input\s*\{[^}]*height:\s*)24px;',
        r'\g<1>32px;',
        content
    )
    content = re.sub(
        r'(\.summary-text\s*\.answer-input\s*\{[^}]*font-size:\s*)14px;',
        r'\g<1>16px;',
        content
    )
    
    # Also drop-zone heights
    content = re.sub(
        r'(\.summary-drop-zone\s*\{[^}]*height:\s*)25px;',
        r'\g<1>32px;',
        content
    )
    content = re.sub(
        r'(\.matching-question-item\s*\.drop-zone\s*\{[^}]*height:\s*)40px;',
        r'\g<1>44px;',
        content
    )

    # Make checkboxes and radios slightly larger on mobile (use media query we added)
    mobile_input_css = """
            .answer-input, .summary-text .answer-input {
                font-size: 16px !important;
                height: 40px !important;
                width: 100% !important;
                max-width: 200px !important;
                margin-top: 5px;
                margin-bottom: 5px;
            }
            .tf-option, .multi-choice-option {
                padding: 14px 12px !important;
            }
            .tf-option input[type="radio"], .multi-choice-option input[type="radio"], .multi-choice-option input[type="checkbox"] {
                transform: scale(1.5) !important;
                margin-right: 15px !important;
            }
    """
    
    # inject into the mobile css block we added earlier
    if 'transform: scale(1.5)' not in content:
        content = content.replace('.nav-arrows {\n                display: none !important; \n            }', '.nav-arrows {\n                display: none !important; \n            }' + mobile_input_css)
        
    with open(f_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Fixed inputs in {f_name}")
