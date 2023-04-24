const {userFoldersCollection, userVaultCollection} = require("./db_connect-close");
const {ObjectId} = require("mongodb");
const {contentDisposition} = require("express/lib/utils");
const {ConnectionStates} = require("mongoose");

function showFolders(req, res) {
    userFoldersCollection.findOne({"user_id": req.user.email}).then(folders => {
        delete folders.user_id;
        delete folders._id;
        res.status(200).json({folders: folders});
    }).catch(e => {
        console.log(e);
        console.log("Error retrieving folders");
        res.status(404).send();
    });
}

function addFolder(req, res) {
    userFoldersCollection.updateOne({"user_id": req.user.email}, {$set: {[req.body.newfolder]:[]}}).then(() => {
        console.log("Folder added");
        res.status(200).send();
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    });
}


function removeFolder(req, res) {
    let toBeDelete = req.params.list.split("&");
    let toBeDeleteObj = Object.fromEntries(toBeDelete.map(element => [element, ""]));
    userFoldersCollection.updateOne({"user_id": req.user.email}, {$unset: toBeDeleteObj}).then(() => {
        console.log("Folder removed");
        res.status(200).send();
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    });
}

function changeFolderName(req, res) {
    userFoldersCollection.updateOne({"user_id": req.user.email}, {$rename: {[req.body.oldName]: req.body.newName}}).then(() => {
        console.log("Folder name changed");
        res.status(200).send();
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    });
}

function addElementToFolder(req, res) {
    userFoldersCollection.updateOne({"user_id": req.user.email}, {$push: {[req.body.folder]: req.body.element}}).then(() => {
        console.log("Element added to folder");
        res.status(200).send();
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    });
}

function removeElementFromFolder(req, res) {
    let toBeDelete = req.params.params.split("&");
    let folderName = toBeDelete[0];
    let elementID = toBeDelete[1];
    userFoldersCollection.updateOne({"user_id": req.user.email}, {$pull: {[folderName]: elementID}}).then(() => {
        console.log("Element removed from folder");
        res.status(200).send();
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    });
}
module.exports = {showFolders, addFolder, removeFolder, changeFolderName, addElementToFolder, removeElementFromFolder, };





