const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const UPLOADS = path.join(ROOT, 'uploads');
const DATA_DIR = path.join(ROOT, 'data');

fs.mkdirSync(UPLOADS, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'board.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT DEFAULT '',
    link TEXT DEFAULT '',
    image TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

const storage = multer.diskStorage({
  destination: UPLOADS,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safe = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('仅支持 JPG、PNG、GIF、WebP 图片'));
  },
});

app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(UPLOADS));
app.use(express.static(path.join(ROOT, 'public')));

const getPost = db.prepare('SELECT * FROM posts WHERE id = ?');
const listPosts = db.prepare('SELECT * FROM posts ORDER BY updated_at DESC');
const insertPost = db.prepare(
  'INSERT INTO posts (text, link, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
);
const updatePost = db.prepare(
  'UPDATE posts SET text = ?, link = ?, image = ?, updated_at = ? WHERE id = ?'
);
const deletePost = db.prepare('DELETE FROM posts WHERE id = ?');

function now() {
  return new Date().toISOString();
}

function removeImage(filename) {
  if (!filename) return;
  const file = path.join(UPLOADS, filename);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

app.get('/api/posts', (_req, res) => {
  res.json(listPosts.all());
});

app.get('/api/posts/:id', (req, res) => {
  const post = getPost.get(req.params.id);
  if (!post) return res.status(404).json({ error: '内容不存在' });
  res.json(post);
});

app.post('/api/posts', upload.single('image'), (req, res) => {
  const text = (req.body.text || '').trim();
  const link = (req.body.link || '').trim();
  const image = req.file ? req.file.filename : '';

  if (!text && !link && !image) {
    if (req.file) removeImage(req.file.filename);
    return res.status(400).json({ error: '请至少填写文字、链接或上传图片' });
  }

  const ts = now();
  const result = insertPost.run(text, link, image, ts, ts);
  res.status(201).json(getPost.get(result.lastInsertRowid));
});

app.put('/api/posts/:id', upload.single('image'), (req, res) => {
  const post = getPost.get(req.params.id);
  if (!post) {
    if (req.file) removeImage(req.file.filename);
    return res.status(404).json({ error: '内容不存在' });
  }

  const text = (req.body.text ?? post.text).trim();
  const link = (req.body.link ?? post.link).trim();
  let image = post.image;

  if (req.body.removeImage === 'true') {
    removeImage(post.image);
    image = '';
  }

  if (req.file) {
    removeImage(post.image);
    image = req.file.filename;
  }

  if (!text && !link && !image) {
    if (req.file) removeImage(req.file.filename);
    return res.status(400).json({ error: '请至少保留文字、链接或图片之一' });
  }

  const ts = now();
  updatePost.run(text, link, image, ts, req.params.id);
  res.json(getPost.get(req.params.id));
});

app.delete('/api/posts/:id', (req, res) => {
  const post = getPost.get(req.params.id);
  if (!post) return res.status(404).json({ error: '内容不存在' });
  removeImage(post.image);
  deletePost.run(req.params.id);
  res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message || '请求失败' });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(ROOT, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  分享墙已启动`);
  console.log(`  本机访问: http://localhost:${PORT}`);
  console.log(`  局域网访问: http://<你的IP>:${PORT}\n`);
});
