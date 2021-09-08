const path = require("path")
const fs = require('fs')
const config = require("./config.json")

var sync = require("./sync")

const express = require('express')
const app = express()
const port = 9000

app.use("/download", express.static(config.localStorage))

app.get('/', (req, res) => {
  var filename = path.resolve(__dirname, "index.html")
  res.sendFile(filename)
})

app.get("/files", (req, res) => {

  var files =fs.readdirSync(config.localStorage); 
  res.send(files)
})

app.listen(port, () => {
  console.log(`sync app listening at http://localhost:${port}`)

  sync.run();
})

