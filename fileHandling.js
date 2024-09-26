//Import axios
const axios = require("axios");

//Function to download a file using Axios
function downloadFile(url, filename) {
  axios({
    //URL of file to download
    url: url,
    method: "GET",
    //Handle the response as binary data (Blob)
    responseType: "blob",
  })
    .then((response) => {
      //Create a Blob URL from the response data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      //Create an <a> element for download
      const a = document.createElement("a");
      a.href = url;
      //Set the file name for the download
      a.download = filename;
      //Make the element invisible
      a.style.display = "none";

      //Append to the document
      document.body.appendChild(a);
      //Trigger click which starts download
      a.click();
      //Remove the element
      document.body.removeChild(a);
      //Clean up memory
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      //Catch error
      console.error("Error downloading the file:", error);
    });
}

// Call the function to download the file
downloadFile("https://example.com/file.pdf", "downloaded-file.pdf");

//Let user choose file
var input = document.createElement("input");
//Set input type to file
input.type = "file";
//Put chosen file into file variable (file.name, file.size, file.type)
input.onchange = (e) => {
  var file = e.target.files[0];
};

input.click();
