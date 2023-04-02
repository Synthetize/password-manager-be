const { userVaultCollection } = require("./db_connect-close");


async function showUserVault(req ,res) {
    try {
        let userFromDB = await userVaultCollection.findOne({"user_id": req.user.email});
        let vault = userFromDB.vault;
        res.status(200).json({vault: vault});
    } catch {
        console.log("Vault not found");
        res.status(404).send();
    }
}

async function addToVault(req, res) {
    try {
        await userVaultCollection.updateOne({"user_id": req.user.email}, {$push: {vault: req.body}});
        res.status(201).send();
    } catch {
        console.log("Vault not found");
        res.status(404).send();
    }
}

module.exports = { showUserVault, addToVault };