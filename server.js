//import express
const express = require("express");
//create instance of express
const app = express();
//.use responds to any http request
app.use(() => {
  console.log("NEW REQUEST RECIEVED!");
});
//create localhost server on port 3000, open "localhost:3000" on browser to send request
app.listen(3000, () => {
  console.log("LISTENING ON PORT 3000!");
});
