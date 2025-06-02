import express from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import textract from 'textract';
import { promises as fs } from 'fs';
import path from 'path';

const upload = multer({ dest: '/tmp', limits: { fileSize: 20 * 1024 * 1024 } });

const app = express();

app.post('/extract', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }
  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  try {
    let text;
    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (ext === '.doc') {
      text = await new Promise((resolve, reject) => {
        textract.fromFileWithPath(filePath, (err, value) => {
          if (err) reject(err);
          else resolve(value);
        });
      });
    } else {
      return res.status(415).json({ status: 'error', message: 'Unsupported file type' });
    }
    res.json({ status: 'success', text });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  } finally {
    try { await fs.unlink(filePath); } catch {}
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
