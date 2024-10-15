const fileInput = document.getElementById('document-upload');
const documentName = document.getElementById('document-name');
const saveBtn = document.getElementById('save-btn');
const progressBar = document.getElementById('progress-bar');

// Update document name on file selection
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    documentName.innerText = file.name;
});

function updateMenuVisibility() {
    document.body.classList.toggle('logged-in', false); // Define isLoggedIn variable
}

// Function to open popup
function openPopup() {
    document.getElementById('popup').style.display = 'block';
}
  
// Function to close popup
function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// Add event listener to open popup
document.getElementById('popup-opener').addEventListener('click', openPopup);

// Add event listener to close popup
document.getElementById('popup-closer').addEventListener('click', closePopup);

// Save file on button click
saveBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file');
        return;
    }

    const formData = new FormData();
    formData.append('document', file);

    // Send file to server using AJAX
    fetch('/upload-document', {
        method: 'POST',
        body: formData,
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        progressBar.value = 100;
    })
    .catch((error) => {
        console.error(error);
        alert('Error uploading file');
    });
});

let documents = [];

// Function to retrieve documents from database
function retrieveDocuments() {
    // Replace this with your actual database retrieval code
    documents = [
        { id: 1, title: "Document 1", filename: "document1.pdf", subject: "Math" },
        { id: 2, title: "Document 2", filename: "document2.pdf", subject: "Science" },
        { id: 3, title: "Document 3", filename: "document3.pdf", subject: "History" },
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
    const filteredDocuments = documents.filter((document) => document.subject.toLowerCase() === subject.toLowerCase());
    displayDocuments();
}

// Function to search documents
function searchDocumentsbysubject() {
    const subject = prompt("Enter subject to search:");
    const filteredDocuments = documents.filter((document) => document.subject.toLowerCase() === subject.toLowerCase());
    displayDocuments();
}

// Retrieve documents from database and display
retrieveDocuments();
displayDocuments();