const fs = require('fs');
const path = require('path');
const filePath = process.argv[2] || path.join(__dirname, '..', 'AfterPassing Guide', 'src', 'components', 'BenefitsTracker.tsx');
let s = fs.readFileSync(filePath, 'utf8');
// Fix leftover: "button're             <button" or "button're             <button" (any apostrophe) -> single "<button"
s = s.replace(/<button[\u0027\u2019]re\s+<button/g, '<button');
fs.writeFileSync(filePath, s);
console.log('Done');
