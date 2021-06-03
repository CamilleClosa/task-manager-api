//this is where the express application will get setup and exported so our test will be loaded in
//copy code of index.js and paste it here
//remove the listen function and port const and export this

const express = require("express");
require("./db/mongoose");
const userRouter = require("./Routers/user-router");
const taskRouter = require("./Routers/task-router");

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
