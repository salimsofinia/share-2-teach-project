const fileInput = document.getElementById('document-upload');
const documentName = document.getElementById('document-name');
const saveBtn = document.getElementById('save-btn');
const progressBar = document.getElementById('progress-bar');

// Update document name on file selection
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    documentName.innerText = file.name;
});

// Function to open popup
function openPopup() {
    document.getElementById('popup').style.display = 'block';
  }
  
  // Function to close popup
  function closePopup() {
    document.getElementById('popup').style.display = 'none';
  }
  
// Save file on button click
saveBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
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
        // Update progress bar
        progressBar.value = 100;
    })
    .catch((error) => {
        console.error(error);
    });
});