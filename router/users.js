const express = require("express");
const router = express.Router();
const table = require("../model/table")

const TABLE_NAME = "user";

router.get("/", (req, res) => {//获取用户信息
    table.get(TABLE_NAME).then((dataTable) => {
        dataTable.find().toArray().then((result) => {
            res.send({
                code: 1,
                data: result
            })
        })
    });
})

router.get("/my", (req, res) => {
    let u = req.headers["gw-user"];
    if (u == null) {
        res.send({
            code: 0,
            message: '没有登录成功，获取身份信息失败'
        })
    } else {
        let user = JSON.parse(u);
        table.get(TABLE_NAME).then((dataTable) => {
            dataTable.find({ UserId: user.ID }).toArray().then(result => {
                if (result.length == 0) {
                    res.send({
                        code: 2,
                        data: {
                            ID: user.ID,
                            DisplayName: user.DisplayName,
                            LoginName: user.LoginName,
                            DepartmentName: user.DeptName,
                            DepartmentID:user.DeptID
                        }
                    })
                } else {
                    u = result[0];
                    res.send({
                        code: 1,
                        data: {
                            ID: user.ID,
                            DisplayName: user.DisplayName,
                            LoginName: user.LoginName,
                            DepartmentName: user.DeptName,
                            DepartmentID:user.DeptID,
                            EmployeeID: u.EmployeeID
                        }
                    })
                }
            })
        });
    }
})

router.get("/departmentUser/:departId", (req, res) => {//获取用户信息
    let departId = req.params.departId;

    table.get(TABLE_NAME).then((dataTable) => {
        dataTable.find({ DepartmentID: departId }).sort({ UserID: 1 }).toArray().then((result) => {
            res.send({
                code: 1,
                data: result
            })
        })
    });
})


router.post("/", (req, res, next) => {
    var user = req.body;
    if (user) {
        table.get(TABLE_NAME).then((dataTable) => {
            dataTable.find({ UserId: user.UserId }).toArray().then((result) => {
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

                table.get("employee").then(employeeTable => {
                    employeeTable.updateOne({ employeeNo: user.EmployeeNo }, {
                        $set: {
                            Sex: user.Sex, Position: user.Position, Culture: user.Culture, Professional: user.Professional, School: user.School, HireDate: user.HireDate
                        }
                    }).then(result => {
                        // console.log(result.matchedCount);
                    })
                })
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

router.post("/role", (req, res) => {
    let userId = req.body.UserId;
    let role = req.body.role;
    table.get(TABLE_NAME).then((dataTable) => {
        dataTable.updateOne({ UserId: userId }, { $set: { role: role } }).then((result) => {
            if (result.modifiedCount == 1 || result.matchedCount == 1) {//不准确
                res.send({
                    code: 1,
                    data: result.modifiedCount
                })
            }
            else {
                res.send({
                    code: 0,
                    message: '更新失败'
                })
            }

        })
    })
})


router.get("/employee/:employeeId", (req, res) => {
    let employeeId = parseInt(req.params.employeeId);
    table.get(TABLE_NAME).then((dataTable) => {
        dataTable.find({ EmployeeID: employeeId }).toArray().then((result) => {
            if (result.length > 0) {
                res.send({
                    code: 1,
                    data: result[0]
                })
            }
            else {
                res.send({
                    code: 0,
                    message: '没有该员工信息'
                })
            }
        })
    })
})


module.exports = router;