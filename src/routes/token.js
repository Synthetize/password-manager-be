import express from "express";
import {generateAccessToken} from "../utils/token_handler.js";
import jwt from "jsonwebtoken";
import {userTokensCollection} from "../utils/database.js";
const router = express.Router();

router.post('/api/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    const user = jwt.verify(refreshToken, token.jwtRefresh, (err, user) => {
        if (err) return res.sendStatus(403)
        return user
    })

    userTokensCollection.findOne({refreshToken: refreshToken}).then(dbToken => {
        if (dbToken == null) return res.sendStatus(403)

        const refreshTokenCreationDate = dbToken.creationDate;
        console.log(Date.now() - refreshTokenCreationDate);
        if (Date.now() - refreshTokenCreationDate > 1800000) {
            userTokensCollection.deleteOne({refreshToken: refreshToken}).then(result => {
                console.log("Timeout: refresh token deleted");
                return res.sendStatus(403)
            })
        } else {
            console.log("Not timeout");
            userTokensCollection.updateOne({refreshToken: refreshToken}, {$set: {creationDate: new Date()}}).then(result => {
                const accessToken = generateAccessToken(user.email, user.name, user.surname);
                res.json({accessToken: accessToken})
            })
        }
    })
});

export default router;
