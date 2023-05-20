import jwt from 'jsonwebtoken';
import config from "./config.js";
import {userTokensCollection} from "./database.js";
const {token} = config



export function generateAccessToken(email, name, surname) {
    return jwt.sign({email: email, name: name, surname: surname}, token.jwtSecret, {expiresIn: '15m'});
}

export function generateRefreshToken(email, name, surname) {
    return jwt.sign({email: email, name: name, surname: surname}, token.jwtRefresh);
}

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const authToken = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(authToken, token.jwtSecret, (err, user) => {
        //if token is no longer valid/expired
        if (err) return res.sendStatus(498)
        req.user = user
        next()
    });
}

export async function removeExistingRefreshToken(req, res, next) {
    try {
        let refreshTokens = await userTokensCollection.find({}).toArray().then(result => {
            return result
        })
        let existingTokens= []
        for(let obj of refreshTokens) {
            let payload = jwt.decode(obj.refreshToken, {complete: true}).payload
            if (payload.email === req.body.email) {
                existingTokens.push(obj.refreshToken)
            }
        }
        userTokensCollection.deleteMany({refreshToken: {$in: existingTokens}}).then(() => {
            console.log(existingTokens)
            console.log("Old Refresh Token removed from db")
        })
        next()
    } catch (e) {
        console.log(e)
        return res.status(400).send()
    }
}









