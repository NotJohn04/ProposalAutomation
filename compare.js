function updateOpportunityId() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet1 = ss.getSheetByName('Sheet1'); // Replace with your actual sheet name
  const sheet2 = ss.getSheetByName('Sheet2'); // Replace with your actual sheet name

  if (!sheet1 || !sheet2) {
    Logger.log("One of the sheets is missing!");
    return;
  }

  const data1 = sheet1.getDataRange().getValues();
  const data2 = sheet2.getDataRange().getValues();

  // Assuming names are in column A (index 0) and Opportunity ID in column R (index 17) in Sheet1
  // Assuming names are in column F (index 5) and Opportunity ID in column J (index 9) in Sheet2

  for (let i = 1; i < data1.length; i++) { // Start from 1 to skip headers
    const name1 = data1[i][0]; // Get the name from Sheet1
    const opportunityId = data1[i][17]; // Get the Opportunity ID from Sheet1

    for (let j = 1; j < data2.length; j++) { // Start from 1 to skip headers
      const name2 = data2[j][5]; // Get the name from Sheet2

      if (name1 === name2) { // Check if names match
        sheet2.getRange(j + 1, 10).setValue(opportunityId); // Update Opportunity ID in Sheet2
        break; // Exit the inner loop once a match is found
      }
    }
  }
}
