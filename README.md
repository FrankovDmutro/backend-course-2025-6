# backend-course-2025-6

Невеликий Express-сервер для інвентаризації пристроїв з підтримкою реєстрації, пошуку, оновлення та видалення записів, а також завантаження фото.

## Швидкий старт

1. Встановіть залежності:

npm install

2. Запустіть сервер у dev-режимі (nodemon):

npm run dev

3. Або запустіть сервер без nodemon:

npm start

Сервер за замовчуванням запускається на:
- host: localhost
- port: 3000
- cache: ./cache

## Запуск з власними параметрами

node main.js --host 127.0.0.1 --port 4000 --cache ./cache

Важливо: якщо запускаєте через nodemon і передаєте параметри додатку, перед ними має бути --

Приклад:

nodemon main.js -- --host localhost --port 3000 --cache ./cache

## HTML-сторінки

Після запуску доступні:
- http://localhost:3000/RegisterForm.html
- http://localhost:3000/SearchForm.html

## Endpoint-и

### 1) Отримати весь список

- Method: GET
- URL: /inventory
- Response: 200 OK, масив об'єктів

Приклад:

curl http://localhost:3000/inventory

### 2) Зареєструвати новий пристрій

- Method: POST
- URL: /register
- Content-Type: multipart/form-data
- Поля:
  - inventory_name (required)
  - description (optional)
  - photo (optional, file)
- Response: 201 Created, створений об'єкт

Приклад:

curl -X POST http://localhost:3000/register ^
  -F "inventory_name=Laptop" ^
  -F "description=Office device" ^
  -F "photo=@C:/path/to/photo.jpg"

### 3) Отримати елемент за ID

- Method: GET
- URL: /inventory/:id
- Response: 200 OK або 404 Not found

Приклад:

curl http://localhost:3000/inventory/1741760000000

### 4) Оновити назву або опис

- Method: PUT
- URL: /inventory/:id
- Content-Type: application/json або x-www-form-urlencoded
- Поля:
  - name (optional)
  - description (optional)
- Response: 200 OK або 404 Not found

Приклад:

curl -X PUT http://localhost:3000/inventory/1741760000000 ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Laptop Pro\",\"description\":\"Updated\"}"

### 5) Отримати фото

- Method: GET
- URL: /inventory/:id/photo
- Response: 200 OK (image/jpeg) або 404 Not found

Приклад:

curl http://localhost:3000/inventory/1741760000000/photo --output photo.jpg

### 6) Оновити фото

- Method: PUT
- URL: /inventory/:id/photo
- Content-Type: multipart/form-data
- Поля:
  - photo (required, file)
- Response: 200 OK або 404 Not found

Приклад:

curl -X PUT http://localhost:3000/inventory/1741760000000/photo ^
  -F "photo=@C:/path/to/new-photo.jpg"

### 7) Видалити елемент

- Method: DELETE
- URL: /inventory/:id
- Response: 200 OK або 404 Not found

Приклад:

curl -X DELETE http://localhost:3000/inventory/1741760000000

### 8) Пошук за ID

Підтримуються обидва варіанти:
- GET /search?id=<id>&includePhoto=true
- POST /search (body: id, has_photo=true)

Response: 200 OK або 404 Not Found

Приклади:

curl "http://localhost:3000/search?id=1741760000000&includePhoto=true"

curl -X POST http://localhost:3000/search ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "id=1741760000000&has_photo=true"

## Нотатки

- Дані інвентарю зберігаються в пам'яті процесу (після перезапуску сервера список очищається).
- Фото зберігаються у директорії cache.
- Для невідомих маршрутів сервер повертає 405 Method not allowed.
