const express = require("express");
const router = express.Router();
const table = require("../model/table")

const TABLE_NAME = "user";

router.post("/", (req, res, next) => {
    var user = req.body;
    if (user) {
        table.get(TABLE_NAME).then((dataTable) => {
            dataTable.find({ userId: user.userId }).toArray().then((result) => {
                if (result.length == 0) {//不存在的情况下，添加
                    dataTable.insertOne(user).then((u) => {
                        res.send({
                            state: 1,
                            data: user,
                            message: '添加成功'
                        });
                    })
                } else {
                    res.send({
                        state: 0,
                        data: user,
                        message: '用户已经存在'
                    });
                }
            })
        })
    } else {
        res.send({
            code: 0,
            data: null,
            message: '添加失败，参数不完善'
        })
    }


})
router.get("/employee/:employeeId", (req, res) => {
    let employeeId =parseInt(req.params.employeeId) ;
    table.get(TABLE_NAME).then((dataTable) => {
        dataTable.find({ EmployeeID: employeeId }).toArray().then((result) => {
            if (result.length > 0) {
                res.send({
                    code:1,
                    data:result[0]
                })
            }
            else
            {
                res.send({
                    code:0,
                    message:'没有该员工信息'
                })
            }
        })
    })
})


module.exports = router;