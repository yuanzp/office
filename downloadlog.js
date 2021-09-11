var fs = require("fs");

var files = [];
fs.readFile("./downloadLog.json", (err, data) => {
    if (err == null) {
        files = JSON.parse(data);
    }
});


_existLog = function (file) {
    for (var i = 0; i < files.length; i++) {
        if (files[i].ID == file.ID)
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
_getLog = function (fileId) {
    for (let index = 0; index < files.length; index++) {
        if (fileId == files[index].ID)
            return files[index];
    }
    return null;
}
_getLogs = function (year, month, day) {
    var fs = [];
    files.forEach(file => {
        var _date = new Date(file.CreateTime);
        if (_date.getFullYear() == year &&
            _date.getMonth() == month &&
            _date.getDate() == day) {
            fs.push({
                id: file.ID,
                Name: file.Name + file.FileExt,
                Department: file.DeptName,
                Creator: file.CreatorName,
                CreateTime: file.CreateTime,
                Remark: file.Remark,
                FileSize: file.FileSize
            })
        }
    });

    return fs;
}

module.exports = {
    getLog: _getLog,
    getLogs: _getLogs,
    existLog: _existLog,
    appendLog: _appendLog
}