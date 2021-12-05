const path = require("path")
const fs = require('fs')

const express = require('express')
const app = express()
const port = 6001
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const indexRouter=require("./router/index")
const userRouter=require("./router/users")
const departRouter=require("./router/department")
const employeeRouter=require("./router/employee")
const workLogGroupRouter=require("./router/worklogGroup")
const workItemRouter=require("./router/workItem")
const projectTaskRouter=require("./router/projectTask")
const menuRouter=require("./router/menu")
const roleRouter=require("./router/role")

// app.use((req,res,next)=>{
// 	let u=req.headers['gw-user'];
// 	if(u!=null){
// 		let user=JSON.parse(u);
// 		res.cookie("userName",user.LoginName);
// 	}
	
	
// 	next();

// })

app.use("/",indexRouter)
app.use("/user",userRouter)
app.use("/department",departRouter)
app.use("/employee",employeeRouter)
app.use("/worklogGroup",workLogGroupRouter)
app.use("/workItem",workItemRouter)
app.use("/projectTask",projectTaskRouter)
app.use("/menu",menuRouter)
app.use("/role",roleRouter)


app.use((error, req, res, next) => {
	fs.writeFile(__dirname + "/err.log", error.stack, "utf8", (err) => {
		if (err != null)
			console.log(err.message);
	});
})



app.listen(port, () => {
	console.log(`sync app listening at http://localhost:${port}`)
	
})

