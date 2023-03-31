
const express = require('express');
const cors = require('cors');
const app = express();
const {register, login} = require("./login-register");
const {authenticateToken} = require("./middleware");
const {connect, usersCollection} = require("./db_connect-close");






//app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:8080',
}));
app.set('view engine', 'ejs');
con().then()
async function con() {
    await connect();
}



//-----------------Middleware-----------------
app.get('/testjwt', authenticateToken, async (req, res) => {
    res.json(await usersCollection.findOne({"email": req.user.email}));
});




//-----------------Home-----------------
app.get('/', (req, res) => {
    res.redirect('/login');
});

//-----------------Login-----------------
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/api/login', async (req, res) => {
    await login(req, res);
});
//-----------------Register-----------------
app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.post('/api/register', async (req, res) => {
    await register(req, res);
});
//-----------------Port-----------------
app.listen(3000, () => {
    console.log('Listening on port 3000');
});