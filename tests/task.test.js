const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/task");
const {
  userOne,
  userOneId,
  setupDB,
  userTwo,
  userTwoId,
  taskOne,
  taskTwo,
  taskThree,
} = require("./fixtures/db");

//create a file(db.js) under fixtures
//test case can interfere with each other to fix these, edit package json and add --runInBand
//db.js will hold all the code for test data
beforeEach(setupDB);

//Test creation of task for user
test("Should ceate task for user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "Practicing Jest For Task",
    })
    .expect(201);

  //test if task is saved in db
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();

  //test if the completed property is false
  expect(task.completed).toEqual(false);
});

//Challenge

//Return tasks owned by user
test("Should return tasks owned by the user", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body.length).toEqual(2);
});

//Delete Task security
//attempt second user to delete task owned by first user
test("Should not delete Task owned by other user", async () => {
  const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});

//
