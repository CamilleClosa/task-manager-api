const express = require("express");
require("./db/mongoose");
const userRouter = require("./Routers/user-router");
const taskRouter = require("./Routers/task-router");

const app = express();
//where environment where stored
//remove 3000 and create dev.env
const port = process.env.PORT; //|| 3000;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server is up on the port " + port);
});

/*

//********** Adding file upload to express
const multer = require("multer");

//configuring multer
const upload = multer({
  dest: "images", //destination; images is the name of the folder
  //validating file uploads
  limits: {
    fileSize: 1000000,
  },
  //filtering filetype
  //req = request being made
  //file = info about the file being uploaded
  //cb = tell multer that were done filtering the file
  fileFilter(req, file, cb) {
    //getting the filename uploaded
    //check if pdf
    //if (!file.originalname.endsWith(".pdf")) {
    //check if doc or docx
    if (!file.originalname.match(/\.(doc|docx)$/)) {
      //return cb(new Error("Invalid File Type, Please upload a PDF File"));
      return cb(new Error("Invalid File Type, Please upload a Word File"));
    }
    cb(undefined, true);
    //cb(new Error ('File must be a PDF'));
    //cb(undefined, true)
    //cb(undefined, false)
  },
});

//setting up the endpoint for uploading files
// is the middleware; has 1 string argument

//app.post("/upload", upload.single("upload"), (req, res) => {
//  res.send();
//}); 

//handling errors
app.post(
  "/upload",
  upload.single("upload"),
  (req, res) => {
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//express middleware
//this function is going to run between new request and run route handler
//next is use in registering middleware

app.use((req, res, next) => {
  //console.log(req.method, req.path);
  //next();//if next is not called, postman will just load

  //limiting user to use GET
  if (req.method === "GET") {
    res.send("GET request are disabled");
  } else {
    next();
  }
});

//Challenge: Setup middleware for maintenance mode
app.use((req, res, next) => {
  res.status(503).send("Server is currently down");
});




// Without middleware : new request -> run route handler
// With middleware: new request -> do something -> run route handler



//remove test script in package.json
//add "start": "node src/index.js",
//add "dev": "nodemon src/index.js"


//****** Hashing password
const bcrypt = require("bcryptjs");
const myFunction = async () => {
  const password = "camille2021";
  //hash() has 2 arguments; 1st is the plain password; number of rounds you wanna perform
  const hashedPass = await bcrypt.hash(password, 8);

  console.log(password);
  console.log(hashedPass);

  //compare if a given pass matches pass in the database
  //compare() have 2 arguments; 1 is the plain pass; 2nd is hashed pass
  const isMatch = await bcrypt.compare("camille2021", hashedPass);
  console.log(isMatch);
};

myFunction();


//********* JSONWEBTOKEN
const jwt = require("jsonwebtoken");

const myFunction = async () => {
  //sign method return value is the token; 2 arguments; 1st object that contains the data that gonna be embedded to the token ; 2ns string (secret)use to sign the token (your can put any random characters)
  const token = jwt.sign({ _id: "asajdn" }, "ThisIsJWT", {
    expiresIn: "7 days",
  });
  console.log(token);

  //verify token
  //verify takes 2 arguments; 1st the token you are trying to verify; 2nd is the secret to use

  const data = jwt.verify(token, "ThisIsJWT");
  console.log(data);
};


myFunction();


const Task = require("./models/task");
const User = require("./models/user");
const main = async () => {
 
  // task and find user
  const task = await Task.findById("60b5f494ca049516049d8cc4");
  //use populate to know which user created a certain task
  await task.populate("owner").execPopulate();
  console.log(task.owner);
  

  //user and find tasks
  const user = await User.findById("60b5f12715b4ba4788bff4d6");
  await user.populate("tasks").execPopulate();
  console.log(user.tasks); 
};

main();
*/
