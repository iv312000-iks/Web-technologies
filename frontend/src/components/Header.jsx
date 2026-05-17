import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import styles from './Header.module.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <Logo size={40} />
        <span className={styles.siteName}>Let's Watch</span>
      </Link>

      <nav className={styles.nav}>
        {user ? (
          <>
            <Link to="/upload" className={styles.uploadBtn}>+ Загрузить</Link>
            <div className={styles.user}>
              <Link to="/profile" className={styles.userInfo}>
                <span className={styles.userName}>{user.first_name} {user.last_name}</span>
                <div className={styles.avatar}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </div>
              </Link>
              <button onClick={handleLogout} className={styles.logout} title="Выйти">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
              </button>
            </div>
          </>
        ) : (
          <Link to="/auth" className={styles.registerBtn}>
            Регистрация
            <div className={styles.avatar}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>
          </Link>
        )}
      </nav>
    </header>
  );
}
