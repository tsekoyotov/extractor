import express from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import textract from 'textract';
import { execFile } from 'child_process';
import { promisify } from 'util';
import morgan from 'morgan';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';

const MAX_CONCURRENT_UPLOADS = parseInt(process.env.MAX_CONCURRENT_UPLOADS, 10) || 5;
let activeUploads = 0;

const execFileAsync = promisify(execFile);

// Supported Word formats including the legacy `.doc` extension
const allowedExtensions = ['.doc', '.docx'];

async function convertDocToDocx(docPath) {
  const dir = path.dirname(docPath);
  try {
    await execFileAsync('soffice', ['--headless', '--convert-to', 'docx', docPath, '--outdir', dir]);
    return docPath.replace(/\.doc$/i, '.docx');
  } catch (err) {
    throw new Error('Failed to convert .doc to .docx: ' + err.message);
  }
}

const upload = multer({
  dest: '/tmp',
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .doc and .docx files are allowed'));
    }
  }
});

const app = express();
app.use(cors());
app.use(morgan('combined'));

const normalizeText = str => Buffer.from(str, 'utf8')
  .toString('utf8')
  .replace(/\s+/g, ' ')
  .trim();

async function extractText(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: file.path });
    return normalizeText(result.value);
  }
  if (ext === '.doc') {
    // Attempt conversion using LibreOffice/soffice if available
    try {
      const docxPath = await convertDocToDocx(file.path);
      const result = await mammoth.extractRawText({ path: docxPath });
      try { await fs.unlink(docxPath); } catch {}
      return normalizeText(result.value);
    } catch (convErr) {
      // Fallback to textract which relies on tools like `antiword`
      const value = await new Promise((resolve, reject) => {
        textract.fromFileWithPath(file.path, (err, val) => {
          if (err) reject(err);
          else resolve(val);
        });
      });
      return normalizeText(value);
    }
  }
  throw new Error('Unsupported file type');
}

// Accept one or more files with the field name `file`
app.post('/extract', upload.array('file'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ status: 'error', message: 'No files uploaded' });
  }

  if (activeUploads >= MAX_CONCURRENT_UPLOADS) {
    for (const f of req.files) { try { await fs.unlink(f.path); } catch {} }
    return res.status(503).json({ status: 'error', message: 'Server busy. Try again later.' });
  }

  activeUploads++;
  const results = [];
  try {
    for (const file of req.files) {
      try {
        const text = await extractText(file);
        const chunkSize = parseInt(req.query.chunk, 10);
        let payload;
        if (chunkSize && chunkSize > 0) {
          const chunks = [];
          for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.slice(i, i + chunkSize));
          }
          payload = { filename: file.originalname, mimeType: file.mimetype, chunks };
        } else {
          payload = { filename: file.originalname, mimeType: file.mimetype, text };
        }
        results.push(payload);
      } catch (err) {
        console.error(err);
        results.push({ filename: file.originalname, mimeType: file.mimetype, error: err.message });
      } finally {
        try { await fs.unlink(file.path); } catch {}
      }
    }
    res.json({ status: 'success', results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  } finally {
    activeUploads--;
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
