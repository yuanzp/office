const express = require("express");
const router = express.Router();
const table = require("../model/table")
const multer = require("multer");
const { ObjectId } = require("bson");
const fs = require("fs");

// const upload = multer({
//     dest: "/root/document/upload/" //+ itemCategory + "/" + itemValue + "/"
// })

const TABLE_NAME = "file";
const FILE_PATH = '/root/document/upload/';
let user = null;

router.use((req, res, next) => {
    user = JSON.parse(req.headers['gw-user']);
    next()
})


router.get("/", async (req, res) => {//获取目录及目录文件
    let _pid = req.query.pid;//父级ID
    let itemCategory = req.query.itemCategory;//分类
    let itemValue = req.query.itemValue;

    var dataTable = await table.get(TABLE_NAME);
    var files = await dataTable.find({ pid: _pid, itemCategory: itemCategory, itemValue: itemValue }).sort({ category: 1 }).toArray();


    res.send({
        code: 1,
        data: files
    })
})

router.get("/:id", async (req, res) => {//读取文件,相当于下载
    let id = req.params.id;
    let dataTable = await table.get(TABLE_NAME);
    let result = await dataTable.find({ _id: ObjectId(id) }).toArray();
    if (result.length == 0) {
        res.status(404).send("没有找到该文件")
        return;
    }

    let file = result[0];
    let filename = FILE_PATH + file.fileId;
    var name = file.extendName == null ? file.name : file.name + "." + file.extendName;

    fs.access(filename, (err) => {
        if (err == null) {
            res.download(filename, name)
        }
        else {
            if (err.code == "ENOENT") {
                res.status(404).send("没有找到对应的文件！")
            }
        }
    })
})

router.post("/folder", async (req, res) => {//创建新文件夹
    let pid = req.body.pid;
    let name = req.body.name;
    let itemCategory = req.body.itemCategory;//分类
    let itemValue = req.body.itemValue;//分类下具体的值
    let userId = user.ID;
    let userName = user.DisplayName;

    let departId = user.DeptID;
    let createTime = new Date();
    let category = 0;//0：目录，1，文件  

    let file = {
        pid,
        name,
        itemCategory,
        itemValue,
        userId,
        userName,
        departId,
        createTime,
        category
    };

    var dataTable = await table.get(TABLE_NAME);
    let result = await dataTable.insertOne(file);
    if (result.acknowledged)
        file._id = result.insertedId.toString();

    res.send({
        code: 1,
        data: file
    })

})


router.post("/file", onUpload, async (req, res) => {//上传文件

    let file = {};
    let _file = req.file;
    file.pid = req.body.pid;
    file.name = _file.originalname.replace(/(.*\/)*([^.]+).*/ig, "$2");
    file.extendName = _file.originalname.replace(/.+\./, "")
    file.itemCategory = req.body.itemCategory;//分类
    file.itemValue = req.body.itemValue;//分类下具体的值
    file.userId = user.ID;
    file.userName = user.DisplayName;
    file.departId = user.DeptID;
    file.createTime = new Date();
    file.category = req.body.category;//0：目录，1，文件
    file.fileId = _file.filename;
    file.size = _file.size;
    file.fileId = _file.filename;

    var dataTable = await table.get(TABLE_NAME);
    let result = await dataTable.insertOne(file);
    if (result.acknowledged) {
        file._id = result.insertedId.toString();
        res.send({
            code: 1,
            data: file
        })
    } else {
        res.send({
            code: 0,
            message: "上传失败"
        })
    }




})
//自定义中间件
// function uploadFile(req,res,next){
// 	//dest 值为文件存储的路径;single方法,表示上传单个文件,参数为表单数据对应的key
// 	let upload=multer({dest:"attachment/"}).single("photo");
// 	upload(req,res,(err)=>{
// 		//打印结果看下面的截图
// 	    console.log(req.file);
// 		if(err){
// 	        res.send("err:"+err);
// 	    }else{
// 	        //将文件信息赋值到req.body中，继续执行下一步
// 	        req.body.photo=req.file.filename;
// 	        next();
// 	    }
// 	})
// }

function onUpload(req, res, next) {
    let upload = multer({
        dest: "/root/document/upload/"
    }).single("fileUpload");

    upload(req, res, (err) => {
        next()
    })
}


router.put("/", async (req, res) => {//修改文件夹或文件名称
    let _id = req.body._id;
    let name = req.body.name;

    var dataTable = await table.get(TABLE_NAME);

    let result = await dataTable.find({ _id: ObjectId(_id) }).toArray();
    if (result.length == 0) {
        res.send({
            code: 0,
            message: '没有找到该文件'
        })

        return;
    } else {
        let file = result[0];
        if (file.userId != user.ID) {
            res.send({
                code: 0,
                message: '没有权限'
            })

            return;
        }
    }

    result = await dataTable.updateOne({ _id: ObjectId(_id) }, { $set: { name: name } });

    if (result.acknowledged) {
        res.send({
            code: 1,
            data: {
                _id: _id,
                name: name
            }
        })
    }
    else {
        res.send({
            code: 0,
            message: '修改不成功'
        })
    }
})

router.put("/:id", async (req, res) => {//复制或者移动文件、文件夹
    let _id = req.params.id;
    let pid = req.body.pid;
    let action = parseInt(req.body.action);

    var dataTable = await table.get(TABLE_NAME);
    let result = await dataTable.find({ _id: ObjectId(_id) }).toArray();
    if (result.length == 0) {
        res.send({
            code: 0,
            message: "没有找到该文件"
        })

        return;
    }

    let file = result[0];
    if (file.category == 0 && action == 2) {
        res.send({
            code: 0,
            message: "无法复制文件夹"
        })

        return;
    }

    //更改pid
    file.pid = pid;
    //更改时间
    file.createTime = new Date();

    if (action == 2) {//复制
        let filename = ObjectId().str;
        fs.cpSync(FILE_PATH + file.fileId, filename);
        file.fileId = filename;

        delete file['_id'];

        //更改个人信息
        file.userId = user.ID;
        file.userName = user.DisplayName;
        file.departId = user.DeptID;

        let result = await dataTable.insertOne(file)
        if (result.acknowledged) {
            file._id = result.insertedId.toString();

            res.send({
                code: 1,
                data: file,
                message: "复制成功"
            })
        }
        else {
            res.send({
                code: 0,
                message: "复制失败"
            })
        }
    } else {//移动
        let result = await dataTable.updateOne({ _id: ObjectId(_id) }, { $set: { pid: pid, createTime: new Date() } });
        if (result.acknowledged) {
            res.send({
                code: 1,
                data: file,
                message: "移动成功"
            })
        }
        else {
            res.send({
                code: 0,
                message: "移动失败"
            })
        }
    }
})

router.delete("/", async (req, res) => {//删除文件夹及文件
    let _id = req.body._id;
    var dataTable = await table.get(TABLE_NAME);

    let result = await dataTable.find({ _id: ObjectId(_id) }).toArray();
    if (result.length == 0) {
        res.send({
            code: 0,
            message: '没有找到该文件'
        })

        return;
    } else {
        let file = result[0];
        if (file.userId != user.ID) {
            res.send({
                code: 0,
                message: '没有权限'
            })

            return;
        }
    }

    result = await dataTable.find({ pid: ObjectId(_id) }).toArray();
    if (result.length > 0) {
        res.send({
            code: 0,
            message: '不能删除，文件夹非空'
        })
    } else {
        result = await dataTable.deleteOne({ _id: ObjectId(_id) });
        res.send({
            code: result.acknowledged ? 1 : 0,
            data: result.deletedCount
        })

    }
})






module.exports = router;







