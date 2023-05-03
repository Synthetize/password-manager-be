import express from 'express';
import cors from 'cors';
import {register, login, getUserDetails, changeUserDetails, changeUserPassword} from "./user.js";
import {authenticateToken} from "./middleware.js";
import {showFolders, addFolder, removeFolder, addElementToFolder, removeElementFromFolder, changeFolderName} from "./user_folders.js";
import {showUserVault, addToVault, removeFromVault, updateElement} from "./user_vault.js";
import {connect} from "./database_manager.js";
import config from "./config.js";
const app = express();

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:8080',
}));
app.options('*', cors());
app.set('view engine', 'ejs');
startConnection().then()

async function startConnection() {
    await connect();
}


//-----------------Middleware-----------------
// app.get('/testjwt', authenticateToken, async (req, res) => {
//     res.json(await usersCollection.findOne({"email": req.user.email}));
// });
//


//-----------------Home-----------------
// app.get('/', (req, res) => {
//     res.redirect('/encryptiontest');
// });


//-----------------Encryptiontest-----------------
// app.get('/encryptiontest', (req, res) => {
//
//     const data = {
//         "username": "test",
//         "password": "test"
//     }
//     console.log("Data: " + data);
//     let  encrypted = encryptData(JSON.stringify(data));
//     console.log("Crypt: " + encrypted);
//     let decrypted = decryptData(encrypted);
//     console.log("Decrypt: " + decrypted);
//     //convert decrypted to json
//     let decryptedJson = JSON.parse(decrypted);
//     console.log("DecryptJson: " + JSON.stringify(decryptedJson));
//
// });





//-----------------User Auth-----------------;

app.post('/api/login', async (req, res) => {
    await login(req, res);
});

app.post('/api/register', async (req, res) => {
    await register(req, res);
});


//-----------------User Details-----------------
app.get('/api/user/:userid', authenticateToken, async (req, res) => {
    await getUserDetails(req, res);
});
app.post('/api/user/details', authenticateToken, async (req, res) => {
    await changeUserDetails(req, res);
});

app.post('/api/user/password', authenticateToken, async (req, res) => {
    await changeUserPassword(req, res);
});


//-----------------Vault-----------------
app.get('/api/vault', authenticateToken, async (req, res) => {
    await showUserVault(req, res);
});

app.post('/api/vault', authenticateToken, async (req, res) => {
    await addToVault(req, res);
});


app.delete('/api/vault', authenticateToken, async (req, res) => {
    await removeFromVault(req, res);
});

app.put('/api/vault/:element', authenticateToken, async (req, res) => {
    await updateElement(req, res);
});

//-----------------Folders-----------------
app.get('/api/folders', authenticateToken, async (req, res) => {
    await showFolders(req, res);
});

app.post('/api/folders', authenticateToken,(req, res) => {
    addFolder(req, res);
});

app.delete('/api/folders/:list', authenticateToken, async (req, res) => {
    await removeFolder(req, res);
});

app.post('/api/folders/change', authenticateToken, async (req, res) => {
    await changeFolderName(req, res);
});

app.post('/api/folders/element', authenticateToken, async (req, res) => {
    await addElementToFolder(req, res);
});

app.delete('/api/folders/element/:params', authenticateToken, async (req, res) => {
    await removeElementFromFolder(req, res);
})




//-----------------Port-----------------
app.listen(config.port, () => {
    console.log('Listening on port 3000');
});