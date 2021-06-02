const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

/*
//task resource creation
router.post("/tasks", (req, res) => {
    const task = new Task(req.body);
    task
      .save()
      .then(() => {
        res.status(201).send(task);
      })
      .catch((e) => {
        //res.status(400); //call it first
        //res.send(e);
        //or you can use the code below for shorter code
        res.status(400).send(e);
      });
  });
  */

//Recreating task resource creation using async await
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

/*
  //fetching multiple tasks
  app.get("/tasks", (req, res) => {
    Task.find({})
      .then((tasks) => {
        res.send(tasks);
      })
      .catch((e) => {
        res.status(500).send(e);
      });
  });
*/

//Recreating fetching multiple tasks using async await
//displaying tasks created by user who logged in

//Paginating Data; limit and skip
//GET /tasks?limit=10&skip=0
//GET /tasks?sortBy=createdAt:desc
router.get("/tasks", auth, async (req, res) => {
  //FILTERING GET /task?completed=x
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        //pagination and sorting
        //GET /tasks?limit=x&skip=x
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

/*
  //fetching single task by id
  app.get("/tasks/:id", (req, res) => {
    const _id = req.params.id; //get the id enter in postman; mongoose automatically converts string ID to ObjectID
    Task.findById(_id)
      .then((task) => {
        if (!task) {
          return res.status(404).send();
        }
        res.status(200).send(task);
      })
      .catch((e) => {
        res.status(404).send();
      });
  });
  */

//Recreating fetching single task by id using async await

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id; //get the id enter in postman; mongoose automatically converts string ID to ObjectID
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      res.status(404).send();
    }
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send();
  }
});

//Updating TaskbyID
router.patch("/tasks/:id", auth, async (req, res) => {
  //listing the property allowed to update
  //checking if the property she wants to enter exits
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    //changing code below to make sure that our middleware works properly
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true,runValidators: true,});
    if (!task) {
      res.status(404).send();
    }
    updates.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();
    res.status(200).send(task);
  } catch (e) {
    res.status(400).send();
  }
});

//Resource Deleting Endpoints
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
