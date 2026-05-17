import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import styles from './Upload.module.css';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('video/')) { setFile(f); setError(''); }
    else setError('Пожалуйста, выберите видеофайл');
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setError(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Выберите файл видео'); return; }
    if (!title.trim()) { setError('Введите название'); return; }

    // Явно берём токен из localStorage — не полагаемся на axios.defaults
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }

    setUploading(true);
    setError('');
    setProgress(0);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title.trim());
    formData.append('description', description.trim());

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 201) {
          const data = JSON.parse(xhr.responseText);
          navigate(`/watch/${data.id}`);
        } else {
          let msg = 'Ошибка загрузки';
          try {
            const data = JSON.parse(xhr.responseText);
            msg = data.error || msg;
          } catch {}
          setError(`${msg} (код ${xhr.status})`);
          setUploading(false);
        }
        resolve();
      };

      xhr.onerror = () => {
        setError('Ошибка сети. Проверьте, запущен ли сервер на порту 5000.');
        setUploading(false);
        resolve();
      };

      xhr.open('POST', 'http://localhost:5000/api/videos/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      // НЕ ставим Content-Type — браузер сам выставит multipart/form-data с boundary
      xhr.send(formData);
    });
  };

  return (
    <div>
      <Header />
      <main className={styles.main}>
        <h2 className={styles.heading}>Загрузить видео</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div
            className={`${styles.dropzone} ${file ? styles.hasFile : ''}`}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => !uploading && inputRef.current.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {file ? (
              <>
                <div className={styles.fileIcon}>🎬</div>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(1)} МБ</p>
                {!uploading && (
                  <button
                    type="button"
                    className={styles.changeFile}
                    onClick={ev => { ev.stopPropagation(); inputRef.current.click(); }}
                  >
                    Выбрать другой файл
                  </button>
                )}
              </>
            ) : (
              <>
                <div className={styles.uploadIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p className={styles.dropText}>Перетащите видео сюда или нажмите для выбора</p>
                <p className={styles.dropHint}>MP4, WebM, AVI, MOV — до 500 МБ</p>
              </>
            )}
          </div>

          <div className="field-group">
            <label>Название *</label>
            <input
              className="input-field"
              placeholder="Введите название видео"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={uploading}
            />
          </div>

          <div className="field-group">
            <label>Описание</label>
            <textarea
              className={`input-field ${styles.textarea}`}
              placeholder="Опишите видео..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              disabled={uploading}
            />
          </div>

          {error && <p className={styles.errorMsg}>⚠ {error}</p>}

          {uploading && (
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.progressText}>{progress}%</span>
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={uploading}>
            {uploading ? `Загрузка ${progress}%...` : 'Загрузить видео'}
          </button>
        </form>
      </main>
    </div>
  );
}
