//import express
const express = require("express");
//import mongoose
const mongoose = require("mongoose");
//create instance of express
const app = express();

//Mongodb connection here
//mongoose.connect('mongodb:urlhere').
//    catch(error => handleError(error));

//use express to parse json
app.use(express.json());

//user schema here
/*const User = mongoose.model("User", new mongoose.Schema({
    id: Number,
    name: String,
    surname: String,
    email: String,
  })
);*/

//Routes

//get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send("Error retrieving users");
  }
});

//get specific user
app.get("/users/:id", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send("Error retrieving users");
  }
});
