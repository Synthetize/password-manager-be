
import {randomBytes} from "node:crypto";
import {createHash} from "crypto";
import jwt from "jsonwebtoken";
import {usersCollection, userFoldersCollection} from "./database_manager.js";



export async function login(req, res) {

    try {
        let email = req.body.email;
        let pass = req.body.password;
        let userFromDB = await usersCollection.findOne({"email": email});
        let hashingPass = createHash('sha256').update(pass.concat(userFromDB.salt)).digest('hex');
        if ( hashingPass === userFromDB.password) {
            //creating jwt token using email, name and surname as payload
            const accessToken = jwt.sign({email: userFromDB.email, name: userFromDB.name, surname: userFromDB.surname}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '5h'});
            console.log("Login successful");
            res.status(200).json({
                accessToken: accessToken,
                email: userFromDB.email,
                name: userFromDB.name,
                surname: userFromDB.surname
            });
        } else {
            console.log("Credentials not valid");
            res.status(401).send();
        }
    } catch {
        console.log("Login failed");
        res.status(400).send()
    }
}



export async function register(req, res) {
    let salt = randomBytes(15).toString('hex');

    function hashing(password, salt) {
        const toHash = password.concat(salt)
        return createHash('sha256').update(toHash).digest('hex');
    }

    if (await usersCollection.findOne({"email": req.body.email}) !== null) {
        console.log("Email is already in use");
        res.status(400).send();
        return;
    }


    usersCollection.insertOne({
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        password: hashing(req.body.password, salt),
        salt: salt
    }).then(() => {
        userFoldersCollection.insertOne({user_id: req.body.email});
        console.log("Registration successful");
        res.status(201).send();
    }).catch(() => {
        console.log("Registration failed");
        res.status(500).send();
    });
}


export function getUserDetails(req, res) {
    usersCollection.findOne({"email": name.user.email}).then(user => {
        delete user.salt;
        res.status(200).json({user});
    }).catch(e => {
        console.log(e);
        res.status(500).send();
    });
}
