const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParse = require("cookie-parser");
const Client = require("./models/client.model.js");
const Faq = require("./models/faq.model.js");
const File = require("./models/file.model.js");
const Cloudinary = require("./cloudinary/index.js");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { Console, error } = require("console");
const cookieParser = require("cookie-parser");
const { collection } = require("./models/user.js");
const User = require("./models/user.js");
const Login = require("./routes.js");
require("dotenv").config();
const morgan = require("morgan");
const logger = require("./logger"); // Import your logger
const app = express();
const { performance } = require("perf_hooks");
const redis = require("redis");

const errorRateThreshold = 0.05; // 5%
let totalRequests = 0;
let errorCount = 0;

// Use Morgan to log HTTP requests
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Middleware to count requests and errors
app.use((req, res, next) => {
  totalRequests++;
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      errorCount++;
      logger.error(`Error ${res.statusCode}: ${req.method} ${req.url}`);
    }
    const errorRate = errorCount / totalRequests;
    if (errorRate > errorRateThreshold) {
      console.error(`High error rate: ${(errorRate * 100).toFixed(2)}%`);
    }
  });
  next();
});

// Start the timer
const startTime = performance.now();

// Simulate a long-running process
function longRunningProcess(callback) {
  setTimeout(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`Duration: ${duration} milliseconds`);
    callback();
  }, 2000);
}

longRunningProcess(() => {
  console.log("Process completed");
  const redisClient = redis.createClient();
  redisClient.on("error", (err) => {
    console.error("Error:", err);
  });
  redisClient.on("connect", () => {
    console.log("Connected to Redis");
  });

  const cacheMiddleware = (req, res, next) => {
    const key = `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
    redisClient.get(key, (err, data) => {
      if (err) {
        console.error("Error fetching data from Redis:", err);
        return next();
      }
      if (data !== null) {
        res.json(JSON.parse(data));
      } else {
        next();
      }
    });
  };
});
