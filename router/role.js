const { ObjectId } = require("bson");
const express = require("express");
const router = express.Router();
const table = require("../model/table")

router.get("/", (req, res) => {
    table.get("role").then((roleTable) => {
        roleTable.find().sort({ order: 1 }).toArray().then((result) => {
            res.send({
                code: 1,
                data: result
            })
        })
    }, (result) => {
        res.send({
            code: 0,
            message: result
        })
    })

})

router.post("/", (req, res) => {
    let role = req.body;

    table.get("role").then((roleTable) => {
        roleTable.insertOne(role).then((result) => {
            role._id = result.insertedId.toString();
            res.send({
                code: 1,
                data: role
            })
        })
    })

})

router.put("/", (req, res) => {
    let role = req.body;

    table.get("role").then((roleTable) => {
        roleTable.updateOne({ _id: ObjectId(role._id) }, { $set: { name: role.name, description: role.description } }).then(result => {
            res.send({
                code: result.updatedCount,
                data: role
            })
        })
    })
})

router.delete("/:id", (req, res) => {
    let _id = req.params.id;

    table.get("role").then((roleTable) => {
        roleTable.deleteOne({ _id: ObjectId(_id) }).then(result => {
            res.send({
                code: result.deletedCount,
                data: _id
            })
        })
    })
})

router.get("/:id", (req, res) => {
    let _id = req.params.id;

    table.get("role").then((roleTable) => {
        roleTable.find({ _id: ObjectId(_id) }).toArray().then((result) => {
            res.send({
                code: 1,
                data: result
            })
        })
    }, (result) => {
        res.send({
            code: 0,
            message: result
        })
    })
})

router.post("/menu", (req, res) => {
    let _id = req.body.id;
    let ids = req.body.menus;

    table.get("role").then((roleTable) => {
        roleTable.updateOne({ _id: ObjectId(_id) }, { $set: { menus: ids } }).then(result => {
            res.send({
                code: 1,
                data: result.modifiedCount
            })
        })
    })
})


module.exports = router;