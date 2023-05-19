import express from 'express';
import cors from 'cors';
import {authenticateToken, generateAccessToken, refreshToken, generateRefreshToken} from "./token_handler.js";
import {connect, userTokensCollection} from "./database_manager.js";
import config from "./config.js";

const app = express();

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:8080',
}));

await connect();


import userRouter from './routes/user.js';
import vaultRouter from './routes/vault.js';
import foldersRouter from './routes/folders.js';
app.use(userRouter);
app.use(vaultRouter);
app.use(foldersRouter);

app.post('/api/token', (req, res) => {
    refreshToken(req, res);
});

app.listen(config.port, () => {
    console.log('Listening on port 3000');
});