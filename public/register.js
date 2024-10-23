import { MongoClient } from 'mongodb';

let singleton;

async function connect(){
    if(singleton) return singleton;

    const client = new MongoClient('mongodb://localhost:27017/');
    await client.connect();

    singleton = client.db('chatApp');
    return singleton;
}

async function insertUser(user){
    const db = await connect();
    return db.collection('user').insertOne(user);
}