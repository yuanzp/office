const { ObjectId } = require("bson");
const express = require("express");
const router = express.Router();
const menuModel = require('../model/menuModel')
const table = require("../model/table")

router.get("/my", (req, res) => {
    let user = JSON.parse(req.headers['gw-user']);
    table.get("user").then(userTable => {
        userTable.find({ UserId: user.ID }).toArray().then(result => {
            if (result.length > 0) {
                let role = result[0].role == null ? {
                    _id: '619e527359a172ebedd61290',
                    name: 'base'
                } : result[0].role;

                table.get("role").then(roleTable => {
                    roleTable.find({ _id: ObjectId(role._id) }).toArray().then(result => {
                        let menuIds = result[0].menus;
                        let ms = [];
                        menuIds.forEach(element => {
                            ms.push(ObjectId(element))
                        });

                        table.get("menu").then(menuTable => {
                            menuTable.find({ _id: { $in: ms } }).toArray().then(result => {
                                let menus = result;
                                let treeMenu = getTreeMenu(menus);

                                res.send({
                                    code: 1,
                                    data: treeMenu
                                })
                            })
                        })
                    })
                })
            }
            else {
                res.send({
                    code: 1,
                    data: menuModel.menus
                })
            }
        })
    })

    // res.send({
    //     code: 1,
    //     data: menuModel.menus
    // })
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

router.post("/", (req, res) => {
    var menu = req.body;

    table.get("menu").then((menuTable) => {
        menuTable.insertOne(menu).then((result) => {
            menu._id = result.insertedId.toString()
            res.send({
                code: 1,
                data: menu
            })
        })
    })
})

router.put("/", (req, res) => {
    var menu = req.body;
    let _id = menu._id;
    delete menu._id;
    table.get("menu").then((menuTable) => {
        menuTable.updateOne({ _id: ObjectId(_id) }, { $set: menu }).then((result) => {

            res.send({
                code: 1,
                data: result.matchedCount
            })
        })
    })
})



router.get("/role/:id", (req, res) => {
    let _id = req.params.id;

    res.send({
        code: 0,
        data: _id,
        message: '尚未实现'
    })
})


function getTreeMenu (menus) {
    let ms = [];
    for (let index = 0; index < menus.length; index++) {
        const menu = menus[index];
        if (menu.parentId == 0) {
            let m = {
                id: menu._id,
                parentId: menu.parentId,
                label: menu.title,
                path: menu.path,
                fixed: menu.fixed,
                children: []
            };
            ms.push(m);
            addSubMenu(menus, m);
        }
    }
    return ms;
}

function addSubMenu (menus, menu) {
    for (let index = 0; index < menus.length; index++) {
        const subMenu = menus[index];
        if (subMenu.parentId == menu.id) {
            let m = {
                id: subMenu._id,
                parentId: subMenu.parentId,
                label: subMenu.title,
                path: subMenu.path,
                fixed: subMenu.fixed,
                children: []
            };
                       
            menu.children.push(m);
            addSubMenu(menus, m);
        }
    }
}


module.exports = router;