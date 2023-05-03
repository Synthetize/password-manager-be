import {userVaultCollection} from "./database_manager.js";
import {ObjectId} from "mongodb";
import {decryptData, encryptData} from "./encryption.js";


export function showUserVault(req, res) {
    userVaultCollection.find({"user_id": req.user.email}).toArray().then(vault => {
        vault = vault.map(element => {
            let data = {
                "_id": element._id,
                ...JSON.parse(decryptData(element.encryptedBody)),
                "user_id": element.user_id,
            }
            return data
        })
        res.status(200).json({vault: vault});
    }).catch(e => {
        console.log(e);
        console.log("Error retrieving vault");
        res.status(404).send();
    });
}


export async function addToVault(req, res) {
    //insert the element in the vault
    let encryptedBody = encryptData(JSON.stringify(req.body));
    userVaultCollection.insertOne({
        encryptedBody,
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


export function removeFromVault(req, res) {
    let objsArray = req.body.elements.map(element => new ObjectId(element));
    userVaultCollection.deleteMany({"user_id": req.user.email, "_id": {$in: objsArray} }).then(() => {
        console.log("Elements removed from vault");
        res.status(200).send();
    }).catch(e => {
        console.log("Element not found");
        res.status(404).send();
    });
}

export function updateElement(req, res) {
    let encryptedData = encryptData(JSON.stringify(req.body));
    userVaultCollection.updateOne({"user_id": req.user.email, "_id": new ObjectId(req.params.element)}, {$set: {encryptedBody: encryptedData}}).then(() => {
        console.log("Element updated");
        res.status(200).send();
    }).catch(e => {
        console.log("Error updating element");
        console.log(e);
        res.status(404).send();
    });
}

