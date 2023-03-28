const {MongoClient, ServerApiVersion} = require('mongodb');
const {createHash} = require('crypto');
const {randomBytes} = require('node:crypto');
const express = require('express');
const {json} = require("express");

const app = express();
const uri = process.env.uri;
const connection = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});
const bcrypt = require('bcrypt');
const {compareSync} = require("bcrypt");
const usersCollection = connection.db('password-manager').collection('users');


app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');


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


app.get('/login', (req, res) => {
    res.render('login.ejs');
});


app.post('/api/login', async (req, res) => {
    await connect();
    try {
        let email = req.body.email;
        let pass = req.body.password;
        let user = await usersCollection.findOne({"email": email});
        let hashingPass = createHash('sha256').update(pass.concat(user.salt)).digest('hex');
        if ( hashingPass === user.password) {
            console.log("Login successful");
            res.status(200).send();
        } else {
            console.log("Credentials are wrong");
            res.status(500).redirect('/login');
        }
    } catch {
        console.log("Login failed");
        res.status(500).redirect('/login');
    }
    await close()

});


app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.post('/api/register', async (req, res) => {
    await connect();
    let salt = randomBytes(15).toString('hex');

    function hashing(password, salt) {
        const toHash = password.concat(salt)
        return createHash('sha256').update(toHash).digest('hex');
    }

    //insert user into database
    try {
        await usersCollection.insertOne({
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: hashing(req.body.password, salt),
            salt: salt
        });
        console.log("Registration successful");
        res.status(201).redirect('/register')
    } catch {
        console.log("Registration failed");
        res.status(500).send();
    }
    await close()
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});