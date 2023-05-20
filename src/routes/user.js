import express from "express";
const router = express.Router();
import {randomBytes} from "node:crypto";
import {createHash} from "crypto";
import {usersCollection, userFoldersCollection, userTokensCollection} from "../utils/database.js";
import {
    authenticateToken,
    generateAccessToken,
    generateRefreshToken,
    removeExistingRefreshToken
} from "../utils/token_handler.js";
//cahanged
// /api/login -> /api/user/login
// /api/register -> /api/user/register
// /api/logout -> /api/user/logout?refreshToken=...
// /api/user/:userid -> /api/user/showdetails?email=...
// /api/user/details -> /api/user/changedetails
// /api/user/password -> /api/user/changepassword


router.post('/api/user/login',removeExistingRefreshToken, async (req, res) => {
    try {
        let email = req.body.email;
        let pass = req.body.password;
        let userFromDB = await usersCollection.findOne({"email": email});
        let hashingPass = createHash('sha256').update(pass.concat(userFromDB.salt)).digest('hex');
        if (hashingPass === userFromDB.password) {
            //creating jwt token using email, name and surname as payload
            const accessToken = generateAccessToken(userFromDB.email, userFromDB.name, userFromDB.surname);
            const refreshToken = generateRefreshToken(userFromDB.email, userFromDB.name, userFromDB.surname);
            userTokensCollection.insertOne({refreshToken: refreshToken, creationDate: new Date()}).catch(
                e => console.log(e)
            );
            res.status(200).json({
                accessToken: accessToken,
                refreshToken: refreshToken,
                email: userFromDB.email,
                name: userFromDB.name,
                surname: userFromDB.surname
            });
            console.log("Login successful");
        } else {
            console.log("Credentials not valid");
            res.status(401).send();
        }
    } catch (e){
        console.log("Login failed");
        console.log(e);
        res.status(400).send()
    }
});

router.post('/api/user/register', async (req, res) => {
    const salt = randomBytes(15).toString('hex');
    function hashing(password, salt) {
        const toHash = password.concat(salt)
        return createHash('sha256').update(toHash).digest('hex');
    }

    if (await usersCollection.findOne({"email": req.body.email}) !== null) {
        console.log("Email is already in use");
        res.status(400).send();
        return;
    }

    const userPass  = req.body.password;
    delete req.body.password;
    usersCollection.insertOne({
          ...req.body,
        password: hashing(userPass, salt),
        salt: salt
    }).then(() => {
        userFoldersCollection.insertOne({user_id: req.body.email});
        console.log("Registration successful");
        res.status(201).send();
    }).catch(() => {
        console.log("Registration failed");
        res.status(500).send();
    });
});

router.delete('/api/user/logout', (req, res) => {
    userTokensCollection.deleteOne({"refreshToken": req.query.refreshtoken}).then(() => {
        res.status(204).send();
    }).catch(e => {
        console.log(e);
        res.status(500).send();
    })
});

//get user profile details
router.get('/api/user/showdetails', authenticateToken, (req, res) => {

    usersCollection.findOne({"email": req.query.email}).then(user => {
        delete user.salt;
        res.status(200).json({user});
    }).catch(e => {
        console.log(e);
        res.status(500).send();
    });
});

router.post('/api/user/changedetails', authenticateToken,(req, res) => {
    if (req.body.field === "password") {
        res.status(400).send();
        return;
    }
    usersCollection.updateOne({"email": req.user.email}, {$set: {[req.body.field]: req.body.value}}).then(() => {
        console.log("Password changed");
        res.status(200).send();
    }).catch(e => {
        console.log(e);
        res.status(500).send();
    });
});

router.post('/api/user/changepassword', authenticateToken, (req, res) => {
    const salt = randomBytes(15).toString('hex');

    function hashing(password, salt) {
        const toHash = password.concat(salt)
        return createHash('sha256').update(toHash).digest('hex');
    }

    usersCollection.findOne({"email": req.user.email}).then(userFromDB => {
        const oldPassHashing = hashing(req.body.oldpassword, userFromDB.salt);
        const newPassHashing = hashing(req.body.newpassword, salt);
        if (oldPassHashing !== userFromDB.password) {
            console.log("Old password is not correct");
            res.status(401).send();
        }
        try {
            usersCollection.updateOne({"email": req.user.email, "password": oldPassHashing}, {$set: {"password": newPassHashing, "salt": salt}})
                .then(r => res.status(200).send());
        } catch (e) {
            console.log(e);
            res.status(500).send();
        }
    }).catch(e => {
        console.log("Password change failed");
        console.log(e);
        res.status(500).send()
    });
});

export default router;
