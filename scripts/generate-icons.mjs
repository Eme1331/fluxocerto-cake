import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'icons');

const icon = readFileSync(path.join(__dirname, 'icon.svg'));
const iconMaskable = readFileSync(path.join(__dirname, 'icon-maskable.svg'));

const jobs = [
  { input: icon, size: 192, file: 'icon-192.png' },
  { input: icon, size: 512, file: 'icon-512.png' },
  { input: icon, size: 180, file: 'apple-touch-icon.png' },
  { input: icon, size: 32, file: 'favicon-32.png' },
  { input: iconMaskable, size: 512, file: 'icon-maskable-512.png' },
];

for (const job of jobs) {
  await sharp(job.input).resize(job.size, job.size).png().toFile(path.join(outDir, job.file));
  console.log(`gerado ${job.file}`);
}
