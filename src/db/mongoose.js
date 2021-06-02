const mongoose = require("mongoose");

//to connect to database
//connect aruments (url, options obj)
mongoose.connect(process.env.CONNECT_TO_DB, {
  //task-manager-api is now added as collection
  useNewUrlParser: true,
  useCreateIndex: true, //this will make sure that mongoose and mongodb are working properly
  useFindAndModify: false, //address the deprecation warning in promise chaining
});

/*
//model() 2 argument; 1. String name of model; 2. definition of field
const User = mongoose.model("User", {
  name: {
    type: String,
  },
  age: {
    type: Number,
  },
});

//add documents to db
const me = new User({
  name: "Mikaela",
  age: 24,
});

//saving me to db
me.save()
  .then(() => {
    console.log(me);
  })
  .catch((error) => {
    console.log(error);
  });


//************ Challenge
//Goal: Create a model for tasks
//1. Define the model with description and completed fields
//2.Create a new instance of the model
//3. Save the model to the databse

const tasks = mongoose.model("tasks", {
  description: {
    type: String,
  },
  completed: {
    type: Boolean,
  },
});

const mytask = new tasks({
  description: "cooking",
  completed: true,
});

mytask
  .save()
  .then(() => {
    console.log(mytask);
  })
  .catch((error) => {
    console.log(error);
  });


//********* Data Validation and Sanitization
//Data Validation - we can set rules ex. age must be >18
//Data Sanitization - allow us to edit the data before saving ex. removing spaces

const User = mongoose.model("User", {
  name: {
    type: String,
    required: true, //users are required put data
    trim: true, //remove extra spaces
  },
  //using npm validator
  email: {
    type: String,
    require: true,
    trim: true,
    lowercase: true, //convert email to lowercase before saving
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email");
      }
    },
  },
  age: {
    type: Number,
    //validate if the user enter -age
    default: 0, //set 0 if user didn't provide
    validate(value) {
      if (value < 0) {
        throw new Error("Invalid age. Enter a positive number");
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("Invalid password");
      }
    },
  },
});

const me = new User({
  name: "Zhyryl Santillan", //if this is blank, it wont save
  email: "zhy@gmail.com   ",
  age: 21,
  password: "Password",
});

me.save()
  .then(() => {
    console.log(me);
  })
  .catch((error) => {
    console.log(error);
  });

//******Challenge
//Goal: Add validation and sanitization to task
//1. trim the description and make it required
//2. make completed optional and default it to false
const tasks = mongoose.model("tasks", {
  description: {
    type: String,
    trim: true,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const mytask = new tasks({});

mytask
  .save()
  .then(() => {
    console.log(mytask);
  })
  .catch((error) => {
    console.log(error);
  });

  */
