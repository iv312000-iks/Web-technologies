import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import styles from './Watch.module.css';

export default function WatchPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatTab, setChatTab] = useState('chat'); // 'chat' | 'qa'
  const [msgInput, setMsgInput] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [chatName, setChatName] = useState('');
  const [sending, setSending] = useState(false);
  const chatRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    axios.get(`/api/videos/${id}`)
      .then(res => setVideo(res.data))
      .catch(() => navigate('/'));
  }, [id, navigate]);

  useEffect(() => {
    if (user) setChatName(user.chat_name || user.first_name);
  }, [user]);

  useEffect(() => {
    const fetchMessages = () => {
      axios.get(`/api/chat/${id}`)
        .then(res => setMessages(res.data));
    };
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [id]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!msgInput.trim() || !user) return;
    setSending(true);
    try {
      await axios.post(`/api/chat/${id}`, {
        content: msgInput.trim(),
        is_question: chatTab === 'qa'
      });
      setMsgInput('');
    } catch (err) {
      if (err.response?.status === 401) navigate('/auth');
    } finally {
      setSending(false);
    }
  };

  const handleLike = async (msgId) => {
    if (!user) return;
    try {
      const res = await axios.post(`/api/chat/like/${msgId}`);
      setMessages(prev => prev.map(m => m.id === msgId ? res.data : m));
    } catch {}
  };

  const filteredMessages = chatTab === 'qa'
    ? messages.filter(m => m.is_question)
    : messages;

  if (!video) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.layout}>
        {/* Video player */}
        <div className={styles.playerWrap}>
          <div className={styles.player}>
            <video
              controls
              className={styles.video}
              src={`/api/videos/stream/${id}`}
            />
          </div>
          <div className={styles.videoInfo}>
            <h1 className={styles.videoTitle}>{video.title}</h1>
            {video.description && (
              <p className={styles.videoDesc}>{video.description}</p>
            )}
            <div className={styles.videoMeta}>
              <span>{video.author?.first_name} {video.author?.last_name}</span>
              <span>{video.views} просмотров</span>
            </div>
          </div>
        </div>

        {/* Chat panel */}
        <div className={styles.chatPanel}>
          <div className={styles.chatTabs}>
            <button
              className={`${styles.chatTab} ${chatTab === 'chat' ? styles.active : ''}`}
              onClick={() => setChatTab('chat')}
            >
              Чат
            </button>
            <button
              className={`${styles.chatTab} ${chatTab === 'qa' ? styles.active : ''}`}
              onClick={() => setChatTab('qa')}
            >
              Вопрос / ответ
            </button>
          </div>

          <div className={styles.messages} ref={chatRef}>
            {filteredMessages.length === 0 && (
              <p className={styles.emptyChat}>Сообщений пока нет</p>
            )}
            {filteredMessages.map(msg => (
              <div key={msg.id} className={styles.message}>
                <div className={styles.msgHeader}>
                  <span className={styles.msgAuthor}>{msg.chat_name}</span>
                </div>
                <div className={styles.msgBody}>
                  <span className={styles.msgContent}>{msg.content}</span>
                  <button
                    className={styles.likeBtn}
                    onClick={() => handleLike(msg.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>{msg.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {user ? (
            <div className={styles.inputArea}>
              <div className={styles.messageInput}>
                <textarea
                  className={styles.textarea}
                  placeholder="Текст"
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={2}
                />
                {msgInput && (
                  <button onClick={() => setMsgInput('')} className={styles.clearBtn}>✕</button>
                )}
              </div>
              <button
                className={styles.sendBtn}
                onClick={sendMessage}
                disabled={sending || !msgInput.trim()}
              >
                Отправить
              </button>
              <div className={styles.chatNameRow}>
                <span className={styles.chatNameLabel}>Имя в чате: {chatName}</span>
                <button className={styles.editNameBtn} onClick={() => setEditingName(!editingName)}>
                  Ред.
                </button>
              </div>
              {editingName && (
                <input
                  className={`input-field ${styles.nameInput}`}
                  value={chatName}
                  onChange={e => setChatName(e.target.value)}
                  placeholder="Ваше имя в чате"
                />
              )}
            </div>
          ) : (
            <button
              className={styles.authPrompt}
              onClick={() => navigate('/auth')}
            >
              Хотите отправить сообщение?<br />
              <span>Кликните на эту кнопку</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
