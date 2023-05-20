
import {MongoClient, ServerApiVersion} from "mongodb";
import config from "./config.js";
const {db} = config;

const connection = new MongoClient(db.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

export const usersCollection = connection.db(db.dbName).collection(db.user);
export const  userVaultCollection = connection.db(db.dbName).collection(db.vault);
export const userFoldersCollection = connection.db(db.dbName).collection(db.folders);
export const userTokensCollection = connection.db(db.dbName).collection(db.tokens);

export async function connect() {
    try {
        await connection.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log('Error connecting to MongoDB', error);
    }
}

export async function close() {
    try {
        await connection.close();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.log('Error disconnecting from MongoDB', error);
    }
}
