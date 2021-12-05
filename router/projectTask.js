const { ObjectId } = require("bson");
const express = require("express");
const router = express.Router();
const table = require("../model/table")
const dateUtil = require("../public/js/date")

const TABLE_NAME = "projectTask";

router.get("/projectItem", (req, res) => {//获取有任务安排的项目
    let beginDate = new Date(req.query.beginDate + " 0:0:0");
    let endDate = new Date(req.query.endDate + " 23:59:59");

    table.get(TABLE_NAME).then((dataTable) => {
        dataTable.find({ createTime: { $gt: beginDate, $lt: endDate } }).sort({ sort: 1 }).toArray().then((result) => {
            let itemIds = [];

            for (var i = 0; i < result.length; i++) {
                var task = result[i];

                let b = false;
                itemIds.forEach(element => {
                    if (element == task.itemId) {
                        b = true;
                        return true;
                    }
                })
                if (!b)
                    itemIds.push(task.itemId);

            }

            res.send({
                code: 1,
                data: itemIds
            })
        });
    })

})

router.get("/:itemId", (req, res) => {//获取项目所有任务
    let itemId = req.params.itemId;
    let week = parseInt(req.query.week ? req.query.week : 0);

    table.get(TABLE_NAME).then((dataTable) => {
        dataTable.find({ itemId: itemId }).sort({ sort: 1 }).toArray().then((result) => {
            let tasks = [];
            for (var i = 0; i < result.length; i++) {
                var task = result[i];
                var day = Date.parse(new Date(task.createTime));
                if (dateUtil.inWeek(day, week)) {
                    tasks.push(task);
                }
            }

            res.send({
                code: 1,
                data: tasks
            })
        })
    })
})

router.get("/", (req, res) => {//获取个人任务
    let userId = req.query.userId;
    // let week = parseInt(req.query.week);
    let beginDate = new Date(req.query.beginDate + " 0:0:0");
    let endDate = new Date(req.query.endDate + " 23:59:59");

    if (userId == null) {
        userId = JSON.parse(req.headers['gw-user']).ID;
    }

    table.get(TABLE_NAME).then((dataTable) => {
        dataTable.find({ userId: userId, createTime: { $gt: beginDate, $lt: endDate } }).sort({ sort: 1 }).toArray().then((result) => {
            res.send({
                code: 1,
                data: result
            })
        })
    })
})

router.post("/", (req, res) => {//创建任务
    let task = req.body;
    let _task = {};
    _task.itemId = task.itemId;
    _task.title = task.title;
    _task.sort = task.sort;
    _task.cost = task.cost;

    //先按照任务只能自己创建的方式
    let user = JSON.parse(req.headers['gw-user']);
    _task.userId = user.ID;
    _task.userName = user.DisplayName;
    _task.createTime = new Date();

    table.get(TABLE_NAME).then((dataTable) => {
        dataTable.insertOne(_task).then(result => {
            if (result.acknowledged) {
                _task._id = result.insertedId.toString();
                res.send({
                    code: 1,
                    data: _task
                })
            } else {
                res.send({
                    code: 0,
                    message: '添加失败'
                })
            }
        });
    })
})

//修改任务
router.put("/", (req, res) => {
    let task = req.body;
    let _id = task._id;
    delete task['_id'];

    table.get(TABLE_NAME).then((dataTable) => {
        dataTable.find({ _id: ObjectId(_id) }).toArray().then(result => {
            if (result.length > 0) {
                dataTable.updateOne({ _id: ObjectId(_id) }, { $set: task }).then(result => {
                    task._id = _id;
                    if (result.modifiedCount == 1) {
                        res.send({
                            code: 1,
                            data: task,
                            messsage: '修改成功'
                        })
                    }
                    else {
                        res.send({
                            code: 0,
                            data: task,
                            messsage: '修改不成功'
                        })
                    }
                })
            } else {
                res.send({
                    code: 0,
                    message: '更新失败'
                })
            }
        });
    })
})

//删除任务
router.delete("/", (req, res) => {
    let task = req.body;

    table.get(TABLE_NAME).then((dataTable) => {
        dataTable.deleteOne({ _id: ObjectId(task._id) }).then((result) => {
            if (result.deletedCount == 1) {
                res.send({
                    code: 1,
                    data: task
                })
            } else {
                res.send({
                    code: 0,
                    data: task,
                    message: '对象不存在，删除失败'
                })
            }
        })
    });

})


module.exports = router;