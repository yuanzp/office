
const express = require("express");
const router = express.Router();
const table = require("../model/table")

const TABLE_NAME = "workItem";


let user = null;

router.use((req, res, next) => {
    user = JSON.parse(req.headers['gw-user']);
    next()
})



router.get("/", (req, res) => {
    table.get("workItem").then((workItem) => {
        workItem.find().sort({ state: 1 }).toArray().then((result) => {
            res.send({
                code: 1,
                data: result
            })
        })
    })
})


router.get("/current", (req, res) => {
    let options = req.query.options;
    let y = req.query.year == null ? new Date().getFullYear() : req.query.year;
    y = y + '';
    let xm = "xm" + y.substr(2, 2) + "-";

    var reg = new RegExp(xm);

    let filter = options == 1 ? { itemId: { $regex: reg }, state: 1 } : { itemId: { $regex: reg } }
    table.get("workItem").then((workItem) => {
        workItem.find(filter).sort({ state: 1 }).toArray().then((result) => {
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

router.post("/input", async (req, res) => {
    let data = req.body.itemArray;
    let dataTable = await table.get(TABLE_NAME);

    // 检查一条数据
    const checkOne = item => {
        return new Promise((resolve) => {
            dataTable.find({ itemId: item.ID }).toArray().then(result => {
                resolve({
                    item,
                    isExist: result.length == 1
                })
            });
        })
    }

    let _all = [];
    data.forEach(element => {
        _all.push(checkOne(element))
    });

    const checkResult = await Promise.all(_all);

    const insertOne = item => {
        return dataTable.insertOne({
            itemId: item.ID,
            name: item.Name,
            shortName: item.Name,
            state: 0
        })
    }

    _all = [];
    checkResult.forEach(result => {
        if (!result.isExist)
            _all.push(insertOne(result.item));
    })

    const insertResult = await Promise.all(_all);
    let count = 0;
    insertResult.forEach(e => {
        if (e.acknowledged) count++;
    })

    res.send({
        code: 1,
        data: count,
    })
})


router.post("/:itemId", (req, res) => {
    let itemId = req.params.itemId;
    let key = req.body.updateKey;
    let val = req.body.updateVal;
    let updateObj = {};
    updateObj[key] = val;

    table.get(TABLE_NAME).then((dataTable) => {
        dataTable.updateOne({ itemId: itemId }, { $set: updateObj }).then(result => {
            res.send({
                code: 1,
                data: result.modifiedCount
            })
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