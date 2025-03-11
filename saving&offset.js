/**
 * savingsOffset.gs
 */

/**
 * offsetSolarBackwards:
 * Offsets monthlySolar from Tier 5 (highest rate) down to Tier 1 (lowest rate).
 * Input usage array is in ascending order:
 *   usage[0] => Tier 1 (0-200 kWh)    => rate=0.218
 *   usage[1] => Tier 2 (201-300 kWh)  => rate=0.334
 *   usage[2] => Tier 3 (301-600 kWh)  => rate=0.516
 *   usage[3] => Tier 4 (601-900 kWh)  => rate=0.546
 *   usage[4] => Tier 5 (901+ kWh)     => rate=0.571
 * Returns offsets and savings in the same order:
 *   offset[0] => Tier 1
 *   offset[1] => Tier 2
 *   offset[2] => Tier 3
 *   offset[3] => Tier 4
 *   offset[4] => Tier 5
 */
function offsetSolarBackwards(usage, monthlySolar) {
    // TNB rates in ascending order for Tier 1 to Tier 5
    const rates = [0.218, 0.334, 0.516, 0.546, 0.571];
    
    // Maximum kWh per tier
    const tierCaps = [200, 100, 300, 300, Infinity]; // Tier 5 has no upper limit
  
    let offset = [0, 0, 0, 0, 0];
    let saves = [0, 0, 0, 0, 0];
    let leftoverSolar = monthlySolar;
  
    // Offset from highest tier (Tier 5) to lowest (Tier 1)
    for (let i = 4; i >= 0; i--) {
      if (leftoverSolar <= 0) break;
      let use = Math.min(usage[i], tierCaps[i]); // Cap usage at tier limit
      let rate = rates[i];
      let thisOffset = Math.min(use, leftoverSolar);
      leftoverSolar -= thisOffset;
      offset[i] = thisOffset;
      saves[i] = thisOffset * rate;
    }
  
    // Calculate totals
    let TSolarkWh = offset.reduce((a, b) => a + b, 0);
    let T_Save = saves.reduce((a, b) => a + b, 0);
  
    // Original consumption charge before solar offset
    let monthlyBillBeforeSolar = 0;
    for (let i = 0; i < 5; i++) {
      monthlyBillBeforeSolar += usage[i] * rates[i];
    }
  
    let Tnb_aft = monthlyBillBeforeSolar - T_Save;
    if (Tnb_aft < 0) {
      Tnb_aft = 0; // Clamp to zero; adjust if a minimum charge applies
    }
  
    return {
      offset,  // [Tier 1, Tier 2, Tier 3, Tier 4, Tier 5]
      saves,   // [Tier 1, Tier 2, Tier 3, Tier 4, Tier 5]
      TSolarkWh,
      T_Save,
      Tnb_aft
    };
  }
  
  /**
   * updateSavingsOffset:
   * Reads usage per tier from "Tariff Bill Calc" columns C to G (Tier 1 to Tier 5).
   * Reads monthly solar from "Quote(Master)" column O.
   * Applies solar offsets from Tier 5 to Tier 1 and writes to "Savings & Offset":
   *   A => Tot_kWh (Total solar kWh)
   *   B => solarkWh1 (Tier 5, 901+ kWh)
   *   C => solarkWh2 (Tier 4, 601-900 kWh, capped at 300)
   *   D => solarkWh3 (Tier 3, 301-600 kWh, capped at 300)
   *   E => solarkWh4 (Tier 2, 201-300 kWh, capped at 100)
   *   F => solarkWh5 (Tier 1, 0-200 kWh, capped at 200)
   *   G => Save1 (Tier 5 savings)
   *   H => Save2 (Tier 4 savings)
   *   I => Save3 (Tier 3 savings)
   *   J => Save4 (Tier 2 savings)
   *   K => Save5 (Tier 1 savings)
   *   L => T_Save (Total savings)
   *   M => Tnb_aft (Bill after offset)
   */
  function updateSavingsOffset() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    var usageSheet = ss.getSheetByName("Tariff Bill Calc");
    var quoteSheet = ss.getSheetByName("Quote(Master)");
    var savingsSheet = ss.getSheetByName("Savings & Offset");
    
    if (!usageSheet || !quoteSheet || !savingsSheet) {
      throw new Error("One of the sheets (Tariff Bill Calc, Quote(Master), Savings & Offset) is missing!");
    }
  
    var usageData = usageSheet.getDataRange().getValues();
    var quoteData = quoteSheet.getDataRange().getValues();
  
    var usageLastRow = usageSheet.getLastRow();
    var quoteLastRow = quoteSheet.getLastRow();
    var maxRows = Math.min(usageLastRow, quoteLastRow);
  
    var fullOutputData = [];
  
    // Skip header row (i=0)
    for (var i = 1; i < maxRows; i++) {
      var usageRow = usageData[i];
      var quoteRow = quoteData[i];
      
      // Usage in ascending order: [Tier 1, Tier 2, Tier 3, Tier 4, Tier 5]
      // Assuming "Tariff Bill Calc" columns C to G (indices 2 to 6)
      let usageAsc = [
        usageRow[2] || 0, // Tier 1 (C)
        usageRow[3] || 0, // Tier 2 (D)
        usageRow[4] || 0, // Tier 3 (E)
        usageRow[5] || 0, // Tier 4 (F)
        usageRow[6] || 0  // Tier 5 (G)
      ];
  
      // Monthly solar from "Quote(Master)" column O (index 14)
      let monthlySolar = Number(quoteRow[14]) || 0;
      if (monthlySolar <= 0) {
        continue; // Skip rows with no valid solar generation
      }
  
      // Calculate offsets and savings
      let result = offsetSolarBackwards(usageAsc, monthlySolar);
  
      let rowOut = [];
      // A => Tot_kWh (Total solar kWh)
      rowOut.push(monthlySolar);
      // B => solarkWh1 (Tier 5)
      rowOut.push(result.offset[4]);
      // C => solarkWh2 (Tier 4)
      rowOut.push(result.offset[3]);
      // D => solarkWh3 (Tier 3)
      rowOut.push(result.offset[2]);
      // E => solarkWh4 (Tier 2)
      rowOut.push(result.offset[1]);
      // F => solarkWh5 (Tier 1)
      rowOut.push(result.offset[0]);
      // G => Save1 (Tier 5)
      rowOut.push(result.saves[4]);
      // H => Save2 (Tier 4)
      rowOut.push(result.saves[3]);
      // I => Save3 (Tier 3)
      rowOut.push(result.saves[2]);
      // J => Save4 (Tier 2)
      rowOut.push(result.saves[1]);
      // K => Save5 (Tier 1)
      rowOut.push(result.saves[0]);
      // L => T_Save
      rowOut.push(result.T_Save);
      // M => Tnb_aft
      rowOut.push(result.Tnb_aft);
  
      fullOutputData.push(rowOut);
    }
  
    // Clear existing data from row 2 onward, columns A to M (13 columns)
    var lastRow = savingsSheet.getLastRow();
    if (lastRow > 1) {
      savingsSheet.getRange(2, 1, lastRow - 1, 13).clearContent();
    }
  
    if (fullOutputData.length > 0) {
      savingsSheet.getRange(2, 1, fullOutputData.length, 13).setValues(fullOutputData);
    }
  
    // Format numeric cells
    var outRange = savingsSheet.getRange(2, 1, fullOutputData.length, 13);
    var outVals = outRange.getValues();
    for (var r = 0; r < outVals.length; r++) {
      for (var c = 0; c < outVals[r].length; c++) {
        var cell = outRange.getCell(r + 1, c + 1);
        var value = outVals[r][c];
        if (typeof value === "number" && !isNaN(value)) {
          cell.setNumberFormat(value % 1 === 0 ? "0" : "0.00");
        }
      }
    }
  }
  
  function onEdit(e) {
    var sheet = e.source.getActiveSheet();
    if (sheet.getName() === "Tariff Bill Calc" || sheet.getName() === "Quote(Master)") {
      updateSavingsOffset(); // Your function to update "Savings & Offset"
    }
  }
  