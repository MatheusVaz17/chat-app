import { Router } from "express";
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as db from '../scripts/db.js';
import bcryptjs from 'bcryptjs';
import { title } from "node:process";

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

router.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(join(__dirname, '../public/register.html'));
});

router.post('/user', async (req,res) => {
    const {email, name, avatar, password} = req.body;
    if(!email || !name || !avatar || !password){
        return res.status(400).json({message: 'Preencha todos os campos!', title: 'Campos obrigatórios não preenchidos'});
    }
    const user = await createUser(email, name, avatar, password);;
    
    return res.status(user.status).json({message: user.message, title: user.title});
});

async function createUser(email, name, avatar, password){
    const tag = generateTag();

    const checkEmail = await db.find('users', {email: email});
    if (checkEmail.length > 0){
        return {status: 409, message: 'Email ja cadastrado!', title: 'Erro ao cadastrar usuário'};
    }

    const user = await db.find('users', {name: name, tag: tag});

    if(user.length < 1){
        const hash =  await bcryptjs.hash(password, 8);
        await db.insert('users', {email: email, name: name, tag: tag, avatar: avatar, password: hash });
    }else{
        createUser(email, name,avatar,password);
    }

    return {status: 200, message: 'Usuário cadastrado com sucesso!', title: 'Usuário cadastrado com sucesso'};
}

function generateTag(){
    const tag = [];
  
    // Generate 4 random numbers between 0 and 9
    for (let i = 0; i < 4; i++) {
        const number = Math.floor(Math.random() * 10);
        tag.push(number);
    }
    
    return tag.join("");
}

export default router;