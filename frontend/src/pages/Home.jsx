import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import styles from './Home.module.css';

function formatDuration(seconds) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/videos/?page=${page}`)
      .then(res => {
        setVideos(res.data.videos);
        setTotalPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <h2 className={styles.heading}>Видео</h2>

        {loading ? (
          <div className={styles.loadingGrid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className={styles.empty}>
            <p>Видео пока нет</p>
            <Link to="/upload" className={styles.uploadLink}>Загрузить первое видео</Link>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {videos.map(v => (
                <Link to={`/watch/${v.id}`} key={v.id} className={styles.card}>
                  <div className={styles.thumb}>
                    {v.thumbnail ? (
                      <img src={v.thumbnail} alt={v.title} />
                    ) : (
                      <div className={styles.thumbPlaceholder}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      </div>
                    )}
                    {v.duration && (
                      <span className={styles.duration}>{formatDuration(v.duration)}</span>
                    )}
                  </div>
                  <div className={styles.info}>
                    <h3 className={styles.title}>{v.title}</h3>
                    <p className={styles.meta}>
                      {v.author?.first_name} {v.author?.last_name}
                      <span> · {v.views} просмотров</span>
                      <span> · {formatDate(v.created_at)}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >← Назад</button>
                <span className={styles.pageInfo}>{page} / {totalPages}</span>
                <button
                  className={styles.pageBtn}
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >Вперёд →</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
