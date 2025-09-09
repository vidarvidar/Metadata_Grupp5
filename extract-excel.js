import xlsx from 'xlsx';

const workbook = xlsx.readFile("client/Data/MOCK_DATA.xlsx");

    console.log(workbook.Props);

    if (workbook.Props) {
        console.log("Title: " + workbook.Props.Title);
        console.log("Author: " + workbook.Props.Author);
        console.log("CreatedDate: " + workbook.Props.CreatedDate);
    }


console.log("ark i filen:", workbook.SheetNames);

const firstSheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[firstSheetName];


const jsondata = xlsx.utils.sheet_to_json(sheet);
console.log(jsondata);