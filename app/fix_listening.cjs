const fs = require('fs');
let code = fs.readFileSync('src/pages/ListeningTestPage.jsx', 'utf8');

// Wrap parts with fragment or div
code = code.replace(/\{currentPart === 1 && \(\s*<div className="part-header">/g, '{currentPart === 1 && (<div id="part-1" className="question-part"><div className="part-header">');
code = code.replace(/\{currentPart === 2 && \(\s*<div className="part-header">/g, '{currentPart === 2 && (<div id="part-2" className="question-part"><div className="part-header">');
code = code.replace(/\{currentPart === 3 && \(\s*<div className="part-header">/g, '{currentPart === 3 && (<div id="part-3" className="question-part"><div className="part-header">');
code = code.replace(/\{currentPart === 4 && \(\s*<div className="part-header">/g, '{currentPart === 4 && (<div id="part-4" className="question-part"><div className="part-header">');

// Add closing </div> for the wrapper right before the next part or right-panel
code = code.replace(/<\/div>\s*\}\)\s*\}\s*<\/div>\s*<\/div>\s*\)\}\s*\{currentPart === 2/g, '</div></div></div></div>)}{currentPart === 2');
code = code.replace(/<\/div>\s*\}\)\s*\}\s*<\/div>\s*<\/div>\s*\)\}\s*\{currentPart === 3/g, '</div></div></div></div>)}{currentPart === 3');
code = code.replace(/<\/div>\s*\}\)\s*\}\s*<\/div>\s*<\/div>\s*\)\}\s*\{currentPart === 4/g, '</div></div></div></div>)}{currentPart === 4');
code = code.replace(/<\/div>\s*\}\)\s*\}\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*<div className="right-panel">/g, '</div></div></div></div>)}</div><div className="right-panel">');

// Fix missing brace in style
code = code.replace(/style=\{\{"width":"([^"]+)"\}\s*value=/g, 'style={{"width":"$1"}} value=');

// Fix other missing braces just in case
code = code.replace(/style=\{\{"marginTop":"10px"\}\s*</g, 'style={{"marginTop":"10px"}} <');
code = code.replace(/style=\{\{"fontWeight":"700","marginBottom":"10px"\}\s*</g, 'style={{"fontWeight":"700","marginBottom":"10px"}} <');

fs.writeFileSync('src/pages/ListeningTestPage.jsx', code);
console.log('Fixed');
