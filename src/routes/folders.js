import express from "express";
import {userFoldersCollection} from "../utils/database.js";
import {authenticateToken} from "../utils/token_handler.js";
const router = express.Router();

//show the user's folders
router.get('/api/folders', authenticateToken, (req, res) => {
    userFoldersCollection.findOne({"user_id": req.user.email}).then(folders => {
        delete folders.user_id;
        delete folders._id;
        res.status(200).json({folders: folders});
    }).catch(e => {
        console.log(e);
        console.log("Error retrieving folders");
        res.status(404).send();
    });
});

//add a folder
router.post('/api/folders', authenticateToken, (req, res) => {
    userFoldersCollection.updateOne({"user_id": req.user.email}, {$set: {[req.body.newfolder]: []}}).then(() => {
        console.log("Folder added");
        res.status(200).send();
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    });
});


//change a folder name
router.put('/api/folders', authenticateToken, (req, res) => {
    userFoldersCollection.updateOne({"user_id": req.user.email}, {$rename: {[req.body.oldName]: req.body.newName}}).then((folder) => {
        if (folder.modifiedCount === 0) {
            console.log("Folder not found");
            res.status(404).send();
            return
        }
        console.log("Folder name changed");
        res.status(200).send();
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    });
});

//remove a folder
router.delete('/api/folders', authenticateToken, (req, res) => {
    //convert the array of ids to an object
    let toBeDeleteObj = Object.fromEntries(req.query.ids.map(element => [element, ""]));
    userFoldersCollection.updateOne({"user_id": req.user.email}, {$unset: toBeDeleteObj}).then(() => {
        console.log("Folder removed");
        res.status(200).send();
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    });
});

//add an element to a folder
router.post('/api/folders/add', authenticateToken, (req, res) => {
    userFoldersCollection.updateOne({"user_id": req.user.email}, {$addToSet: {[req.body.folder]: {$each: req.body.element}}}).then(() => {
        console.log("Element added to folder");
        res.status(200).send();
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    });
});

//remove an element from a folder
router.delete('/api/folders/remove', authenticateToken, (req, res) => {
    userFoldersCollection.updateOne({"user_id": req.user.email}, {$pull: {[req.query.folder]: req.query.element}}).then((result) => {
        console.log(result);
        if(result.modifiedCount === 0){
            console.log("Folder or Element not found");
            res.status(404).send();
            return
        }
        console.log("Element removed from folder");
        res.status(200).send();
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    });
})

export default router;




