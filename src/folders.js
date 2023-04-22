const {userFoldersCollection, userVaultCollection} = require("./db_connect-close");
const {ObjectId} = require("mongodb");
const {contentDisposition} = require("express/lib/utils");
const {ConnectionStates} = require("mongoose");

function showFolders(req, res) {
    userFoldersCollection.find({"user_id": req.user.email}).toArray().then(folders => {
        res.status(200).json({folders: folders});
    }).catch(e => {
        console.log(e);
        console.log("Error retrieving folders");
        res.status(404).send();
    });
}

function addFolder(req, res) {
    userFoldersCollection.updateOne({"user_id": req.user.email}, {$set: {...req.body}}).then(() => {
        console.log("Folder added");
        res.status(200).send();
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    });
}

function removeFolder(req, res) {
    const toBeDelete = req.params.list.split("&");
    let toBeDeleteObj = Object.fromEntries(toBeDelete.map(element => [element, ""]));
    userFoldersCollection.updateOne({"user_id": req.user.email}, {$unset: toBeDeleteObj}).then(() => {
        console.log("Folder removed");
        res.status(200).send();
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    });
}

module.exports = {showFolders, addFolder, removeFolder};





