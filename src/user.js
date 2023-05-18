
import {randomBytes} from "node:crypto";
import {createHash} from "crypto";
import jwt from "jsonwebtoken";
import {usersCollection, userFoldersCollection, userTokensCollection} from "./database_manager.js";
import config from "./config.js";
const {token} = config

import {authenticateToken, generateAccessToken, generateRefreshToken} from "./token_handler.js";

export async function login(req, res) {

    try {
        let email = req.body.email;
        let pass = req.body.password;
        let userFromDB = await usersCollection.findOne({"email": email});
        let hashingPass = createHash('sha256').update(pass.concat(userFromDB.salt)).digest('hex');
        if ( hashingPass === userFromDB.password) {
            //creating jwt token using email, name and surname as payload
            const accessToken = generateAccessToken(userFromDB.email, userFromDB.name, userFromDB.surname);
            const refreshToken = generateRefreshToken(userFromDB.email, userFromDB.name, userFromDB.surname);
            userTokensCollection.insertOne({refreshToken: refreshToken, creationDate: new Date()}).catch(
                e => console.log(e)
            );
            console.log("Login successful");
            res.status(200).json({
                accessToken: accessToken,
                refreshToken: refreshToken,
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
    usersCollection.findOne({"email": req.user.email}).then(user => {
        delete user.salt;
        res.status(200).json({user});
    }).catch(e => {
        console.log(e);
        res.status(500).send();
    });
}


export function changeUserDetails(req, res) {
    usersCollection.updateOne({"email": req.user.email}, {$set: {[req.body.field]:req.body.value}}).then(() => {
        console.log("Password changed");
        res.status(200).send();
    }).catch(e => {
        console.log(e);
        res.status(500).send();
    });
}

export function changeUserPassword(req, res) {
    let salt = randomBytes(15).toString('hex');

    function hashing(password, salt) {
        const toHash = password.concat(salt)
        return createHash('sha256').update(toHash).digest('hex');
    }

    usersCollection.findOne({"email": req.user.email}).then(userFromDB => {
        let oldPassHashing = hashing(req.body.oldpassword, userFromDB.salt);
        let newPassHashing = hashing(req.body.newpassword, salt);
        if (oldPassHashing !== userFromDB.password) {
            console.log("Old password is not correct");
            res.status(401).send();
        }
        try {
            usersCollection.updateOne({
                "email": req.user.email,
                "password": oldPassHashing
            }, {$set: {"password": newPassHashing, "salt": salt}})
            res.status(200).send();
        } catch (e){
            console.log(e);
            res.status(500).send();
        }
    }).catch(e => {
        console.log("Password change failed");
        console.log(e);
        res.status(500).send()
    });
}

export function logout(req, res) {
    userTokensCollection.deleteOne({"refreshToken": req.params.token}).then(() => {
        res.status(204).send();
    }).catch(e => {
        console.log(e);
        res.status(500).send();
    })
}
