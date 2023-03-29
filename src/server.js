
const express = require('express');
const cors = require('cors');
const app = express();

const {register, login} = require("./login-register");





app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: 'http://localhost:8080',
}));
app.set('view engine', 'ejs');

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