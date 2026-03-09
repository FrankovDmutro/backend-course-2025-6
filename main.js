const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

// --- Частина 1: Параметри командного рядка ---
program
    .requiredOption('-h, --host <host>', 'адреса сервера')
    .requiredOption('-p, --port <port>', 'порт сервера')
    .requiredOption('-c, --cache <cache>', 'шлях до директорії кешу');

program.parse(process.argv);
const { host, port, cache } = program.opts();

// Створення директорії кешу, якщо її немає 
if (!fs.existsSync(cache)) {
    fs.mkdirSync(cache, { recursive: true });
}

const app = express();
const upload = multer({ dest: cache }); // Фото зберігатимуться у вказану директорію 

// Мідлвари
app.use(express.json()); // Для PUT запитів 
app.use(express.urlencoded({ extended: true })); // Для x-www-form-urlencoded

// Тимчасове сховище даних (в реальності краще файл або БД)
let inventory = [];

// --- Частина 2: Реалізація WebAPI ---

// GET /inventory - Отримання всього списку 
app.get('/inventory', (req, res) => {
    res.status(200).json(inventory);
});

// POST /register - Реєстрація нового пристрою 
app.post('/register', upload.single('photo'), (req, res) => {
    const { inventory_name, description } = req.body;
    
    if (!inventory_name) {
        return res.status(400).send('Bad Request: name is required');
    }

    const newItem = {
        id: Date.now().toString(),
        name: inventory_name,
        description: description || '',
        photo: req.file ? req.file.filename : null
    };

    inventory.push(newItem);
    res.status(201).json(newItem); 
});

// GET /inventory/:id - Отримання конкретної речі 
app.get('/inventory/:id', (req, res) => {
    const item = inventory.find(i => i.id === req.params.id);
    if (!item) return res.status(404).send('Not Found');
    res.status(200).json(item);
});

// GET /inventory/:id/photo - Отримання фото 
app.get('/inventory/:id/photo', (req, res) => {
    const item = inventory.find(i => i.id === req.params.id);
    if (!item || !item.photo) return res.status(404).send('Not Found');
    
    const photoPath = path.join(cache, item.photo);
    res.setHeader('Content-Type', 'image/jpeg');
    res.sendFile(photoPath);
});

// DELETE /inventory/:id - Видалення
app.delete('/inventory/:id', (req, res) => {
    const index = inventory.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).send('Not Found');
    
    inventory.splice(index, 1);
    res.status(200).send('Deleted');
});

// Обробка непідтримуваних методів 
app.all('/inventory*', (req, res, next) => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (!methods.includes(req.method)) {
        return res.status(405).send('Method Not Allowed');
    }
    next();
});

// Запуск сервера
app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});