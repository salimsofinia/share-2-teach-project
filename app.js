//monitoring of response time
/*const { performance } = require('perf_hooks');

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
    console.log(
*/

//monitoring error rates using winston library
/*const express = require('express');
const app = express();
const winston = require('winston');
const errorRateThreshold = 0.05; // 5%
let totalRequests = 0;
let errorCount = 0;

// Configure Winston
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'errors.log' })
    ]
});

// Middleware to count requests and errors
app.use((req, res, next) => {
    totalRequests++;
    res.on('finish', () => {
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

// Your routes here
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// Error route for testing
app.get('/error', (req, res) => {
    res.status(500).send('Internal Server Error');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
*/

//integrating morgan and winston for logging
/*const express = require('express');
const morgan = require('morgan');
const logger = require('./logger');
const app = express();

// Use Morgan to log HTTP requests
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Example route
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// Error route for testing
app.get('/error', (req, res) => {
    res.status(500).send('Internal Server Error');
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(500).send('Something went wrong!');
});

app.listen(3000, () => {
    logger.info('Server is running on port 3000');
});
*/

/*This setup will log:

HTTP Requests: Through Morgan, integrating with Winston to log request details.

Errors: Both handled and unhandled errors, logged in detail by Winston.*/
