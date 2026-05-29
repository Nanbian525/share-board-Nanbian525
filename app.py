import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename

ROOT = Path(__file__).resolve().parent
UPLOADS = ROOT / 'uploads'
DATA_DIR = ROOT / 'data'
DB_PATH = DATA_DIR / 'board.db'
ALLOWED_EXT = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}

UPLOADS.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

app = Flask(__name__, static_folder='public', static_url_path='')
app.config['MAX_CONTENT_LENGTH'] = 8 * 1024 * 1024


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT DEFAULT '',
                link TEXT DEFAULT '',
                image TEXT DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        ''')


def row_to_dict(row):
    return dict(row) if row else None


def remove_image(filename):
    if not filename:
        return
    path = UPLOADS / filename
    if path.is_file():
        path.unlink()


def save_upload(file):
    ext = Path(file.filename or '').suffix.lower()
    if ext not in ALLOWED_EXT:
        raise ValueError('仅支持 JPG、PNG、GIF、WebP 图片')
    name = f"{int(datetime.now().timestamp() * 1000)}-{uuid.uuid4().hex[:8]}{ext}"
    file.save(UPLOADS / name)
    return name


init_db()


@app.get('/api/posts')
def list_posts():
    with get_db() as conn:
        rows = conn.execute(
            'SELECT * FROM posts ORDER BY updated_at DESC'
        ).fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@app.get('/api/posts/<int:post_id>')
def get_post(post_id):
    with get_db() as conn:
        row = conn.execute('SELECT * FROM posts WHERE id = ?', (post_id,)).fetchone()
    if not row:
        return jsonify({'error': '内容不存在'}), 404
    return jsonify(row_to_dict(row))


@app.post('/api/posts')
def create_post():
    text = (request.form.get('text') or '').strip()
    link = (request.form.get('link') or '').strip()
    image = ''
    file = request.files.get('image')

    try:
        if file and file.filename:
            image = save_upload(file)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    if not text and not link and not image:
        if image:
            remove_image(image)
        return jsonify({'error': '请至少填写文字、链接或上传图片'}), 400

    ts = now_iso()
    with get_db() as conn:
        cur = conn.execute(
            'INSERT INTO posts (text, link, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            (text, link, image, ts, ts),
        )
        conn.commit()
        row = conn.execute('SELECT * FROM posts WHERE id = ?', (cur.lastrowid,)).fetchone()
    return jsonify(row_to_dict(row)), 201


@app.put('/api/posts/<int:post_id>')
def update_post(post_id):
    with get_db() as conn:
        row = conn.execute('SELECT * FROM posts WHERE id = ?', (post_id,)).fetchone()
    if not row:
        return jsonify({'error': '内容不存在'}), 404

    post = row_to_dict(row)
    text = (request.form.get('text', post['text']) or '').strip()
    link = (request.form.get('link', post['link']) or '').strip()
    image = post['image']

    if request.form.get('removeImage') == 'true':
        remove_image(post['image'])
        image = ''

    file = request.files.get('image')
    if file and file.filename:
        try:
            new_name = save_upload(file)
            remove_image(post['image'])
            image = new_name
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

    if not text and not link and not image:
        return jsonify({'error': '请至少保留文字、链接或图片之一'}), 400

    ts = now_iso()
    with get_db() as conn:
        conn.execute(
            'UPDATE posts SET text = ?, link = ?, image = ?, updated_at = ? WHERE id = ?',
            (text, link, image, ts, post_id),
        )
        conn.commit()
        row = conn.execute('SELECT * FROM posts WHERE id = ?', (post_id,)).fetchone()
    return jsonify(row_to_dict(row))


@app.delete('/api/posts/<int:post_id>')
def delete_post(post_id):
    with get_db() as conn:
        row = conn.execute('SELECT * FROM posts WHERE id = ?', (post_id,)).fetchone()
        if not row:
            return jsonify({'error': '内容不存在'}), 404
        remove_image(row['image'])
        conn.execute('DELETE FROM posts WHERE id = ?', (post_id,))
        conn.commit()
    return jsonify({'ok': True})


@app.get('/uploads/<path:filename>')
def uploaded_file(filename):
    safe = secure_filename(filename)
    if safe != filename:
        return jsonify({'error': '无效文件'}), 400
    return send_from_directory(UPLOADS, safe)


@app.get('/')
def index():
    return send_from_directory(ROOT / 'public', 'index.html')


@app.errorhandler(413)
def too_large(_e):
    return jsonify({'error': '图片不能超过 8MB'}), 413


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    print('\n  分享墙已启动')
    print(f'  本机访问: http://localhost:{port}')
    print(f'  局域网访问: http://<你的IP>:{port}\n')
    app.run(host='0.0.0.0', port=port, debug=False)
