import express from 'express';
import cors from 'cors';
import userRouter from './routes/user.js';
import vaultRouter from './routes/vault.js';
import foldersRouter from './routes/folders.js';
import tokenRouter from './routes/token.js';
import {connect, userFoldersCollection, userTokensCollection, userVaultCollection} from "./utils/database.js";
import config from "./utils/config.js";
import {authenticateToken} from "./utils/token_handler.js";
import jwt from "jsonwebtoken";

const app = express();

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:8080',
}));

await connect();

app.use(userRouter);
app.use(vaultRouter);
app.use(foldersRouter);
app.use(tokenRouter);


app.listen(config.port, () => {
    console.log('Listening on port 3000');
});