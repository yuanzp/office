
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://admin:longruan@localhost:27017/longruan";
const mongoClient = new MongoClient(url);

function openDatabase() {
    return mongoClient.connect();
}


module.exports={
    open:openDatabase
}