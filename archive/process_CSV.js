/* jshint esversion: 8 */

//var localFilePath = 'files/Oros_Eng_Dictionary.csv';
//"https://raw.githubusercontent.com/brushscape/Orostara-Dictionary/main/files/Oros_Eng_Dictionary.csv"
var filePath =
  "https://raw.githubusercontent.com/brushscape/Orostara-Dictionary/main/files/Oros_Eng_Dictionary.csv";
var langBreakdown = [];
var numWords = 0;
var properNouns = [];
var orosDict = [];

var basicOnly = []; // for the flashcards
//predicted 2070 data
var idealBreakdownNum = {
  "Mandarin Chinese": 110,
  Spanish: 72,
  English: 36,
  Hindi: 36,
  Bangla: 21,
  Portuguese: 34,
  Russian: 9,
  Japanese: 7,
  Cantonese: 10,
  Vietnamese: 17,
  Marathi: 8,
  Telugu: 9,
  Turkish: 12,
  "Wu Chinese": 10,
  Korean: 11,
  French: 6,
  Tamil: 11,
  German: 7,
  Arabic: 20,
  Urdu: 8,
  Javanese: 6,
  Punjabi: 8,
  Italian: 6,
  Gujarati: 7,
  Farsi: 12,
};

//2023 data
// var idealBreakdownNum = {
//   "Mandarin Chinese": 111,
//   Spanish: 57,
//   English: 45,
//   Hindi: 42,
//   Bangla: 28,
//   Portuguese: 28,
//   Russian: 17,
//   Japanese: 15,
//   Cantonese: 10,
//   Vietnamese: 10,
//   Marathi: 10,
//   Telugu: 10,
//   Turkish: 10,
//   "Wu Chinese": 10,
//   Korean: 10,
//   French: 10,
//   Tamil: 9,
//   German: 8,
//   Arabic: 9,
//   Urdu: 8,
//   Javanese: 8,
//   Punjabi: 8,
//   Italian: 8,
//   Gujarati: 7,
//   Farsi: 7,
// };

var alph = [
  "i",
  "e",
  "a",
  "o",
  "u",
  "m",
  "n",
  "p",
  "t",
  "k",
  "s",
  "x",
  "h",
  "r",
  "y",
];

function readCSVFile() {
  $.get(filePath, function (csvdata) {
    var rowData = csvdata.split("\n");
    var colHeaders = rowData[0].split(",");

    for (var row = 1; row < rowData.length; row++) {
      var rowColData = rowData[row].split(",");
      var rowObj = {};
      for (var col = 0; col < rowColData.length - 1; col++) {
        if (rowColData[col].search("/") != -1) {
          rowObj[colHeaders[col].replace(/\s/g, "")] =
            rowColData[col].split("/");
        } else {
          rowObj[colHeaders[col].replace(/\s/g, "")] = rowColData[col];
        }
      }
      if (Object.keys(rowObj).length == 0) {
        continue;
      }
      //alphabetize as we go
      var placed = false;
      for (var i = 0; i < orosDict.length; i++) {
        if (
          isAlphOrdered(
            rowObj.Orostara.toLowerCase(),
            orosDict[i].Orostara.toLowerCase(),
          )
        ) {
          orosDict.splice(i, 0, rowObj);
          placed = true;
          break;
        }
      }
      if (!placed) {
        orosDict.push(rowObj);
      }

      if (rowObj.Type == "proper") {
        properNouns.push(rowObj.Orostara);
      }

      //just to show the language breakdown in the console
      if (
        rowObj.Type == "basic" ||
        rowObj.Type == "basic/slang" ||
        rowObj.Type == "basic/swear"
      ) {
        numWords++;
        basicOnly.push(rowObj.Orostara);
        var el = getCorrectLang(rowObj.RootLanguage);
        if (el != -1) {
          var count = langBreakdown[el].Count;
          count++;
          langBreakdown[el].Count = count;
        } else {
          var newEl = {
            Lang: rowObj.RootLanguage,
            Count: 1,
          };
          langBreakdown.push(newEl);
        }
      }
    }
    fillTable(); //in full_dict_func.js
    cfillTable(); //in categories_func.js
    //langAnalysis();
  });
}

function langAnalysis() {
  for (var i = 0; i < langBreakdown.length; i++) {
    var el = langBreakdown[i];
    if (idealBreakdownNum.hasOwnProperty(el.Lang)) {
      el.Diff = idealBreakdownNum[el.Lang] - el.Count;
    }
    if (el.Diff > 1) {
      console.log(
        el.Count +
          "/" +
          idealBreakdownNum[el.Lang] +
          " " +
          el.Lang +
          " ( ADD " +
          el.Diff +
          " )",
      );
    } else if (el.Diff < -1) {
      console.log(
        el.Count +
          "/" +
          idealBreakdownNum[el.Lang] +
          " " +
          el.Lang +
          " ( SUB " +
          el.Diff * -1 +
          " )",
      );
      // } else {
      //   console.log(
      //     el.Count +
      //       "/" +
      //       idealBreakdownNum[el.Lang] +
      //       " " +
      //       el.Lang +
      //       " ( Nice B) )",
      //   );
    }
  }
}

function getCorrectLang(lang) {
  for (var i = 0; i < langBreakdown.length; i++) {
    if (langBreakdown[i].Lang == lang) {
      return i;
    }
  }
  return -1;
}

//Unused. Just here if I need it
function alphabetizeArr(arr) {
  if (arr.length < 2) {
    return arr;
  } else if (arr.length == 2) {
    if (isAlphOrdered(arr[0].toLowerCase(), arr[1].toLowerCase())) {
      return arr;
    } else {
      return [arr[1], arr[0]];
    }
  } else {
    //length is greater than 2
    var first = arr.shift();
    var sorted = alphabetizeArr(arr);
    for (var i = 0; i < sorted.length; i++) {
      if (isAlphOrdered(first.toLowerCase(), sorted[i].toLowerCase())) {
        sorted.splice(i, 0, first);
        return sorted;
      }
    }
    //never placed
    sorted.push(first);
    return sorted;
  }
}

//alphabetically
function isAlphOrdered(el1, el2) {
  var maxLength = el1.length > el2.length ? el2.length : el1.length;
  for (var i = 0; i < maxLength; i++) {
    var el1Let = el1.charAt(i);
    var el2Let = el2.charAt(i);
    if (alph.indexOf(el1Let) != alph.indexOf(el2Let)) {
      return alph.indexOf(el1Let) < alph.indexOf(el2Let);
    } //else keep checking
  }

  //definitely identical to a point, but one may be longer than the other
  return el1.length <= el2.length; // put the longer one after
}
