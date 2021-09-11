const path = require("path")
const fs = require('fs')
const config = require("./config.json")
const downlogs = require("./downloadlog")

var sync = require("./sync")

const express = require('express')
const app = express()
const port = 9000
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static("static"));

app.get('/', (req, res) => {
  var filename = path.resolve(__dirname, "/static/index.html")
  res.sendFile(filename)
})
app.get("/file", (req, res) => {
  var fileId = req.query.fileId;
  var file = downlogs.getLog(fileId);
  if (file == null) {
    res.status(404).send("没有找到对应的文件！")
  }
  else {
    var filename = file.Name + file.FileExt;
    fs.access(config.localStorage + file.ID, (err) => {
      if (err.code == "ENOENT") {
        res.status(404).send("没有找到对应的文件！")
      }else{
        res.download(config.localStorage + file.ID, filename)
      }
    })    
  }
})

app.get("/files", (req, res) => {
  var year = req.query.year;
  var month = req.query.month;
  var day = req.query.day;
  var files = downlogs.getLogs(year, month, day);
  res.send(files)
})

app.listen(port, () => {
  console.log(`sync app listening at http://localhost:${port}`)
  sync.run();
})

