const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

// --- Частина 1: Параметри командного рядка --- [cite: 36]
program
    .helpOption(false)
    .requiredOption('-h, --host <host>', 'адреса сервера') // [cite: 38]
    .requiredOption('-p, --port <port>', 'порт сервера') // [cite: 39]
    .requiredOption('-c, --cache <cache>', 'шлях до директорії кешу'); // [cite: 40]

program.parse(process.argv);
const { host, port, cache } = program.opts();

// Створення директорії кешу, якщо її не існує [cite: 41]
if (!fs.existsSync(cache)) {
    fs.mkdirSync(cache, { recursive: true });
}

const app = express();

// Налаштування multer для зберігання фото у папку кешу [cite: 40, 48]
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, cache),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// Мідлвари для обробки JSON та x-www-form-urlencoded [cite: 26, 48, 75]
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Тимчасове сховище даних у пам'яті (згідно з описом системи інвентаризації) [cite: 14, 15]
let inventory = [];

// --- Частина 2: Реалізація WebAPI --- [cite: 46]

// 1. Отримання списку всіх речей [cite: 48]
app.get('/inventory', (req, res) => {
    const list = inventory.map(item => ({
        ...item,
        photo_url: item.photo ? `http://${host}:${port}/inventory/${item.id}/photo` : null
    }));
    res.status(200).json(list); // [cite: 80]
});

// 2. Реєстрація нового пристрою [cite: 48, 21]
app.post('/register', upload.single('photo'), (req, res) => {
    const { inventory_name, description } = req.body;
    
    if (!inventory_name) {
        return res.status(400).send('Bad Request: name is required'); // [cite: 48]
    }

    const newItem = {
        id: Date.now().toString(), // [cite: 16]
        name: inventory_name, // [cite: 17]
        description: description || '', // [cite: 18]
        photo: req.file ? req.file.filename : null // [cite: 19]
    };

    inventory.push(newItem);
    res.status(201).json(newItem); // [cite: 80]
});

// 3. Отримання інформації про конкретну річ [cite: 48]
app.get('/inventory/:id', (req, res) => {
    const item = inventory.find(i => i.id === req.params.id);
    if (!item) return res.status(404).send('Not found'); // [cite: 48]
    
    res.status(200).json({
        ...item,
        photo_url: item.photo ? `http://${host}:${port}/inventory/${item.id}/photo` : null
    });
});

// 4. Оновлення імені або опису [cite: 48, 23]
app.put('/inventory/:id', (req, res) => {
    const item = inventory.find(i => i.id === req.params.id);
    if (!item) return res.status(404).send('Not found'); // [cite: 48]

    const { name, description } = req.body;
    if (name) item.name = name;
    if (description) item.description = description;

    res.status(200).json(item);
});

// 5. Отримання фото зображення [cite: 48, 24]
app.get('/inventory/:id/photo', (req, res) => {
    const item = inventory.find(i => i.id === req.params.id);
    if (!item || !item.photo) return res.status(404).send('Not found');

    const photoPath = path.resolve(cache, item.photo);
    res.status(200).setHeader('Content-Type', 'image/jpeg'); // [cite: 82]
    res.sendFile(photoPath);
});

// 6. Оновлення фото зображення [cite: 52, 53]
app.put('/inventory/:id/photo', upload.single('photo'), (req, res) => {
    const item = inventory.find(i => i.id === req.params.id);
    if (!item) return res.status(404).send('Not found'); // [cite: 55]

    if (req.file) {
        // Видаляємо старе фото, якщо воно було
        if (item.photo) {
            const oldPath = path.join(cache, item.photo);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        item.photo = req.file.filename;
    }
    res.status(200).send('Photo updated');
});

// 7. Видалення речі [cite: 56, 57]
app.delete('/inventory/:id', (req, res) => {
    const index = inventory.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).send('Not found'); // [cite: 59]
    
    const item = inventory[index];
    if (item.photo) {
        const photoPath = path.join(cache, item.photo);
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    inventory.splice(index, 1);
    res.status(200).send('Deleted');
});

// 8. Пошук пристрою за ID [cite: 70, 71]
const handleSearch = (source, res) => {
    const id = source.id;
    const includePhoto = source.includePhoto || source.has_photo;
    const item = inventory.find(i => i.id === id);

    if (!item) return res.status(404).send('Not Found'); // [cite: 78]

    const responseData = { ...item };
    if (includePhoto === 'true' || includePhoto === 'on' || includePhoto === true || includePhoto === '1') {
        responseData.photo_link = `http://${host}:${port}/inventory/${id}/photo`; // [cite: 26, 77]
    }

    return res.status(200).json(responseData);
};

app.get('/search', (req, res) => handleSearch(req.query, res));
app.post('/search', (req, res) => handleSearch(req.body, res));

// Обробка статичних файлів (HTML форми) [cite: 61, 64]
app.get('/RegisterForm.html', (req, res) => res.sendFile(path.resolve('RegisterForm.html')));
app.get('/SearchForm.html', (req, res) => res.sendFile(path.resolve('SearchForm.html')));

// Заглушка для неіснуючих методів [cite: 79]
app.use((req, res) => {
    res.status(405).send('Method not allowed');
});

// Запуск сервера [cite: 43]
app.listen(port, host, () => {
    console.log(`Сервер запущено на http://${host}:${port}`);
    console.log(`Кеш директорія: ${cache}`);
});