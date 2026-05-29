const $ = (sel) => document.querySelector(sel);

const form = $('#postForm');
const editId = $('#editId');
const textEl = $('#text');
const linkEl = $('#link');
const imageEl = $('#image');
const preview = $('#preview');
const previewImg = $('#previewImg');
const removeImageWrap = $('#removeImageWrap');
const removeImage = $('#removeImage');
const formTitle = $('#formTitle');
const submitBtn = $('#submitBtn');
const cancelEdit = $('#cancelEdit');
const postsEl = $('#posts');
const emptyEl = $('#empty');
const refreshBtn = $('#refreshBtn');
const toastEl = $('#toast');

let toastTimer;

function showToast(msg, isError = false) {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = 'toast' + (isError ? ' error' : '');
  toastEl.hidden = false;
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2800);
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function resetForm() {
  editId.value = '';
  form.reset();
  preview.hidden = true;
  removeImageWrap.hidden = true;
  removeImage.checked = false;
  formTitle.textContent = '发表内容';
  submitBtn.textContent = '发布';
  cancelEdit.hidden = true;
}

function showPreview(src) {
  previewImg.src = src;
  preview.hidden = false;
}

imageEl.addEventListener('change', () => {
  const file = imageEl.files[0];
  if (file) {
    showPreview(URL.createObjectURL(file));
    removeImage.checked = false;
  }
});

cancelEdit.addEventListener('click', resetForm);
refreshBtn.addEventListener('click', loadPosts);

async function api(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '操作失败');
  return data;
}

async function loadPosts() {
  try {
    const posts = await api('/api/posts');
    renderPosts(posts);
  } catch (e) {
    showToast(e.message, true);
  }
}

function renderPosts(posts) {
  postsEl.innerHTML = '';
  emptyEl.hidden = posts.length > 0;

  for (const post of posts) {
    const card = document.createElement('article');
    card.className = 'post';
    card.dataset.id = post.id;

    let html = '';

    if (post.text) {
      html += `<p class="post-text">${escapeHtml(post.text)}</p>`;
    }

    if (post.link) {
      const href = escapeHtml(post.link);
      html += `<a class="post-link" href="${href}" target="_blank" rel="noopener noreferrer">${href}</a>`;
    }

    if (post.image) {
      html += `<img class="post-image" src="/uploads/${encodeURIComponent(post.image)}" alt="分享图片" loading="lazy" />`;
    }

    const updated = post.updated_at !== post.created_at;
    html += `
      <div class="post-meta">
        <time>${formatTime(post.updated_at)}${updated ? ' · 已编辑' : ''}</time>
        <div class="post-actions">
          <button type="button" class="btn ghost small" data-edit="${post.id}">编辑</button>
          <button type="button" class="btn ghost small danger" data-delete="${post.id}">删除</button>
        </div>
      </div>
    `;

    card.innerHTML = html;
    postsEl.appendChild(card);
  }
}

postsEl.addEventListener('click', async (e) => {
  const editBtn = e.target.closest('[data-edit]');
  const delBtn = e.target.closest('[data-delete]');

  if (editBtn) {
    const id = editBtn.dataset.edit;
    try {
      const post = await api(`/api/posts/${id}`);
      editId.value = post.id;
      textEl.value = post.text || '';
      linkEl.value = post.link || '';
      imageEl.value = '';
      removeImage.checked = false;

      if (post.image) {
        showPreview(`/uploads/${encodeURIComponent(post.image)}`);
        removeImageWrap.hidden = false;
      } else {
        preview.hidden = true;
        removeImageWrap.hidden = true;
      }

      formTitle.textContent = '编辑内容';
      submitBtn.textContent = '保存';
      cancelEdit.hidden = false;
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      showToast(err.message, true);
    }
    return;
  }

  if (delBtn) {
    const id = delBtn.dataset.delete;
    if (!confirm('确定删除这条内容吗？')) return;
    try {
      await api(`/api/posts/${id}`, { method: 'DELETE' });
      showToast('已删除');
      if (editId.value === id) resetForm();
      loadPosts();
    } catch (err) {
      showToast(err.message, true);
    }
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fd = new FormData();
  fd.append('text', textEl.value.trim());
  fd.append('link', linkEl.value.trim());

  if (imageEl.files[0]) fd.append('image', imageEl.files[0]);
  if (editId.value && removeImage.checked) fd.append('removeImage', 'true');

  const id = editId.value;
  const url = id ? `/api/posts/${id}` : '/api/posts';
  const method = id ? 'PUT' : 'POST';

  submitBtn.disabled = true;
  try {
    await api(url, { method, body: fd });
    showToast(id ? '已保存' : '发布成功');
    resetForm();
    loadPosts();
  } catch (err) {
    showToast(err.message, true);
  } finally {
    submitBtn.disabled = false;
  }
});

loadPosts();
