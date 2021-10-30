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
	downlogs.getLog(fileId, (files) => {
		if (files == null) {
			res.status(404).send("没有找到对应的文件！")
		}
		else {
            let file=files[0];
			var filename = file.Name + file.FileExt;
			fs.access(config.localStorage + file.ID, (err) => {
				if (err == null) {
					res.download(config.localStorage + file.ID, filename)
				}
				else {
					if (err.code == "ENOENT") {
						res.status(404).send("没有找到对应的文件！")
					}
				}
			})
		}
	});

})

app.get("/files", (req, res) => {
	var year = req.query.year;
	var month = req.query.month;
	var day = req.query.day;
	downlogs.getLogs(year, month, day, (files) => {
		res.send(files)
	}, (err) => {
		res.status(500).send(err.message)
	});
})

app.use((error, req, res, next) => {
	fs.writeFile(__dirname + "/err.log", error.stack, "utf8", (err) => {
		if (err != null)
			console.log(err.message);
	});
})



app.listen(port, () => {
	console.log(`sync app listening at http://localhost:${port}`)
	console.log('同步状态:' + sync.state() + '\n');
})

