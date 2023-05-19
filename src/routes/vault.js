import express from "express";
const router = express.Router();
import {userVaultCollection} from "../database_manager.js";
import {ObjectId} from "mongodb";
import {decryptData, encryptData} from "../encryption.js";
import {authenticateToken} from "../token_handler.js";

//changes
// put /api/vault/:element -> /api/vault?element=element_id




//show the user's vault
router.get('/api/vault', authenticateToken, (req, res) => {
    userVaultCollection.find({"user_id": req.user.email}).toArray().then(vault => {
        vault = vault.map(element => {
            const data = {
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
});

//add an element to the vault
router.post('/api/vault', authenticateToken, (req, res) => {
    const encryptedBody = encryptData(JSON.stringify(req.body));
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
});

//remove an element from the vault
router.delete('/api/vault', authenticateToken, (req, res) => {
    //transform the array of strings into an array of ObjectIds
    const objsArray = req.body.elements.map(element => new ObjectId(element));
    userVaultCollection.deleteMany({"user_id": req.user.email, "_id": {$in: objsArray} }).then(() => {
        console.log("Elements removed from vault");
        res.status(200).send();
    }).catch(e => {
        console.log("Element not found");
        res.status(404).send();
    });
});

//update an element from the vault
router.put('/api/vault', authenticateToken,(req, res) => {
    const encryptedData = encryptData(JSON.stringify(req.body));
    userVaultCollection.updateOne({"user_id": req.user.email, "_id": new ObjectId(req.query.element)}, {$set: {encryptedBody: encryptedData}}).then(() => {
        console.log("Element updated");
        res.status(200).send();
    }).catch(e => {
        console.log("Error updating element");
        console.log(e);
        res.status(404).send();
    });
});



export default router;





