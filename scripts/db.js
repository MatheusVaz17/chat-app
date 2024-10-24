import { MongoClient } from 'mongodb';

let singleton;

export default async function connect(){
    if(singleton) return singleton;

    const client = new MongoClient('mongodb://localhost:27017/');
    await client.connect();

    singleton = client.db('chatApp');
    return singleton;
}

export async function insertMessage(message){
    const db = await connect();
    return db.collection('messages').insertOne(message);
}

export async function findMessages(chatName){
    const db = await connect();
    return db.collection('messages').find({chatName: chatName}).toArray();
}

export async function find(collection, find){
    const db = await connect();
    return db.collection(collection).find(find).toArray();
}

export async function insert(collection, insert){
    const db = await connect();
    return db.collection(collection).insertOne(insert);
}