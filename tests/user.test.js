//perform refactoring accross two files because express is defined in index.js
//accessing express operation
//const jwt = require("jsonwebtoken");
//const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOne, userOneId, setupDB } = require("./fixtures/db");

/*
//creating ID
const userOneId = new mongoose.Types.ObjectId();

//Adding a user that will be use in log in test case

//NOTE!!!!! This code is moved to db.js so task.test.js also use this
const userOne = {
  _id: userOneId,
  name: "Grace",
  email: "grace@gmail.com",
  password: "grace2021",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
}; */

//**** Setup and Teardown
//Jest life cycle methods - run some code before or after a test case (ex. clear database)
//jestjs.io > Introduction > Setup and Teardown
//we will be using beforeEach()that will run before testcases begin
//wipe all user in db before running the test
beforeEach(setupDB);

test("Should signup a new user", async () => {
  //using supertest
  //send () can help us provide an obj containing our data
  //when you rerun this code, it will fail becase the email is alread saved in the database
  const response = await request(app)
    .post("/users")
    .send({
      name: "Camille",
      email: "carlacamille.closa@gmail.com",
      password: "CamilleAndJo",
    })
    .expect(201); //expecting 201 result if things go well

  //assert that the database was changed correctly
  const user = await User.findById(response.body.user._id);
  //expect that user is not null
  expect(user).not.toBeNull();

  //Assertion about the response
  //if match with other property
  expect(response.body).toMatchObject({
    user: {
      name: "Camille",
      email: "carlacamille.closa@gmail.com",
    },
    token: user.tokens[0].token,
  });

  //expect that the plain text pass is not save in db
  expect(user.password).not.toBe("CamilleAndJo");
});

test("Should Log in existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
  //validate new token is saved
  const user = await User.findById(userOneId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

//TEST LOGIN FAILURE

test("Should not login nonexistent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "camille@gmail.com",
      password: "camille2021",
    })
    .expect(400);
});

//***** TESTING WITH AUTHENTICATIOn
//load in jwt = require ('jsonwebtoken')
//load mongoose
//create user ID
//add token property in userone

//Get Profile with token
test("Should get User Profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

//Should not get profile if the user is not authenticated
test("Should not get User Profile if the user is not authenticated", async () => {
  await request(app).get("/users/me").send().expect(401);
});

//Deleting Account
test("Should delete account for user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

//Do not delete account if user is not authenticated
test("Should not delete account for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

//create another folder called fixtures
//put an image inside the fixtures
test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200);

  //test if binary data of avatar is saved
  const user = await User.findById(userOneId);
  //compare 2 objects using expect use toEqual
  expect(user.avatar).toEqual(expect.any(Buffer));
});

//updating users info
test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Cami",
    })
    .expect(200);
  const user = await User.findById(userOneId);
  expect(user.name).toEqual("Cami");
});

//do not update if the field does not exis
test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      Location: "Philippines",
    })
    .expect(400);
});
