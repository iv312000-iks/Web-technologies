import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import styles from './Auth.module.css';

export default function AuthPage() {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'access'
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [accessEmail, setAccessEmail] = useState('');
  const [accessSent, setAccessSent] = useState(false);

  const setReg = (field) => (e) => {
    setRegForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const setLog = (field) => (e) => {
    setLoginForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    const errs = {};
    if (!loginForm.email) errs.email = 'Введите email';
    if (!loginForm.password) errs.password = 'Введите пароль';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/');
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Неверный email или пароль' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    const errs = {};
    if (!regForm.email) errs.email = 'Введите email';
    else if (!/\S+@\S+\.\S+/.test(regForm.email)) errs.email = 'Некорректный email';
    if (!regForm.password) errs.password = 'Введите пароль';
    else if (regForm.password.length < 6) errs.password = 'Минимум 6 символов';
    if (!regForm.first_name) errs.first_name = 'Введите имя';
    if (!regForm.last_name) errs.last_name = 'Введите фамилию';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(regForm);
      navigate('/');
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Ошибка регистрации. Попробуйте снова.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccess = async (e) => {
    e.preventDefault();
    if (!accessEmail) { setErrors({ access: 'Введите email' }); return; }
    setLoading(true);
    try {
      await login(accessEmail, 'access-code');
      navigate('/');
    } catch {
      setAccessSent(true);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => { setTab(t); setErrors({}); };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Logo size={40} />
        <span className={styles.siteName}>Let's Watch</span>
      </div>

      <div className={styles.container}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'login' ? styles.active : ''}`} onClick={() => switchTab('login')}>
            Войти
          </button>
          <button className={`${styles.tab} ${tab === 'register' ? styles.active : ''}`} onClick={() => switchTab('register')}>
            Регистрация
          </button>
          <button className={`${styles.tab} ${tab === 'access' ? styles.active : ''}`} onClick={() => switchTab('access')}>
            Код доступа
          </button>
        </div>

        <div className={styles.card}>

          {/* ── LOGIN ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} noValidate>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Вход в аккаунт</h3>

                <div className={styles.fieldGroup}>
                  <label htmlFor="login-email">Электронная почта</label>
                  <input
                    id="login-email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    type="email"
                    placeholder="my_email@mail.com"
                    value={loginForm.email}
                    onChange={setLog('email')}
                    autoComplete="email"
                  />
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="login-password">Пароль</label>
                  <input
                    id="login-password"
                    className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                    type="password"
                    placeholder="Ваш пароль"
                    value={loginForm.password}
                    onChange={setLog('password')}
                    autoComplete="current-password"
                  />
                  {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                </div>
              </section>

              {errors.general && <div className={styles.generalError}>{errors.general}</div>}

              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
              </button>

              <p className={styles.switchHint}>
                Нет аккаунта?{' '}
                <button type="button" className={styles.switchLink} onClick={() => switchTab('register')}>
                  Зарегистрироваться
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} noValidate>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Данные для авторизации</h3>

                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-email">Электронная почта *</label>
                  <input
                    id="reg-email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    type="email"
                    placeholder="my_email@mail.com"
                    value={regForm.email}
                    onChange={setReg('email')}
                    autoComplete="email"
                  />
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-password">Пароль *</label>
                  <input
                    id="reg-password"
                    className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                    type="password"
                    placeholder="Минимум 6 символов"
                    value={regForm.password}
                    onChange={setReg('password')}
                    autoComplete="new-password"
                  />
                  {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                </div>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Прочие данные</h3>

                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-lastname">Фамилия *</label>
                  <input
                    id="reg-lastname"
                    className={`${styles.input} ${errors.last_name ? styles.inputError : ''}`}
                    type="text"
                    placeholder="Ваша фамилия"
                    value={regForm.last_name}
                    onChange={setReg('last_name')}
                    autoComplete="family-name"
                  />
                  {errors.last_name && <span className={styles.errorText}>{errors.last_name}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-firstname">Имя *</label>
                  <input
                    id="reg-firstname"
                    className={`${styles.input} ${errors.first_name ? styles.inputError : ''}`}
                    type="text"
                    placeholder="Ваше имя"
                    value={regForm.first_name}
                    onChange={setReg('first_name')}
                    autoComplete="given-name"
                  />
                  {errors.first_name && <span className={styles.errorText}>{errors.first_name}</span>}
                </div>
              </section>

              {errors.general && <div className={styles.generalError}>{errors.general}</div>}

              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
              <p className={styles.required}>* поле, обязательное для заполнения</p>

              <p className={styles.switchHint}>
                Уже есть аккаунт?{' '}
                <button type="button" className={styles.switchLink} onClick={() => switchTab('login')}>
                  Войти
                </button>
              </p>
            </form>
          )}

          {/* ── ACCESS CODE ── */}
          {tab === 'access' && (
            <form onSubmit={handleAccess} noValidate>
              {!accessSent ? (
                <>
                  <p className={styles.accessHint}>
                    Укажите электронную почту для восстановления кода доступа
                  </p>
                  <div className={styles.fieldGroup} style={{ marginBottom: 16 }}>
                    <input
                      className={`${styles.input} ${errors.access ? styles.inputError : ''}`}
                      type="email"
                      placeholder="mail@mail.com"
                      value={accessEmail}
                      onChange={e => { setAccessEmail(e.target.value); setErrors({}); }}
                    />
                    {errors.access && <span className={styles.errorText}>{errors.access}</span>}
                  </div>
                  <button className={styles.submitBtn} type="submit" disabled={loading}>
                    {loading ? 'Отправка...' : 'Отправить код'}
                  </button>
                </>
              ) : (
                <p className={styles.successMsg}>✓ Код отправлен на {accessEmail}</p>
              )}
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
