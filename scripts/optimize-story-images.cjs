'use strict';
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const [id, source] = process.argv.slice(2);
if (!/^[a-z]+$/.test(id || '') || !source) throw new Error('Usage: node scripts/optimize-story-images.cjs <story-id> <generated-source-path>');
const stories = JSON.parse(fs.readFileSync(path.join(root, 'data/stories.json'), 'utf8').replace(/^\uFEFF/, '')).stories;
if (!stories.some(s => path.parse(s.background).name === id)) throw new Error('Unknown story ID');
(async () => {
    for (const width of [1600, 1440, 1280]) {
        for (const quality of [82, 78, 74, 70, 66, 62, 58, 54]) {
            const buffer = await sharp(source).rotate().resize(width, Math.round(width * 9 / 16), { fit: 'cover' }).flatten({ background: '#101a31' }).webp({ quality, effort: 6 }).toBuffer();
            if (buffer.length > 256000) continue;
            const output = path.join(root, 'assets/stories', id + '.webp');
            fs.writeFileSync(output, buffer);
            const reportPath = path.join(root, 'assets/stories/image-report.json');
            const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : {};
            report[id] = { file: 'assets/stories/' + id + '.webp', width, height: Math.round(width * 9 / 16), quality, bytes: buffer.length };
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
            console.log(JSON.stringify(report[id]));
            return;
        }
    }
    throw new Error('Cannot meet image budget for ' + id);
})().catch(error => { console.error(error); process.exitCode = 1; });

