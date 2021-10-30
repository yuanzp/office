const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://admin:longruan@localhost:27017/longruan";
const mongoClient = new MongoClient(url);

function openDatabase() {
    return mongoClient.connect();
}

_existLog = function (file, success, fail) {
    openDatabase().then((client) => {
        let dbo = client.db("longruan");
        dbo.collection('publish').find({ ID: file.ID }).toArray().then((files) => {
            success(files ? files.length > 0 : fail);
        })
    }, (err) => {
        fail(err)
    })
}

_appendLog = function (file, success, fail) {
    openDatabase().then((client) => {
        let dbo = client.db("longruan");
        dbo.collection('publish').insertOne(file).then((file) => {
            success(file);
        })
    }, (err) => {
        fail(err)
    })
}
_getLog = function (fileId, success, fail) {
    openDatabase().then((client) => {
        let dbo = client.db("longruan");
        dbo.collection('publish').find({ ID: fileId }).toArray().then((files) => {
            success(files);
        })
    }, (err) => {
        fail(err)
    })

}
_getLogs = function (year, month, day, success, fail) {
    openDatabase().then((client) => {
        let dbo = client.db("longruan");
        dbo.collection('publish').find().toArray().then((fs) => {
            var files = [];
            fs.forEach(file => {
                var _date = new Date(file.CreateTime);
                if (_date.getFullYear() == year &&
                    _date.getMonth() == month &&
                    _date.getDate() == day) {
                    files.push(file);
                }
            });
            success(files);
        })
    }, (err) => {
        fail(err)
    })

}

module.exports = {
    getLog: _getLog,
    getLogs: _getLogs,
    existLog: _existLog,
    appendLog: _appendLog
}