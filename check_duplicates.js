const fs = require('fs');

const categories = ['animals', 'movies', 'sport'];

categories.forEach(cat => {
  const content = fs.readFileSync(`content/charades/${cat}.ts`, 'utf-8');
  
  const wordsMatch = content.match(/words:\s*\[([\s\S]*?)\]/);
  if (!wordsMatch) return;
  
  const wordsList = wordsMatch[1]
    .split(/[',\n]/)
    .map(s => s.trim())
    .filter(s => s && s !== '');
  
  const duplicates = wordsList.filter((item, index) => wordsList.indexOf(item) !== index);
  const uniqueDuplicates = [...new Set(duplicates)];
  
  console.log(`\n${cat}.ts: ${wordsList.length} entries`);
  if (uniqueDuplicates.length > 0) {
    console.log('Duplicates found:', uniqueDuplicates);
  } else {
    console.log('✓ No duplicates');
  }
});
