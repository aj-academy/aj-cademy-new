import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const dir = path.join(process.cwd(), 'public', 'colleges');
  const files = fs.readdirSync(dir);
  const exts = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
  const images = files.filter(file => exts.some(ext => file.endsWith(ext)));
  res.status(200).json(images);
} 