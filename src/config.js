import dotenv from 'dotenv'
dotenv.config()
// {SECRET_KEY, SECRET_IV, ENCRYPTION_METHOD } = process.env
export default {
    port: process.env.PORT,


    db:{
        uri: process.env.URI,
        dbName: process.env.DB_NAME,
        user: process.env.USER_COLLECTION,
        vault: process.env.VAULT_COLLECTION,
        folders: process.env.FOLDERS_COLLECTION,
        tokens: process.env.TOKENS_COLLECTION,
    },

    token: {
        jwtSecret: process.env.ACCESS_TOKEN_SECRET,
        jwtRefresh: process.env.REFRESH_TOKEN_SECRET,
    },

    encryption:{
        secret_key: process.env.SECRET_KEY,
        secret_iv: process.env.SECRET_IV,
        method: process.env.ENCRYPTION_METHOD,
    },

}
