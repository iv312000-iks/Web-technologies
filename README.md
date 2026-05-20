# Видеоплатформа

Веб-платформа для потокового видео с регистрацией, авторизацией, загрузкой видео и живым чатом.

## Стек технологий

- **Бэкенд**: Python 3.11, Flask, Flask-JWT-Extended, Flask-SQLAlchemy, SQLite / PostgreSQL
- **Фронтенд**: React JS 18, React Router v6, Axios, CSS Modules
- **Дизайн**: реализован по макету Figma (ЯБРО)

---

## Структура проекта

```
yadro/
├── backend/
│   ├── app.py              # Точка входа Flask
│   ├── database.py         # Модели SQLAlchemy
│   ├── requirements.txt
│   └── routes/
│       ├── auth.py         # Аутентификация (JWT)
│       ├── videos.py       # Видео CRUD + стриминг
│       └── chat.py         # Сообщения чата
└── frontend/
    ├── package.json
    └── src/
        ├── App.jsx
        ├── index.css       # Дизайн-система ЯБРО
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Header.jsx
        │   └── Logo.jsx
        └── pages/
            ├── Home.jsx    # Лента видео
            ├── Watch.jsx   # Плеер + чат
            ├── Auth.jsx    # Регистрация / Код доступа
            ├── Upload.jsx  # Загрузка видео
            └── Profile.jsx # Профиль пользователя
```

---

## Запуск проекта

### Бэкенд

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Сервер запустится на `http://localhost:5000`

### Фронтенд

```bash
cd frontend
npm install
npm start
```

Приложение откроется на `http://localhost:3000`

---

## API документация

Base URL: `http://localhost:5000/api`

### Аутентификация

| Метод | Путь             | Описание             | Auth |
| ----- | ---------------- | -------------------- | ---- |
| POST  | `/auth/register` | Регистрация          | —    |
| POST  | `/auth/login`    | Вход                 | —    |
| GET   | `/auth/me`       | Текущий пользователь | JWT  |
| PUT   | `/auth/profile`  | Обновить профиль     | JWT  |

#### POST `/auth/register`

```json
// Request
{
  "email": "user@example.com",
  "password": "secret123",
  "first_name": "Иван",
  "last_name": "Иванов"
}

// Response 201
{
  "token": "eyJ...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Иван",
    "last_name": "Иванов",
    "chat_name": "Иван"
  }
}
```

#### POST `/auth/login`

```json
// Request
{ "email": "user@example.com", "password": "secret123" }

// Response 200
{ "token": "eyJ...", "user": { ... } }
```

### Видео

| Метод  | Путь                 | Описание                 | Auth |
| ------ | -------------------- | ------------------------ | ---- |
| GET    | `/videos/`           | Список видео (пагинация) | —    |
| GET    | `/videos/:id`        | Информация о видео       | —    |
| POST   | `/videos/upload`     | Загрузить видео          | JWT  |
| GET    | `/videos/stream/:id` | Стриминг видео (Range)   | —    |
| DELETE | `/videos/:id`        | Удалить видео            | JWT  |

#### GET `/videos/?page=1&per_page=12`

```json
{
  "videos": [
    {
      "id": 1,
      "title": "Моё видео",
      "description": "...",
      "filename": "uuid.mp4",
      "views": 42,
      "author": { "id": 1, "first_name": "Иван", ... },
      "created_at": "2024-01-01T12:00:00"
    }
  ],
  "total": 50,
  "pages": 5,
  "current_page": 1
}
```

#### POST `/videos/upload`

```
Content-Type: multipart/form-data
Authorization: Bearer <token>

video: <file>
title: "Название"
description: "Описание"
```

### Чат

| Метод | Путь                     | Описание            | Auth |
| ----- | ------------------------ | ------------------- | ---- |
| GET   | `/chat/:video_id`        | Сообщения видео     | —    |
| POST  | `/chat/:video_id`        | Отправить сообщение | JWT  |
| POST  | `/chat/like/:message_id` | Лайкнуть сообщение  | JWT  |

#### POST `/chat/:video_id`

```json
{ "content": "Отличное видео!", "is_question": false }
```

---

## Переменные окружения (.env)

```
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=postgresql://user:pass@localhost/yabro
```

---

## Принципы разработки

- **DRY** — переиспользуемые компоненты React (Header, Logo, CSS-переменные)
- **SOLID** — разделение Flask-приложения на блюпринты (auth, videos, chat)
- **Модульность** — CSS Modules для изоляции стилей компонентов
- **JWT** — stateless аутентификация с хранением токена в localStorage
- **Range-запросы** — стриминг видео с поддержкой перемотки (HTTP 206)
- **Polling** — обновление чата каждые 3 секунды без WebSocket

---

## Экраны приложения

| Экран       | Маршрут      | Описание                  |
| ----------- | ------------ | ------------------------- |
| Главная     | `/`          | Лента видео с пагинацией  |
| Просмотр    | `/watch/:id` | Плеер + чат/вопросы       |
| Авторизация | `/auth`      | Регистрация и код доступа |
| Загрузка    | `/upload`    | Загрузка нового видео     |
| Профиль     | `/profile`   | Настройки пользователя    |
