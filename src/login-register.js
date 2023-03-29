const {connect, close, usersCollection} = require("./db_connect-close");
const {randomBytes} = require("node:crypto");
const {createHash} = require("crypto");





async function login(req, res) {
    //await connect();
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
    //await close()
}



async function register(req ,res) {
    //await connect();
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
        res.status(201).send();
    } catch {
        console.log("Registration failed");
        res.status(500).send();
    }
    //await close()
}

module.exports = {register, login}