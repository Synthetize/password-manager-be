const {userVaultCollection} = require("./db_connect-close");
const {randomBytes} = require("node:crypto");
const {ObjectId} = require("mongodb");


function showUserVault(req, res) {
    userVaultCollection.find({"user_id": req.user.email}).toArray().then(vault => {
        res.status(200).json({vault: vault});
    }).catch(e => {
        console.log(e);
        console.log("Error retrieving vault");
        res.status(404).send();
    });
}


async function addToVault(req, res) {
    //insert the element in the vault
    userVaultCollection.insertOne({
        ...req.body,
        user_id: req.user.email,
    }).then(()=> {
        console.log("Element added to vault");
        res.status(201).send();
    }).catch(e => {
        console.log(e);
        console.log("Error adding element to vault");
        res.status(404).send();
    });
}


function removeFromVault(req, res) {
    let objsArray = req.body.elements.map(element => new ObjectId(element));
    userVaultCollection.deleteMany({"user_id": req.user.email, "_id": {$in: objsArray} }).then(() => {
        console.log("Elements removed from vault");
        res.status(200).send();
    }).catch(e => {
        console.log("Element not found");
        res.status(404).send();
    });
}

function updateElement(req, res) {
    userVaultCollection.updateOne({"user_id": req.user.email, "_id": new ObjectId(req.params.element)}, {$set: {...req.body}}).then(() => {
        console.log("Element updated");
        res.status(200).send();
    }).catch(e => {
        console.log("Element not found");
        res.status(404).send();
    });
}


module.exports = {showUserVault, addToVault, removeFromVault, updateElement, };