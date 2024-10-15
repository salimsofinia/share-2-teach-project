const { response } = require("../authentication");

// Get elements
const fileInput = document.getElementById("document-upload");
const fileName = document.getElementById("document-name");
const progressBar = document.getElementById("progress-bar");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");

// Add event listeners
fileInput.addEventListener("change", handleFileChange);
saveBtn.addEventListener("click", handleSave);
cancelBtn.addEventListener("click", handleCancel);

// Function to handle file change
function handleFileChange(event) {
  const file = event.target.files[0];
  fileName.textContent = file.name;
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
        showMessage("Pleae check that both fields are filled in.");
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
      showMessage("Successfully logged in!");
      closePopup();
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("Error logging in. Please try again.");
    showMessage("could not log in please try again");
  }
}
// Function to handle save button click
function handleSave() {
  // Add save logic here (e.g., send file to server)
  let progress = 0;
  const intervalId = setInterval(() => {
    progress += 20; // 100% / 5s = 20% per second
    progressBar.value = progress;
    progressText.textContent = `${progress}%`;

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
function searchDocuments() {
  const subject = prompt("Enter document to search:");
  const filteredDocuments = documents.filter(
    (document) => document.subject.toLowerCase() === subject.toLowerCase()
  );
  displayDocuments();
}

// Function to search documents
function searchDocumentsbysubject() {
  const subject = prompt("Enter subject to search:");
  const filteredDocuments = documents.filter(
    (document) => document.subject.toLowerCase() === subject.toLowerCase()
  );
  displayDocuments();
}
function init() {
  console.log("fokfofkfofkofkf");

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

// Retrieve documents from database and display
retrieveDocuments();
displayDocuments();
