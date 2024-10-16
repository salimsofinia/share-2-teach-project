const { name } = require("ejs");
const { response } = require("../authentication");

// Get elements
const fileInput = document.getElementById("choose-document-upload");
const fileName = document.getElementById("document-name");
const progressBar = document.getElementById("progress-bar");
const saveBtn = document.getElementById("save-btn-upload");
const cancelBtn = document.getElementById("cancel-btn-upload");

// Add event listeners
fileInput.addEventListener("change", handleFileChange);
saveBtn.addEventListener("click", handleSave);
cancelBtn.addEventListener("click", handleCancel);

saveBtn.addEventListener("click", (event) => {
  console.log("Hello i am pressing the save buttoin"); // Call your download function
});

let fileSelectedUpload = "";

// Function to handle file change
function handleFileChange(event) {
  console.log("asasasasdfadsf");
  const file = event.target.files[0];
  fileSelectedUpload = file;
  //fileName.textContent = file.name;
  // Update progress bar (optional)
  progressBar.value = 0;
}

async function Login() {
  try {
    // Ensure the elements exist and are accessed correctly
    const loginEmail = document.getElementById("loginE-mail"); // Correct ID for email input
    const loginPassword = document.getElementById("loginPassword"); // Correct ID for password input

    // Ensure both elements exist and have a value property

    if (!loginEmail || !loginPassword) {
      throw new Error("Email or password field is missing in the DOM.");
    }

    const requestData = {
      email: loginEmail.value,
      password: loginPassword.value,
    };

    // Perform the fetch request with raw JSON data
    const response = await fetch("/api/login", {
      method: "POST", // The HTTP method
      headers: {
        "Content-Type": "application/json", // Specify that we're sending JSON
      },
      body: JSON.stringify(requestData), // Convert JavaScript object to JSON string
    });

    // Check if the response status is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json(); // Parse the response data
    console.log(data);
    const userRole = data.role;
    if (userRole == "Admin") {
      const isLoggedIn = true;
      const viewItems = document.querySelectorAll(".hide-when-logged-out"); // Select nav items

      viewItems.forEach((item) => {
        item.style.display = isLoggedIn ? "list-item" : "none"; // Show or hide based on login state
      });
      const expires = new Date(Date.now() + 3600000).toUTCString(); //i hour
      document.cookie = "isLoggedIn=true; expires=${expires}";
      document.cookie = "isAdmin=true; expires=${expires}";
      alert("Welcome, you have been sucessfully logged in ");
      closePopup();
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("Error logging in. Please try again.");
  }
  location.reload();
}
// Function to handle save button click
function handleSave() {
  console.log("saved");
  // Add save logic here (e.g., send file to server)
  let progress = 0;
  const intervalId = setInterval(() => {
    progress += 20; // 100% / 5s = 20% per second
    progressBar.value = progress;
    progressBar.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(intervalId);
      console.log("Upload complete!");
      // Reset file input after upload completion
      fileInput.value = "";
      fileName.textContent = "";
    }
  }, 1000); // 1000ms = 1 second

  console.log("File upload started...");
}

// Function to handle cancel button click
function handleCancel() {
  // Reset file input
  fileInput.value = "";
  fileName.textContent = "";
  progressBar.value = 0;
}

function updateMenuVisibility() {
  document.body.classList.toggle("logged-in", false); // Define isLoggedIn variable
}

// Function to open popup
function openPopup() {
  document.getElementById("popup").style.display = "block";
}

// Function to close popup
function closePopup() {
  document.getElementById("popup").style.display = "none";
}

// Add event listener to open popup
document.getElementById("popup-opener").addEventListener("click", openPopup);

// Add event listener to close popup
document.getElementById("popup-closer").addEventListener("click", closePopup);

// Save file on button click
saveBtn.addEventListener("click", () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file");
    return;
  }

  const formData = new FormData();
  formData.append("document", file);

  // Send file to server using AJAX
  fetch("/upload-document", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      progressBar.value = 100;
    })
    .catch((error) => {
      console.error(error);
      alert("Error uploading file");
    });
});

let documents = [];

// Function to retrieve documents from database
function retrieveDocuments() {
  // Replace this with your actual database retrieval code
  documents = [
    { id: 1, title: "Document 1", filename: "document1.pdf", subject: "Math" },
    {
      id: 2,
      title: "Document 2",
      filename: "document2.pdf",
      subject: "Science",
    },
    {
      id: 3,
      title: "Document 3",
      filename: "document3.pdf",
      subject: "History",
    },
    // Add more documents here...
  ];
}

// Function to display document list
function displayDocuments() {
  const documentList = document.getElementById("document-list");
  documentList.innerHTML = "";

  documents.forEach((document) => {
    const link = document.createElement("a");
    link.href = `documents/${document.filename}`;
    link.textContent = document.title;

    const listItem = document.createElement("li");
    listItem.appendChild(link);

    documentList.appendChild(listItem);
  });
}

// Function to search documents
async function searchDocuments() {
  const query = prompt("Enter document name subject or grade to search:");
  console.log(query);
  let response = "";
  if (query === "") {
    response = await fetch("/api/file/" + query, {
      method: "GET", // The HTTP method
    });
  } else {
    response = await fetch("/api/file/search/" + query, {
      method: "GET", // The HTTP method
    });
  }

  // Check if the response status is OK (status code 200-299)
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json(); // Parse the response data
  console.log(data);
  const faqTableBody = document
    .getElementById("fileTable")
    .getElementsByTagName("tbody")[0];

  faqTableBody.innerHTML = "";
  let count = 0;
  // Populate the table with the fetched data
  data.forEach((file) => {
    const row = faqTableBody.insertRow(); // Create a new row

    // Create and insert cells into the row
    const nameCell = row.insertCell(0);
    const sizeCell = row.insertCell(1);
    const subjectCell = row.insertCell(2);
    const gradeCell = row.insertCell(3);
    const scoreCell = row.insertCell(4);
    const ratingCell = row.insertCell(5);
    const downloadCell = row.insertCell(6);

    const fileId = data[count]._id;
    const fileName = data[count].fileName;
    // Set the cell values
    nameCell.textContent = data[count].fileName;
    sizeCell.textContent =
      (data[count].fileSize / (1024 * 1024)).toFixed(2) + " MB";
    subjectCell.textContent = data[count].subject;
    gradeCell.textContent = data[count].grade;
    scoreCell.innerHTML = generateStaticStarRating(
      calcAvgRating(file.ratings),
      fileId
    );
    // Generate and set the clickable star rating
    ratingCell.innerHTML = generateClickableStarRating(
      calcAvgRating(file.ratings),
      fileId
    ); // Pass index for unique ID
    // Set the innerHTML for the downloadCell with correct syntax
    downloadCell.innerHTML = `<button type="button" id="${fileId}">Download</button>`;

    // Retrieve the button element after it has been inserted into the DOM
    const button = document.getElementById(fileId.toString());

    // Check if the button exists before attaching the event listener
    if (button) {
      button.addEventListener("click", (event) => {
        downloadButtonClick(event, fileId, fileName); // Call your download function
      });
    } else {
      console.error(`Button with ID ${fileId} not found`);
    }

    console.log(data[count]._id);
    const stars = ratingCell.querySelectorAll(".star");
    stars.forEach((star) => {
      star.addEventListener("mouseover", handleStarHover);
      star.addEventListener("mouseout", handleStarMouseOut);
      star.addEventListener("click", (event) => handleStarClick(event, fileId));
    });

    count++;
  });

  // Check if the response status is OK (status code 200-299)
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  // displayDocuments();
}

// Function to search documents
function searchDocumentsbysubject() {
  const subject = prompt("Enter subject to search:");
  const filteredDocuments = documents.filter(
    (document) => document.subject.toLowerCase() === subject.toLowerCase()
  );
  displayDocuments();
}

function calcAvgRating(ratings) {
  console.log(ratings);
  if (ratings.length === 0) {
    return 0;
  }
  let sum = 0;

  ratings.forEach((rating) => {
    sum += rating;
  });

  console.log(sum);
  return (sum / ratings.length).toFixed(2);
}

// Function to generate clickable star rating
function generateClickableStarRating(avgRating, fileIndex) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= avgRating) {
      stars += `<span class="star" data-file="${fileIndex}" data-rating="${i}"">★</span>`;
    } else {
      stars += `<span class="star" data-file="${fileIndex}" data-rating="${i}"">★</span>`;
    }
  }
  return stars;
}

// Function to generate clickable star rating
function generateStaticStarRating(avgRating, fileIndex) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= avgRating) {
      stars += `<span class="static-star filled" data-file="${fileIndex}" data-rating="${i}"">★</span>`;
    } else {
      stars += `<span class="static-star" data-file="${fileIndex}" data-rating="${i}"">★</span>`;
    }
  }
  return stars;
}

async function downloadButtonClick(event, fileID, fileName) {
  const fileId = fileID; // Replace with your actual file ID
  fetch(`/api/file/${fileId}`, {
    method: "GET", // Make sure you are using the correct method
  })
    .then((response) => {
      // Check if the response is OK (status 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Get the response as a Blob for downloading
      return response.blob();
    })
    .then((blob) => {
      // Create a URL for the Blob
      const url = window.URL.createObjectURL(blob);
      // Create an anchor element to trigger the download
      const a = document.createElement("a");
      a.style.display = "none"; // Hide the anchor
      a.href = url; // Set the Blob URL as href
      a.download = fileName; // Set the desired file name
      document.body.appendChild(a); // Append anchor to the body
      a.click(); // Programmatically click the anchor to trigger the download
      window.URL.revokeObjectURL(url); // Clean up
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function handleStarHover(event) {
  const rating = event.target.getAttribute("data-rating");
  const stars = event.target.parentElement.children;

  // Fill all stars up to the one being hovered
  for (let i = 0; i < stars.length; i++) {
    stars[i].classList.remove("hover");
    if (i < rating) {
      stars[i].classList.add("hover");
    }
  }
}

// Handle mouse out to reset stars to their default filled state
function handleStarMouseOut(event) {
  const stars = event.target.parentElement.children;
  for (let i = 0; i < stars.length; i++) {
    stars[i].classList.remove("hover");
  }
}

// Handle click to set the selected rating
async function handleStarClick(event, fileIndex) {
  const selectedRating = event.target.getAttribute("data-rating");
  const selectedFile = event.target.getAttribute("data-file");
  const stars = event.target.parentElement.children;

  // Fill stars permanently after click
  for (let i = 0; i < stars.length; i++) {
    stars[i].classList.remove("filled");
    if (i < selectedRating) {
      stars[i].classList.add("filled");
    }
  }

  // Send the rating to the server (this is just an example)
  try {
    const response = await fetch("/api/file/rate/" + selectedFile, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating: selectedRating }),
    });

    if (!response.ok) {
      throw new Error("Failed to update rating");
    }

    const data = await response.json();
    console.log("Rating updated successfully:", data);
    popFileTable();
  } catch (error) {
    console.error("Error updating rating:", error);
  }
}
/*
async function modifyButtonClick(event, fileID, fileName) {
  const fileId = fileID; // Replace with your actual file ID
  fetch(`/api/file/${fileId}`, {
    method: "GET", // Make sure you are using the correct method
  })
    .then((response) => {
      // Check if the response is OK (status 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Get the response as a Blob for downloading
      return response.blob();
    })
    .then((blob) => {
      // Create a URL for the Blob
      const url = window.URL.createObjectURL(blob);
      // Create an anchor element to trigger the download
      const a = document.createElement("a");
      a.style.display = "none"; // Hide the anchor
      a.href = url; // Set the Blob URL as href
      a.download = fileName; // Set the desired file name
      document.body.appendChild(a); // Append anchor to the body
      a.click(); // Programmatically click the anchor to trigger the download
      window.URL.revokeObjectURL(url); // Clean up
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}
*/
async function popUserTable() {
  const response = await fetch("/api/users", {
    method: "GET", // The HTTP method
  });

  // Check if the response status is OK (status code 200-299)
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json(); // Parse the response data
  console.log(data);
  const usertablebody = document
    .getElementById("userTable")
    .getElementsByTagName("tbody")[0];

    usertablebody.innerHTML = "";
  let count = 0;
  // Populate the table with the fetched data
  data.forEach((user) => {
    const row = usertablebody.insertRow(); // Create a new row

    // Create and insert cells into the row
    const nameCell = row.insertCell(0);
    const surnameCell = row.insertCell(1);
    const emailCell = row.insertCell(2);
    const RoleCell = row.insertCell(3);
    const ModifyCell = row.insertCell(4);

    const userId = data[count]._id;
    const FirstName = data[count].firstname;
    // Set the cell values
    nameCell.textContent = data[count].firstname;
    surnameCell.textContent = data[count].lastname;
    emailCell.textContent = data[count].email;
    RoleCell.textContent = data[count].role;
    
    
  
    ModifyCell.innerHTML = `<button type="button" id="${userId}">Modify</button>`;
    const button = document.getElementById(userId.toString());
    if (button) {
      button.addEventListener("click", (event) => {
        modifyButtonClick(event, userId, FirstName); // Call your download function
      });
    } else {
      console.error(`Button with ID ${userId} not found`);
    }

    console.log(data[count]._id);
    count++;
  });
}
////////////////////////////////////////////////////////////////////////////////
async function popFileTable() {
  const response = await fetch("/api/file", {
    method: "GET", // The HTTP method
  });

  // Check if the response status is OK (status code 200-299)
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json(); // Parse the response data
  console.log(data);
  const faqTableBody = document
    .getElementById("fileTable")
    .getElementsByTagName("tbody")[0];

  faqTableBody.innerHTML = "";
  let count = 0;
  // Populate the table with the fetched data
  data.forEach((file) => {
    const row = faqTableBody.insertRow(); // Create a new row

    // Create and insert cells into the row
    const nameCell = row.insertCell(0);
    const sizeCell = row.insertCell(1);
    const subjectCell = row.insertCell(2);
    const gradeCell = row.insertCell(3);
    const scoreCell = row.insertCell(4);
    const ratingCell = row.insertCell(5);
    const downloadCell = row.insertCell(6);

    const fileId = data[count]._id;
    const fileName = data[count].fileName;
    // Set the cell values
    nameCell.textContent = data[count].fileName;
    sizeCell.textContent =
      (data[count].fileSize / (1024 * 1024)).toFixed(2) + " MB";
    subjectCell.textContent = data[count].subject;
    gradeCell.textContent = data[count].grade;
    scoreCell.innerHTML = generateStaticStarRating(
      calcAvgRating(file.ratings),
      fileId
    );
    // Generate and set the clickable star rating
    ratingCell.innerHTML = generateClickableStarRating(
      calcAvgRating(file.ratings),
      fileId
    ); // Pass index for unique ID
    // Set the innerHTML for the downloadCell with correct syntax
    downloadCell.innerHTML = `<button type="button" id="${fileId}">Download</button>`;

    // Retrieve the button element after it has been inserted into the DOM
    const button = document.getElementById(fileId.toString());

    // Check if the button exists before attaching the event listener
    if (button) {
      button.addEventListener("click", (event) => {
        downloadButtonClick(event, fileId, fileName); // Call your download function
      });
    } else {
      console.error(`Button with ID ${fileId} not found`);
    }

    console.log(data[count]._id);
    const stars = ratingCell.querySelectorAll(".star");
    stars.forEach((star) => {
      star.addEventListener("mouseover", handleStarHover);
      star.addEventListener("mouseout", handleStarMouseOut);
      star.addEventListener("click", (event) => handleStarClick(event, fileId));
    });

    count++;
  });
}

async function popFaqTable() {
  const response = await fetch("/api/faqs", {
    method: "GET", // The HTTP method
  });

  // Check if the response status is OK (status code 200-299)
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json(); // Parse the response data

  const faqTableBody = document
    .getElementById("faqTable")
    .getElementsByTagName("tbody")[0];

  faqTableBody.innerHTML = "";
  let count = 0;
  // Populate the table with the fetched data
  data.forEach((faq) => {
    const row = faqTableBody.insertRow(); // Create a new row

    // Create and insert cells into the row
    const questionCell = row.insertCell(0);
    const answerCell = row.insertCell(1);

    // Set the cell values
    questionCell.textContent = data[count].question;
    answerCell.textContent = data[count].answer;
    count++;
  });
}
function logout() {
  // Hide logout button
  const logoutBtn = document.getElementById("navlogout");
  logoutBtn.style.display = "none";

  // Set cookies to indicate logged-out state
  document.cookie = "isLoggedIn=false";
  document.cookie = "isAdmin=false";

  // Optional: Remove any other authentication tokens or session data

  // Reload page
  location.reload();
  alert("You have been logged out.");
}
function init() {
  const logoutBtn = document.getElementById("navlogout");
  logoutBtn.style.display = "none";
  const isLoggedIn = document.cookie.includes("isLoggedIn=true");
  const isAdmin = document.cookie.includes("isAdmin=true");

  if (isLoggedIn) {
    const logoutBtn = document.getElementById("navlogout");
    logoutBtn.style.display = "block";
    const viewItems = document.querySelectorAll(".hide-when-logged-out");
    viewItems.forEach((item) => {
      item.style.display = "block";
    });

    const navlogin = document.getElementById("navlogin");
    if (navlogin) {
      navlogin.style.display = "none";
    }

    document.body.classList.add("logged-in");

    if (isAdmin) {
      const logoutBtn = document.getElementById("navlogout");
      logoutBtn.style.display = "block";
      document.body.classList.add("logged-in-as-admin");
      const adminItems = document.querySelectorAll(".hide-when-not-admin");
      adminItems.forEach((item) => {
        item.style.display = "block";
      });
    }
  } else {
    // Optional: Handle logged-out state
    const viewItems = document.querySelectorAll(".hide-when-logged-in");
    viewItems.forEach((item) => {
      item.style.display = "block";
    });

    const navlogin = document.getElementById("navlogin");
    if (navlogin) {
      navlogin.style.display = "block";
    }

    document.body.classList.remove("logged-in");
    document.body.classList.remove("logged-in-as-admin");

    const adminItems = document.querySelectorAll(".hide-when-not-admin");
    adminItems.forEach((item) => {
      item.style.display = "none";
    });
  }
}

function initrest() {
  const isLoggedIn = document.cookie.includes("isLoggedIn=true");
  const isAdmin = document.cookie.includes("isAdmin=true");

  if (isLoggedIn) {
    const viewItems = document.querySelectorAll(".hide-when-logged-out");
    viewItems.forEach((item) => {
      item.style.display = "block";
    });

    document.body.classList.add("logged-in");

    if (isAdmin) {
      document.body.classList.add("logged-in-as-admin");
      const adminItems = document.querySelectorAll(".hide-when-not-admin");
      adminItems.forEach((item) => {
        item.style.display = "block";
      });
    }
  }
}

//code for watermark(later use)
/*
const addWatermarkToPdf = (pdfFile, watermarkImage) => {
  // Create a new jsPDF instance
  const pdf = new jsPDF();

  // Add the original PDF pages
  pdf.addImage(pdfFile, 'JPEG', 0, 0);

  // Add the watermark image
  pdf.addImage(watermarkImage, 'PNG', 100, 100, 100, 50, null, null, 0.5); // 50% opacity

  // Save the watermarked PDF
  const watermarkedPdf = pdf.output('blob');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(watermarkedPdf);
  link.download = 'watermarkedPdf.pdf';
  link.click();
};

// Example usage:

const pdfFile = 'path/to/your/pdf/file.pdf';
const watermarkImage = 's2t.png';
addWatermarkToPdf(pdfFile, watermarkImage);
*/

// Retrieve documents from database and display
retrieveDocuments();
displayDocuments();
