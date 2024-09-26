//importing libraries to identify file types and convert to pdf.
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { PDFDocument } = require('pdf-lib');
const docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const xlsx = require('xlsx');
const imageConverter = require('image-converter');

// Global variable to store the new PDF file
let newPdfFile;

const conversionFunctions = {
  'text/plain': convertTextToPdf,
  'image/jpeg': convertImageToPdf,
  'image/png': convertImageToPdf,
  'application/msword': convertDocxToPdf,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': convertDocxToPdf,
  'application/vnd.ms-excel': convertXlsxToPdf,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': convertXlsxToPdf,
};
//aquaring file type
async function convertFileToPdf(filePath) {
  const fileType = mime.lookup(filePath);
  const conversionFunction = conversionFunctions[fileType];

  if (!conversionFunction) {
    console.log(`Unsupported file type: ${fileType}`);
    return null;
  }

  return await conversionFunction(filePath);
}
//conversion function of text file to pdf
async function convertTextToPdf(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const pdfDoc = await PDFDocument.create();
  pdfDoc.addText(fileContent);
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
//conversion function of image file to pdf
async function convertImageToPdf(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.create();
  const image = await pdfDoc.embedImage(fileBuffer);
  pdfDoc.addImage(image);
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
//conversion function of word(docx) file to pdf
async function convertDocxToPdf(filePath) {
  const content = fs.readFileSync(filePath, 'binary');
  const zip = new PizZip(content);
  const doc = new docxtemplater(zip);
  const pdf = doc.getZip().generate({ type: 'nodebuffer' });
  return pdf;
}
//conversion function of excel(xlsx) file to pdf
async function convertXlsxToPdf(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const pdf = xlsx.utils.sheet_to_pdf(worksheet);
  return pdf;
}


//testing purposes.
const directoryPath = './files';
fs.readdir(directoryPath, async (err, files) => {
  if (err) {
    console.error(err);
  } else {
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      newPdfFile = await convertFileToPdf(filePath);
      if (newPdfFile) {
        // Use the newPdfFile global variable as needed
        console.log(`PDF file created: ${filePath}.pdf`);
        // Save the PDF file to disk
        fs.writeFileSync(`${filePath}.pdf`, newPdfFile);
      }
    }
  }
});
