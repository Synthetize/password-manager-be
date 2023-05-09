

//const jwt = require('jsonwebtoken');
import jwt from 'jsonwebtoken';
import config from "./config.js";
import {userTokensCollection} from "./database_manager.js";
const {token} = config



export function generateAccessToken(email, name, surname) {
    return jwt.sign({email: email, name: name, surname: surname}, token.jwtSecret, {expiresIn: '15m'});
}

export function generateRefreshToken(email, name, surname) {
    return jwt.sign({email: email, name: name, surname: surname}, token.jwtRefresh);
}

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    //if the token is not null
    const authToken = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(authToken, token.jwtSecret, (err, user) => {
        //if token is no longer valid/expired
        if (err) return res.sendStatus(498)
        req.user = user
        next()
    });
}

export function refreshToken(req, res) {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    userTokensCollection.findOne({refreshToken: refreshToken}).then(result => {
        if (result == null) return res.sendStatus(403)
            jwt.verify(refreshToken, token.jwtRefresh, (err, user) => {
            if(err) return res.sendStatus(403)
            const accessToken = generateAccessToken(user.email,user.name,user.surname);
            res.json({accessToken: accessToken})
        })
    })
}





