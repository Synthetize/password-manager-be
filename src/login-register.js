const {randomBytes} = require("node:crypto");
const {createHash} = require("crypto");
const jwt = require("jsonwebtoken");
const {usersCollection} = require("./db_connect-close");






async function login(req, res) {

    try {
        let email = req.body.email;
        let pass = req.body.password;
        let userFromDB = await usersCollection.findOne({"email": email});
        let hashingPass = createHash('sha256').update(pass.concat(userFromDB.salt)).digest('hex');
        if ( hashingPass === userFromDB.password) {
            //creating jwt token using email, name and surname as payload
            const accessToken = jwt.sign({email: userFromDB.email, name: userFromDB.name, surname: userFromDB.surname}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15s'});
            console.log("Login successful");
            res.status(200).json({accessToken: accessToken});
        } else {
            console.log("Credentials are wrong");
            res.status(401);
        }
    } catch {
        console.log("Login failed");
        res.status(400).send()
    }
}



async function register(req ,res) {
    //await connect();
    let salt = randomBytes(15).toString('hex');

    function hashing(password, salt) {
        const toHash = password.concat(salt)
        return createHash('sha256').update(toHash).digest('hex');
    }

    await usersCollection.insertOne({
                name: req.body.name,
                surname: req.body.surname,
                email: req.body.email,
                password: hashing(req.body.password, salt),
                salt: salt
            }).then(() => {
                console.log("Registration successful");
                res.status(201).send();
            }).catch(() => {
                console.log("Registration failed");
                res.status(500).send();
    });

    // try {
    //     await usersCollection.insertOne({
    //         name: req.body.name,
    //         surname: req.body.surname,
    //         email: req.body.email,
    //         password: hashing(req.body.password, salt),
    //         salt: salt
    //     });
    //     console.log("Registration successful");
    //     res.status(201).send();
    // } catch {
    //     console.log("Registration failed");
    //     res.status(500).send();
    // }
}

module.exports = {register, login}