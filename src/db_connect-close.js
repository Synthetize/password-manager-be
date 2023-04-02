require('dotenv').config();
const {MongoClient, ServerApiVersion} = require("mongodb");
const uri = process.env.URI;
const connection = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});
const usersCollection = connection.db('password-manager').collection('users');
const  userVaultCollection = connection.db('password-manager').collection('user_vault');

async function connect() {
    try {
        await connection.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log('Error connecting to MongoDB', error);
    }
}

async function close() {
    try {
        await connection.close();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.log('Error disconnecting from MongoDB', error);
    }
}

module.exports = { connect, close, usersCollection, userVaultCollection };