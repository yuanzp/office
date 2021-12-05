const express = require("express");
const router = express.Router();
const table = require("../model/table")

const TABLE_NAME = "employee";


router.post("/", (req, res) => {
    let employee = req.body;

    table.get(TABLE_NAME).then(employeeTable => {
        employeeTable.find({ employeeNo: employee.employeeNo }).toArray().then((result) => {
            if (result.length == 0) {//不存在的情况下，添加
                employeeTable.insertOne(employee).then((u) => {
                    res.send({
                        state: 1,
                        data: employee,
                        message: '添加成功'
                    });
                })
            } else {//21/12/2，之前没有存单位代码，临时的做法
                employeeTable.updateOne(
                    { employeeNo: employee.employeeNo }, { $set: { departId: employee.departId } }).then(result => {
                        res.send({
                            state: 1,
                            data: employee,
                            message: '更新成功'
                        });
                    })
            }
        })
    })
})
router.get("/:departId", (req, res) => {
    let departId = req.params.departId;
    table.get(TABLE_NAME).then(employeeTable => {
        employeeTable.find({ departId: departId }).toArray().then(result => {
            res.send({
                code: 1,
                data: result
            })
        })
    })
})





module.exports = router;