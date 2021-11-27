const express = require("express");
const router = express.Router();
const menuModel=require('../model/menuModel')
const table = require("../model/table")

router.get("/my",(req,res)=>{
    res.send({
        code:1,
        data:menuModel.menus
    })
})

router.get("/", (req, res) => {    
    table.get("menu").then((menuTable) => {
        menuTable.find().sort({ order: 1 }).toArray().then((result) => {
            res.send({
                code: 1,
                data: result
            })
        })
    })
})

router.post("/",(req,res)=>{
    var menu=req.body;

    table.get("menu").then((menuTable) => {
        menuTable.insertOne(menu).then((result) => {
            menu._id=result.insertedId.toString()
            res.send({
                code: 1,
                data: menu
            })
        })
    })
})




router.get("/role/:id",(req,res)=>{
    let _id=req.params.id;

    res.send({
        code:0,
        data:_id,
        message:'尚未实现'
    })
})


module.exports = router;