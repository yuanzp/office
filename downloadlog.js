var fs = require("fs");

var files = [];
fs.readFile("./downloadLog.json", (err, data) => {
    if (err == null) {
        files = JSON.parse(data);
    }
});


_existLog = function (file) {
    for(var i=0;i<files.length;i++){
        if(files[i].ID==file.ID)
            return true;
    }
   
    return false;
}

_appendLog = function (file) {
    if (!_existLog(file)) {
        files.push(file);
        var data = JSON.stringify(files);
        fs.writeFile("./downloadLog.json", data, 'utf8', (err) => {
            if (err)
                console.log(err);
        });
    }
}

module.exports = {
    existLog: _existLog,
    appendLog: _appendLog
}