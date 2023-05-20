import express from "express";

const router = express.Router();
import {userFoldersCollection, userVaultCollection} from "../utils/database.js";
import {ObjectId} from "mongodb";
import {decryptData, encryptData} from "../utils/encryption.js";
import {authenticateToken, removeExistingRefreshToken} from "../utils/token_handler.js";

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
router.post('/api/vault', await removeExistingRefreshToken, (req, res) => {
    const encryptedBody = encryptData(JSON.stringify(req.body));
    userVaultCollection.insertOne({
        encryptedBody,
        user_id: req.user.email,
    }).then(() => {
        console.log("Element added to vault");
        res.status(201).send();
    }).catch(e => {
        console.log(e);
        console.log("Error adding element to vault");
        res.status(404).send();
    });
});

//remove an element from the vault
router.delete('/api/vault', authenticateToken, async (req, res) => {

    try {
        // //transform the array of strings into an array of ObjectIds
        const objsArray = req.query.elements.map(element => new ObjectId(element));
        userVaultCollection.deleteMany({"user_id": req.user.email, "_id": {$in: objsArray}}).then(() => {
            console.log("Elements removed from vault");})

        //remove the element id from the user's folders
        let newVault = await userFoldersCollection.findOne({"user_id": req.user.email}).then(vault => {

            delete vault._id;
            delete vault.user_id;
            const elements = req.query.elements;
            //cicle through the elements array
            for(let element of elements) {
                //cicle through the vault's fields
                for (let field in vault) {
                    //if the field contains the element, remove it
                    if (vault[field].includes(element)) {
                        let element_id = vault[field].indexOf(element);
                        vault[field].splice(element_id, 1);
                    }
                }
            }
            return vault;
        })
        userFoldersCollection.updateOne({"user_id": req.user.email}, {$set: newVault}).then(() => {
            console.log("Vault updated");
            res.status(200).send();})

    } catch (e) {
        console.log(e);
        console.log("Error removing element from vault");
        res.status(404).send();
    }
});

//update an element from the vault
router.put('/api/vault', authenticateToken, (req, res) => {
    const encryptedData = encryptData(JSON.stringify(req.body));
    userVaultCollection.updateOne({
        "user_id": req.user.email,
        "_id": new ObjectId(req.query.element)
    }, {$set: {encryptedBody: encryptedData}}).then(() => {
        console.log("Element updated");
        res.status(200).send();
    }).catch(e => {
        console.log("Error updating element");
        console.log(e);
        res.status(404).send();
    });
});


export default router;





