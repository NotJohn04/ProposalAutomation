function generateQuotations() {
  // -------------- SETTINGS --------------
  const DOC_TEMPLATE_ID = "1erazCxsqp8Zr9MibgHrZJ1UgBPcdxZ8-MekdvUCwebA"; // Replace with your Google Doc template ID
  const DEST_FOLDER_ID  = "1YLSUpKTlBAvFBiuMy3otMbi8cM_Asstb";  // Replace with your destination folder ID
  const MAIN_SHEET_NAME = "Quote(Master)";
  const OTHER_SHEETS = ["Input", "Tariff Bill Calc", "Savings & Offset", "Break-even"];
  const COL_TNB_BILL   = 5;   // E: "Monthly Electricity Bills"
  const COL_DOC_LINK   = 25;  // Y: Google Doc Link (Editable)
  const COL_PDF_LINK   = 26;  // Z: Document Link (PDF)
  const COL_QUOTE_NUM  = 27;  // AA: Quotation Number
  // -------------- END SETTINGS --------------

  // Access the spreadsheet and main sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mainSheet = ss.getSheetByName(MAIN_SHEET_NAME);
  if (!mainSheet) {
    SpreadsheetApp.getUi().alert(`Sheet "${MAIN_SHEET_NAME}" not found.`);
    return;
  }

  // Access other sheets and validate
  const otherSheets = OTHER_SHEETS.map(name => ss.getSheetByName(name)).filter(sheet => sheet != null);
  if (otherSheets.length < OTHER_SHEETS.length) {
    SpreadsheetApp.getUi().alert(`Some sheets not found: ${OTHER_SHEETS.filter(name => !ss.getSheetByName(name)).join(', ')}`);
    return;
  }

  const allSheets = [mainSheet, ...otherSheets];

  // Get the range to process (starting from row 2, assuming row 1 is headers)
  const lastRow = mainSheet.getLastRow();
  const startRow = 2;

  for (let row = startRow; row <= lastRow; row++) {
    // Check conditions to proceed
    const tnbBillValue = mainSheet.getRange(row, COL_TNB_BILL).getValue();
    if (!tnbBillValue || tnbBillValue === 0) {
      Logger.log(`Row ${row}: Monthly Electricity Bills=0/blank => skip.`);
      continue;
    }

    const docLinkCell = mainSheet.getRange(row, COL_DOC_LINK).getValue();
    const pdfLinkCell = mainSheet.getRange(row, COL_PDF_LINK).getValue();
    if (docLinkCell || pdfLinkCell) {
      Logger.log(`Row ${row}: Already has doc/pdf link => skip.`);
      continue;
    }

    // Collect data from all sheets for this row
    const placeholderValues = {};
    allSheets.forEach(sheet => {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const rowValues = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
      headers.forEach((header, index) => {
        if (header) {
          const placeholder = `{{${header}}}`;
          if (placeholder in placeholderValues) {
            Logger.log(`Warning: Duplicate placeholder ${placeholder}. Overwriting with value from ${sheet.getName()}.`);
          }
          placeholderValues[placeholder] = rowValues[index];
        }
      });
    });

    // Add calculated placeholders
    const firstName = placeholderValues['{{First Name}}'] || ''; // From "Input"
    const lastName = placeholderValues['{{Last Name}}'] || '';   // From "Input"
    placeholderValues['{{Full Name}}'] = `${firstName} ${lastName}`.trim();
    placeholderValues['{{Date}}'] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");

    // Manual mappings for template placeholders that don't match sheet headers
    placeholderValues['{{Annual Generation}}'] = placeholderValues['{{Energy Generated (kWh/year)}}'];
    placeholderValues['{{GPS Coordinates}}'] = placeholderValues['{{GPS Coord}}'];
    placeholderValues['{{Help give a name}}'] = placeholderValues['{{Vehicle Travel Equivalent}}'];
    placeholderValues['{{Trees..}}'] = placeholderValues['{{Trees Offset}}'];

    // Copy the template and name it
    const templateFile = DriveApp.getFileById(DOC_TEMPLATE_ID);
    const destinationFolder = DriveApp.getFolderById(DEST_FOLDER_ID);
    const quotationNumber = mainSheet.getRange(row, COL_QUOTE_NUM).getValue() || `Row${row}`;
    const fileName = `Quotation_${quotationNumber}`;
    const newDocFile = templateFile.makeCopy(fileName, destinationFolder);
    Logger.log(`Row ${row}: Created doc -> ${fileName}`);

    // Replace placeholders in the new document
    const doc = DocumentApp.openById(newDocFile.getId());
    const body = doc.getBody();
    for (const [placeholder, value] of Object.entries(placeholderValues)) {
      let replacement;
      if (typeof value === 'number') {
        replacement = value.toFixed(2); // Round to 2 decimal places
      } else if (value instanceof Date) {
        replacement = Utilities.formatDate(value, Session.getScriptTimeZone(), "dd/MM/yyyy");
      } else {
        replacement = value ? value.toString() : ''; // Handle null/undefined as empty string
      }
      body.replaceText(placeholder, replacement);
    }
    doc.saveAndClose();

    // Convert to PDF
    const pdfBlob = newDocFile.getAs(MimeType.PDF);
    const pdfFile = destinationFolder.createFile(pdfBlob).setName(`${fileName}.pdf`);
    const pdfUrl = pdfFile.getUrl();

    // Get the document URL
    const docLink = newDocFile.getUrl();

    // Update the spreadsheet with links
    mainSheet.getRange(row, COL_DOC_LINK).setValue(docLink);
    mainSheet.getRange(row, COL_PDF_LINK).setValue(pdfUrl);
    Logger.log(`Row ${row}: Doc link=${docLink}, PDF link=${pdfUrl}`);
  }

  Logger.log("Done processing all rows.");
}

// Add a custom menu to run the script manually
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Quotation Tools')
    .addItem('Generate Quotations', 'generateQuotations')
    .addToUi();
}