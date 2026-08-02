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

mobile_css = """
        /* Navigation Mobile Responsiveness */
        @media (max-width: 768px) {
            .nav-row {
                height: auto !important;
                flex-direction: column !important;
                padding: 10px !important;
                padding-bottom: 20px !important;
            }
            .nav-row > div:first-child {
                flex-direction: row !important;
                align-items: center !important;
                justify-content: space-around !important;
                width: 100% !important;
                padding-left: 0 !important;
            }
            .footer__questionWrapper___1tZ46 {
                flex-direction: row !important;
                margin-right: 0 !important;
                margin-bottom: 0 !important;
            }
            .footer__questionWrapper___1tZ46.selected {
                background: #f8f9fa;
                padding: 4px 8px !important;
                border-radius: 8px;
            }
            .footer__subquestionWrapper___9GgoP {
                display: none !important;
            }
            .help-button {
                width: 100% !important;
                margin-top: 10px !important;
                margin-bottom: 0 !important;
                justify-content: center !important;
                padding: 12px !important;
                font-size: 16px !important;
            }
            .nav-arrows {
                display: none !important; 
            }
        }
"""

for f_name in files_to_fix:
    f_path = os.path.join('/Users/mahmudulashev/Desktop/Take IELTS/app', f_name)
    if not os.path.exists(f_path): continue
    
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace button style
    content = re.sub(
        r'\.footer__deliverButton___3FM07\s*\{[^}]*background-color:\s*#[a-f0-9]+;[^}]*color:\s*#[a-f0-9]+;[^}]*border:\s*1px\s*solid\s*#[a-f0-9]+;[^}]*\}',
        '''.footer__deliverButton___3FM07 {
            margin-left: auto;
            margin-right: 20px;
            background-color: #FF3131;
            color: #ffffff;
            border: 1px solid #FF3131;
            padding: 10px 16px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            transition: transform 0.08s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
            min-width: 160px;
            justify-content: center;
        }''',
        content, flags=re.DOTALL | re.IGNORECASE
    )
    
    content = re.sub(
        r'\.footer__deliverButton___3FM07:hover\s*\{[^}]*background-color:\s*#[a-f0-9]+;[^}]*border-color:\s*#[a-f0-9]+;[^}]*\}',
        '''.footer__deliverButton___3FM07:hover {
            background-color: #e62c2c;
            border-color: #e62c2c;
        }''',
        content, flags=re.DOTALL | re.IGNORECASE
    )
    
    # Add mobile CSS before </style> for tests
    if 'Navigation Mobile Responsiveness' not in content:
        content = content.replace('    </style>', mobile_css + '\n    </style>')
    
    with open(f_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Fixed {f_name}")
