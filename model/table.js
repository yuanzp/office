const connection=require("./connection")

function get(name){
   return new Promise((resolve)=>{
        connection.open().then((client)=>{
            let dbo=client.db("longruan");   

            resolve(dbo.collection(name))
        })
    })

}

module.exports={
    get
}

/*
const table=require("table")
table.get("my").then()
*/