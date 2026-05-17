import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import styles from './Profile.module.css';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    chat_name: user?.chat_name || ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) { navigate('/auth'); return null; }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header />
      <main className={styles.main}>
        <h2 className={styles.heading}>Профиль</h2>

        <div className={styles.card}>
          <div className={styles.avatar}>
            {user.first_name[0]}{user.last_name[0]}
          </div>
          <p className={styles.email}>{user.email}</p>

          <form onSubmit={handleSave} className={styles.form}>
            <div className="field-group">
              <label>Имя</label>
              <input className="input-field" value={form.first_name}
                onChange={e => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div className="field-group">
              <label>Фамилия</label>
              <input className="input-field" value={form.last_name}
                onChange={e => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <div className="field-group">
              <label>Имя в чате</label>
              <input className="input-field" value={form.chat_name}
                onChange={e => setForm({ ...form, chat_name: e.target.value })} />
            </div>

            <button className="btn-primary" type="submit" disabled={saving}>
              {saved ? '✓ Сохранено' : saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>

          <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/auth'); }}>
            Выйти из аккаунта
          </button>
        </div>
      </main>
    </div>
  );
}
