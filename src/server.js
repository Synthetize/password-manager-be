const express = require('express');
const cors = require('cors');
const app = express();
const {register, login} = require("./login-register");
const {authenticateToken} = require("./middleware");
const {showUserVault, addToVault, removeFromVault, updateElement} = require("./vault");
const {connect} = require("./db_connect-close");



//app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(cors({
    credentials: true,
    origin: 'http://localhost:8080',
}));
app.set('view engine', 'ejs');
con().then()

async function con() {
    await connect();
}


//-----------------Middleware-----------------
// app.get('/testjwt', authenticateToken, async (req, res) => {
//     res.json(await usersCollection.findOne({"email": req.user.email}));
// });
//


//-----------------Home-----------------
// app.get('/', (req, res) => {
//     res.redirect('/login');
// });

//-----------------User Auth-----------------;

app.post('/api/login', async (req, res) => {
    await login(req, res);
});

app.post('/api/register', async (req, res) => {
    await register(req, res);
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

app.put('/api/vault/:element_id', authenticateToken, async (req, res) => {
    await updateElement(req, res);
});



//-----------------Port-----------------
app.listen(3000, () => {
    console.log('Listening on port 3000');
});