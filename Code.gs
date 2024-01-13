function bootstrap() {
  let spreadsheet = SpreadsheetApp.getActive();
  let ss = new SS(spreadsheet);
  let stats = new Stats(ss);

  stats.postToSheet('garage');
  stats.postToSheet('email');
  stats.postToSheet('reason');
}


class SS {
  constructor(ss) {
    this.ss = ss;
    this.sheets = [];
    this.setSheets(ss);
  }

  setSheets(ss) {
    for (let sheet of ss.getSheets()) {
      if (sheet.getName().includes('Metrics')) {
        continue;
      }
      this.sheets.push(new Sheet(sheet));
    }
  }

  getSheets() {
    return this.sheets;
  }

  getData(type) {
    let arr = [];
    for (let sheet of this.sheets) {
      for (let record of sheet.data) {
        arr.push(record[type])
      }
    }
    return arr;
  }

}

class Sheet {
  constructor(sheet) {
    this.sheet = sheet;
    this.name = sheet.getName();
    this.data = [];
    this.setRecords();
  }

  setRecords() {
    let sheetData = this.sheet.getDataRange().getDisplayValues();
    for (let i = 0; i < sheetData.length; i++) {
      //ensure its an actual record, for now just no blanks
      let [date, email, garage, device, reason, ...rest] = sheetData[i];
      if (date && email && garage && device && reason) {
        let record = new DRecord(date, email, garage, device, reason);
        this.data.push(record);
      }
    }
  }

  getRecords() {
    return this.data;
  }
}


class DRecord {
  constructor(date, email, garage, device, reason) {
    this.date = date,
      this.email = email,
      this.garage = garage,
      this.device = device,
      this.reason = reason
  }
}

class Stats {
  constructor(ss) {
    this.lastCol = 1;
    this.ss = ss;
  }

  userCount(records) {
    let dataObj = {};
    for (let record of records) {
     // if (!email.includes('@')) {
     //   continue;
     // }
      dataObj[record] ? dataObj[record]++ : dataObj[record] = 1;
    }
    return dataObj;
  }

  objectTo2DArray(data) {
    let arr = [];
    for (const [key, value] of Object.entries(data)) {
      arr.push([key, value])
    }
    return arr;

  }
  setLastCol(count) {
    this.lastCol += count;
    this.lastCol++;
  }

  postToSheet(data) {
    let sheet = SpreadsheetApp.getActive().getSheetByName('Metrics');

    let obj = this.userCount(this.ss.getData(data));
    let arr = this.objectTo2DArray(obj);

    sheet.getRange(2, this.lastCol, arr.length, arr[0].length).setValues(arr);
    this.setLastCol(arr[0].length);
  }
}