const express = require("express");
const router = express.Router();
const table = require("../model/table")


router.get("/", (req, res) => {//获取所有组
    table.get("worklogGroup").then((worklogGroup) => {
        worklogGroup.find().toArray().then((result) => {
            res.send({
                code: 1,
                data: result
            })
        })
    })
})
router.get("/:employeeId", (req, res) => {
    let employeeId =parseInt(req.params.employeeId) ;

    table.get("worklogGroup").then((worklogGroup) => {
        worklogGroup.find({ groupId: employeeId }).toArray().then((result) => {
            if (result.length > 0) {
                res.send({
                    code: 1,
                    data: result[0].employees
                })
            }else
            {
                res.send({
                    code: 0,
                    data: null,
                    message:'组不存在'
                })
            }
           
        })
    })
})
router.delete("/", (req, res) => {
    let group = req.body;
    table.get("worklogGroup").then((worklogGroup) => {
        worklogGroup.deleteOne({ groupId: group.groupId }).then((result) => {
            if (result.deletedCount > 0) {
                res.send({
                    code: 1,
                    data: group
                })
            }
            else {
                res.send({
                    code: 0,
                    data: _groupId,
                    message: "没能成功删除"
                })
            }
        })
    })
})
router.post("/", (req, res, next) => {//添加组
    let group = req.body;
    table.get("worklogGroup").then((worklogGroup) => {
        worklogGroup.find({ groupId: group.groupId }).toArray().then((result) => {
            if (result.length > 0) {
                res.send({
                    code: 0,
                    data: group,
                    message: "目标已经存在"
                })
            } else {
                worklogGroup.insertOne(group).then((result1) => {
                    res.send({
                        code: 1,
                        data: group,
                        message: "添加成功"
                    })
                })
            }
        })
    })

})
router.post("/:groupId", (req, res, next) => {//添加组
    let employee = req.body;
    let employeeId = parseInt(employee.employeeId)
    let groupId = parseInt(req.params.groupId);

    table.get("worklogGroup").then((worklogGroup) => {
        worklogGroup.find({ groupId: groupId }).toArray().then((result) => {
            if (result.length > 0) {
                let group = result[0];
                let exist = false;
                for (let i = 0; i < group.employees.length; i++) {
                    let emp = group.employees[i];
                    if (emp.employeeId == employeeId) {
                        exist = true;
                        break;
                    }
                }
                if (exist) {
                    res.send({
                        code: 0,
                        data: group,
                        message: "目标已经存在"
                    })
                } else {
                    group.employees.push(employee);
                    worklogGroup.updateOne({ groupId: groupId }, { $set: { employees: group.employees } }).then((result) => {
                        res.send({
                            code: 1,
                            data: employee,
                            message: "添加成功"
                        })
                    })
                }
            } else {
                res.send({
                    code: 0,
                    data: employee,
                    message: "添加失败"
                })
            }
        })
    })
})
router.delete("/:groupId", (req, res, next) => {//删除用户
    let employee = req.body;
    let employeeId = parseInt(employee.employeeId)
    let groupId = parseInt(req.params.groupId);

    table.get("worklogGroup").then((worklogGroup) => {
        worklogGroup.find({ groupId: groupId }).toArray().then((result) => {
            if (result.length > 0) {//确实是不是存在组
                let group = result[0];
                let exist = false;
                //确定组中是否又该用户
                for (let i = 0; i < group.employees.length; i++) {
                    let emp = group.employees[i];
                    if (emp.employeeId == employeeId) {
                        group.employees.splice(i, 1);//清楚掉该用户
                        exist = true;
                        break;
                    }
                }
                if (exist) {
                    worklogGroup.updateOne({ groupId: groupId }, { $set: { employees: group.employees } }).then((result) => {
                        res.send({
                            code: 1,
                            data: employee,
                            message: "删除成功"
                        })
                    })
                } else {
                    res.send({
                        code: 0,
                        data: employee,
                        message: "不存在该用户"
                    })
                }
            } else {
                res.send({
                    code: 0,
                    data: employee,
                    message: "添加失败"
                })
            }
        })
    })
})

module.exports = router;