var request = require("request").defaults({
    jar: true
})//使用全局cookie

const cron = require('node-cron')//计划任务调度

var fs = require("fs")
var config = require("./config.json")
var downloadLog = require("./downloadlog")
// const fetch = require("node-fetch");

var cookies = "";
var syncState = 0; //同步状态0:未开始，1：启动中，2：运行中
var files = [];
var downloadIndex = 0;

function login() {//模拟登录
    var postData = {
        userName: config.server.username,
        userPass: config.server.password,
        dc: new Date().getTime(),
        IsRecordPwd: 'on'
    }

    var options = {
        uri: config.server.host + '/home/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        form: postData
    }

    request(options, (e, r, b) => {
        if (r.statusCode == 200) {
            var result = JSON.parse(r.body);
            if (result.success) {
                cookies = r.headers['set-cookie'];
            }
        }
    });
}

function listFiles() {//列出文件
    var options = {
        uri: config.server.host + '/Document/GetList',
        method: 'post',
        form: {
            category: 'projectfile',
            page: 1,
            rows: 500//每次同步500条，基本上一周的记录会被获取到
        }
    }

    request(options, (e, r, b) => {
        if (r.statusCode == 200) {
            var reuslt = JSON.parse(b);
            files = reuslt.rows;
            if (files.length > 0) {
                syncState = 2;//设置为下载中
                downloadIndex = 0;
                download();
            }//不完整，暂不考虑没有列表            
        }
    });
}
function download() {
    if (downloadIndex < files.length) {
        var file = files[downloadIndex];
        if (config.downloader.indexOf(file.CreatorName) >= 0) {
            downloadLog.existLog(file, (res) => {
                if (res) {
                    downloadIndex++;
                    download();
                }
                else {
                    downloadFile(file);
                    console.log("开始下载:" + file.Name + "\n");
                }
            },(err)=>{
                console.log(err.message);
            })
        }
        else {
            downloadIndex++;
            download();
        }
    } else {//下载结束
        syncState = 3;
    }
}

function downloadFile(file, onsuccess) {//下载文件  
    var options = {
        uri: config.server.host + '/Base/Document/ListDownload',
        method: 'get',
        form: {
            ids: file.ID
        }
    }
    //
    var filename = file.ID;
    var writeStream = fs.createWriteStream(config.localStorage + filename);
    var readStream = request(options);
    readStream.pipe(writeStream);

    readStream.on('end', function (response) {
        console.log(file.Name + ' 下载完成\n');
        writeStream.end();
    });

    writeStream.on("finish", function () {
        //创建下载记录
        downloadLog.appendLog(file, (res) => {
            //继续下载
            downloadIndex++;
            download();
        });
    });
}


function getState() {
    return syncState;
}


cron.schedule('0 * * * * *', () => {

    var d = new Date();
    var s = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate()
        + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

    if (cookies == "") {
        fs.writeFile(__dirname + "/run.log", s + "登录中...\n", "utf8", (err) => {
            if (!err)
                login()
        });
    }
    else {
        if (syncState == 0) {//如果未启动，
            syncState = 1;//设置启动中
            fs.writeFile(__dirname + "/run.log", s + "开始同步....\n", "utf8", (err) => {
                if (!err)
                    listFiles();
            });
        }
        else if (syncState == 3)//如果是完成状态
        {
            syncState = 0;//恢复未            
        }
    }

})

module.exports = {
    state: getState
}