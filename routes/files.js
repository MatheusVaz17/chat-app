import { Router } from "express";
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

router.get('/script.js', (req, res) => {
    res.sendFile(join(__dirname, '../public/script.js'));
});

router.get('/style.css', (req, res) => {
    res.sendFile(join(__dirname, '../public/style.css'));
});

router.get('/axios.js', (req, res) => {
    res.sendFile(join(__dirname, '../node_modules/axios/dist/axios.js'));
});

export default router;