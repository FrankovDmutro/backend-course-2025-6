# Project Structure

## 📁 Організація проекту

```
backend-course-2025-6/
├── app/                          # 🚀 Entry point і конфіг
│   ├── main.js                   # Точка входу (запуск сервера)
│   ├── package.json              # npm конфіг і залежності
│   ├── package-lock.json
│   ├── cache/                    # Кеш директорія для завантажених фото
│   └── collection.json           # Дані інвентарю
│
├── back/                         # 🔧 Backend логіка
│   ├── app.js                    # Express app конфіг
│   ├── config/                   # Конфігурація
│   │   ├── cli.js                # CLI аргументи (host, port, cache)
│   │   └── upload.js             # Multer конфіг для завантаження фото
│   ├── routes/                   # API маршрути
│   │   ├── inventoryRoutes.js    # GET/POST/PUT /inventory
│   │   ├── searchRoutes.js       # GET /search
│   │   └── staticRoutes.js       # GET /RegisterForm.html, /SearchForm.html
│   ├── store/                    # Логіка роботи з даними
│   │   └── inventoryStore.js     # Add, find, update, delete інвентарю
│   ├── utils/                    # Утиліти
│   │   └── photoUrl.js           # Генерація URL для фото
│   └── docs/                     # API документація
│       └── openapi.js            # Swagger/OpenAPI специфікація
│
├── front/                        # 🎨 Frontend
│   ├── RegisterForm.html         # Форма реєстрації інвентарю
│   └── SearchForm.html           # Форма пошуку
│
├── node_modules/                 # npm залежності (ігнорується в git)
├── .git/                         # Git історія
├── .gitignore
├── README.md                     # Основна документація
└── STRUCTURE.md                  # Цей файл
```

## 🔄 Як це працює:

1. **app/main.js** - запускає сервер
   - Читає конфіг (host, port, cache)
   - Ініціалізує upload систему
   - Запускає Express app від back/app.js

2. **back/app.js** - створює Express додаток
   - Підключає всі маршрути (routes/)
   - Налаштовує middleware (JSON, URL-encoded)
   - Підключає Swagger UI (/api-docs)

3. **back/routes/** - API endpoints
   - `inventoryRoutes.js` - управління інвентарем
   - `searchRoutes.js` - пошук по параметрам
   - `staticRoutes.js` - видача HTML файлів

4. **front/** - HTML клієнт
   - `RegisterForm.html` - додавання нових предметів
   - `SearchForm.html` - пошук

## 🚀 Команди:

```bash
# З папки app:
npm start          # Запуск production
npm run dev        # Запуск з nodemon (hot reload)

# Або з кореня проекту:
cd app && npm start
cd app && npm run dev
```

## 📝 Переваги такої структури:

✅ **Ясна разділення**: frontend, backend, конфіг в окремих папках  
✅ **Легко масштабується**: просто додавай файли в потрібні папки  
✅ **Зрозумілі залежності**: видно, що залежить від чого  
✅ **Простіший дебагінг**: знаєш де шукати нужний файл  
