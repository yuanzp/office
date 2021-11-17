const express = require("express");
const router = express.Router();

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://admin:longruan@localhost:27017/longruan";
const mongoClient = new MongoClient(url);

function openDatabase() {
    return mongoClient.connect();
}

router.post("/",(req,res,next)=>{
    let employee=req.body;
    openDatabase().then((client)=>{
        let dbo=client.db("longruan");
        dbo.collection('employee').find({ employeeNo: employee.employeeNo }).toArray().then((result) => {
            if (result.length == 0) {//不存在的情况下，添加
                dbo.collection("employee").insertOne(employee).then((u) => {
                    res.send({
                        state: 1,
                        data: employee,
                        message: '添加成功'
                    });
                })
            } else {
                res.send({
                    state: 0,
                    data: employee,
                    message: '员工已经存在'
                });
            }
        })



    })

})





module.exports = router;