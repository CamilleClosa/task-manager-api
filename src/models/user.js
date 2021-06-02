const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

//for password hashing
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, //users are required put data
      trim: true, //remove extra spaces
    },
    //using npm validator
    email: {
      type: String,
      unique: true,
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
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer, //allow us to store buffer with binary image data in user database
    },
  },
  //second Argument in Schema, timestamps
  {
    timestamps: true,
  }
);

//setup virtual property; connection between users and tasks
userSchema.virtual("tasks", {
  ref: "tasks",
  localField: "_id",
  foreignField: "owner",
});
//hiding Private Data
//way1
//userSchema.methods.getPublicProfile = function () {
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  //hiding this info upon logging in
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};
//set the middleware
//pre() doing something before an event; 2 argument; 1st of events;2 function to run
//post () doing something just after an event

//generate and return token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  //saving to database
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  //find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

//hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next(); //if next is not called it will just hang
});

//Middleware that deletes the tasks when user is remove
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
