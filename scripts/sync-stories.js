const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/stories.json'), 'utf8').replace(/^\uFEFF/, ''));
if (data.stories.length !== 10) throw new Error('Expected ten stories');
for (const story of data.stories) {
    for (const key of ['title', 'content']) {
        if (!/^[A-Za-zÆØÅæøå\s.,!]+$/.test(story[key])) throw new Error('Unsupported character in ' + story.title);
    }
}
fs.writeFileSync(path.join(root, 'data/stories.js'), '// Generated from stories.json by scripts/sync-stories.js. Supports opening index.html directly.\nwindow.TYPESTORY_DATA = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Validated and bundled ten stories.');
