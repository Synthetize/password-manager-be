const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    //if the token is not null
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        //if token is no longer valid/expired
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    });
}


module.exports = {authenticateToken};