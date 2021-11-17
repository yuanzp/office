const express = require("express");
const router = express.Router();

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://admin:longruan@localhost:27017/longruan";
const mongoClient = new MongoClient(url);

function openDatabase() {
    return mongoClient.connect();
}
router.get("/", (req, res, next) => {
    res.send("hello")
});

router.post("/", (req, res, next) => {
    var user = req.body;
    if (user) {
        openDatabase().then((client) => {
            let dbo = client.db("longruan");                     
            dbo.collection('user').find({ userId: user.userId }).toArray().then((result) => {
                if (result.length == 0) {//不存在的情况下，添加
                    dbo.collection("user").insertOne(user).then((u) => {
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



module.exports = router;