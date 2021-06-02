//Challenge
//Goal: Setup the task creation endpoint
//1. Create a separate file for task model (load it into index.js)

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const task = mongoose.model("tasks", taskSchema);

module.exports = task;
