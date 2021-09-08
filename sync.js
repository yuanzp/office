var request = require("request")
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
            'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.84`,
            'Content-Type': 'application/json'
        },
        form: postData
    }

    request(options, (e, r, b) => {
        if (r.statusCode == 200) {
            cookies = r.headers['set-cookie'];
            var result = JSON.parse(r.body);
            if (result.success) {
                listFiles();
            }
        }
    });
}

function listFiles() {//列出文件
    var options = {
        uri: config.server.host + '/Document/GetList',
        method: 'post',
        headers: {
            'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.84`,
            'Content-Type': 'text/html; charset=utf-8',
            'cookie': cookies
        },
        form: {
            category: 'projectfile',
            page: 1,
            rows: 1000
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
            if (downloadLog.existLog(file)) {
                downloadIndex++;
                download();
            }
            else {
                downloadFile(file);
                console.log("开始下载:" + file.Name + "\n");
            }

        }
        else {
            downloadIndex++;
            download();
        }
    } else {//下载结束
        syncState = 3;
        runSync();
    }
}

function downloadFile(file, onsuccess) {//下载文件  
    var options = {
        uri: config.server.host + '/Base/Document/ListDownload',
        method: 'get',
        headers: {
            'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.84`,
            'Content-Type': 'text/html; charset=utf-8',
            'cookie': cookies
        },
        form: {
            ids: file.ID
        }
    }
    //避免文件名重复，增加上传时间标记
    var d = new Date(file.UploadTime);
    var updateTime = file.CreatorName+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+
    +d.getDate()+'-'+d.getHours()+'时'+d.getMinutes()+'分';
    var filename1 = file.Name + '(' + updateTime + ')' + file.FileExt+'.tmp';
    var filename2 = file.Name + '(' + updateTime + ')' + file.FileExt;    
    var writeStream = fs.createWriteStream(config.localStorage + filename1);
    var readStream = request(options);
    readStream.pipe(writeStream);

    readStream.on('end', function (response) {
        console.log(filename2 + ' 下载完成\n');
        writeStream.end();
    });

    writeStream.on("finish", function () {
        fs.rename(config.localStorage +filename1,config.localStorage +filename2,(err)=>{
            if(err)
                console.log("重命名失败\n");
        })
        //创建下载记录
        downloadLog.appendLog(file);
        //继续下载
        downloadIndex++;
        download();
    });
}

function runSync() {
    if (syncState == 0) {//如果未启动，
        syncState = 1;//设置启动中
        console.log("开始同步....\n");
        login();
    }
    else if (syncState == 3)//如果是完成状态
    {
        console.log("同步完成，1分钟后进行下一轮同步\n");
        syncState = 0;//恢复未
        setTimeout(runSync, 1000 * 60);
    }
}

function getState() {
    return syncState;
}

module.exports = {
    run: runSync,
    state: getState
}