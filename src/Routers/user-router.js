const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const {
  sendWelcomeEmail,
  sendCancellationEmail,
} = require("../emails/account");
const router = new express.Router();

/*

//get the data in app.post to create new user;
//1st step: configuring express to automatically parse the incoming json so we have an accessible object that we can use

//post for user resource creation
app.post("/users", (req, res) => {
  const user = new User(req.body);
  user
    .save()
    .then(() => {
      res.status(201).send(user);
    })
    .catch((e) => {
      //res.status(400); //call it first
      //res.send(e);
      //or you can use the code below for shorter code
      res.status(400).send(e);
    });
});
*/
//recreating app.post into async await
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    //sending welcome message
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.send({ user, token });
    res.status(201).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

//finding user by email and pass
router.post("/users/login", async (req, res) => {
  try {
    //defining our own option (findByCredentials)
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    //function that returns the token
    const token = await user.generateAuthToken();
    //showing users necessary info
    //way1
    //res.send({ user: user.getPublicProfile(), token });
    //way 2
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

//***** log out
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//log out all sessions
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

/*
  //fetching multiple users
  //use find method for multiple users
  app.get("/users", (req, res) => {
    User.find({})
      .then((users) => {
        res.send(users);
      })
      .catch((e) => {
        res.status(500).send(e);
      });
  });
  */

//recreating fetch multiple users into async await
//with middleware: async will only run if the middleware call next()

router.get("/users/me", auth, async (req, res) => {
  //getting your own info if token is valid
  res.send(req.user);
  /*try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
  */
});

/*
  //fetch individual user by ID
  app.get("/users/:id", (req, res) => {
    const _id = req.params.id; //get the id enter in postman; mongoose automatically converts string ID to ObjectID
    User.findById(_id)
      .then((user) => {
        if (!user) {
          return res.status(404).send();
        }
        res.status(200).send(user);
      })
      .catch((e) => {
        res.status(404).send();
      });
  });
  */

//Recreating fetch individual user by ID using Async await
/*
router.get("/users/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(500).send;
  }
});
*/

// Resource updating Endpoints
//updating users info
router.patch("/users/me", auth, async (req, res) => {
  //listing the property allowed to update
  //checking if the property she wants to enter exits
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    //iterate list of update that are applied
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });

    await req.user.save();
    //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true,});

    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send();
  }
});

//Resource Deleting Endpoints; Deleting Users
router.delete("/users/me", auth, async (req, res) => {
  try {
    /*const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(404).send();
    }
    */
    await req.user.remove();
    sendCancellationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

//uploading image
const upload = multer({
  //dest: "avatars",
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Invalid File Type! Please upload an Image file"));
    }
    cb(undefined, true);
  },
});
//adding image to user profile; can be used in updating too
//add auth first
//determine where you will store images of each profile
//add new property in user model called avatar
//remove dest = "avatar from the code above"
//add async
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    //png() converts avatar to png
    //resize() resize the img
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer; //accessing the buffer of avatar and storing it
    await req.user.save(); //saving user profile
    res.status(200).send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//deleting user avatar
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

//fetching an avatar by id
router.get("/users/:id/avatar", async (req, res) => {
  try {
    //looking for image by id
    const user = await User.findById(req.params.id);
    //test if user exits and if has an avatar
    if (!user || !user.avatar) {
      throw new Error();
    }
    //sending back the type of data getting back
    //set() takes two arguments; 1 the name of the response header were trying to set on it; 2nd value of header (ex. jpeg)
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
//require this to index
