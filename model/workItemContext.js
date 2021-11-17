const table=require("./table")



 async function getAll(){
    table.get("workItem")
}


module.exports={
    getAll
}


