const express = require("express");
const router = express.Router();
const table = require("../model/table")
const TABLE_NAME = "department";


router.get("/", (req, res) => {
    table.get(TABLE_NAME).then(departmentTable => {
        departmentTable.find().toArray().then(result => {
            res.send({
                code: 1,
                data: result
            })
        })
    })
})

router.post("/", (req, res, next) => {
    let department = req.body;

    table.get(TABLE_NAME).then(departmentTable => {
        departmentTable.updateOne({ departId: department.departId }, { $set: department }).then((result) => {//未测试
            res.send({
                state: 1,
                data: result.modifiedCount,
                message: '添加成功'
            });
        })
    })
})



module.exports = router;