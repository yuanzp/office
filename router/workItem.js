const { ObjectId } = require("bson");
const express = require("express");
const router = express.Router();
const table = require("../model/table")


router.get("/", (req, res) => {    
    table.get("workItem").then((workItem) => {
        workItem.find().sort({ order: 1 }).toArray().then((result) => {
            res.send({
                code: 1,
                data: result
            })
        })
    })
})


router.get("/current", (req, res) => {
    let y = req.query.year == null ? new Date().getFullYear() : req.query.year;
    y=y+'';
    let xm = "xm"+ y.substr(2, 2)+"-";

    var reg = new RegExp(xm);
    table.get("workItem").then((workItem) => {
        workItem.find({ itemId: { $regex: reg } }).sort({ order: 1 }).toArray().then((result) => {
            res.send({
                code: 1,
                data: result
            })
        })
    })
})

router.post("/", (req, res) => {
    let _workItem = req.body;

    table.get("workItem").then((workItem) => {
        workItem.find({ itemId: _workItem.itemId }).toArray().then((result) => {
            if (result.length > 0) {
                res.send({
                    code: 0,
                    data: _workItem,
                    messsage: '项目已经存在，不能重复添加'
                })
            } else {//添加
                workItem.find().sort({ order: -1 }).limit(1).toArray().then((result) => {
                    if (result.length == 1) {
                        _workItem.order = result[0].order + 1;
                    }
                    else {
                        _workItem.order = 1;
                    }
                    workItem.insertOne(_workItem).then((result) => {
                        res.send({
                            code: 1,
                            data: _workItem,
                            messsage: '添加成功'
                        })

                    })
                })
            }
        })
    })
})



router.put("/", (req, res) => {
    let _workItem = req.body;

    table.get("workItem").then((workItem) => {
        workItem.find({ itemId: _workItem.itemId }).toArray().then((result) => {
            if (result.length > 0) {
                let curr_workItem = _workItem;
                delete curr_workItem['_id'];

                workItem.updateOne({ itemId: _workItem.itemId }, { $set: curr_workItem }).then((result) => {
                    if (result.modifiedCount == 1) {
                        res.send({
                            code: 1,
                            data: _workItem,
                            messsage: '修改成功'
                        })
                    }
                    else {
                        res.send({
                            code: 0,
                            data: _workItem,
                            messsage: '修改不成功'
                        })
                    }
                })
            } else {//添加
                res.send({
                    code: 0,
                    data: _workItem,
                    messsage: '不存在该项目'
                })
            }
        })
    }, (err) => {
        console.log(err.messsage);
    })
})



module.exports = router;