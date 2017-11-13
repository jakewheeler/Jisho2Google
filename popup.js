function getJishoObject(word)
{
  var newUrl = 'http://jisho.org/api/v1/search/words?keyword=' + encodeURIComponent(word);
  var fData = [];

  $.ajax({
    type: "GET",
    url: newUrl,
    async: false,
    dataType: 'json',
    contentType: "application/json; charset=UTF-8",
    success: function(data){
      fData = data;
    }
  });

  return fData;
}

function parseJishoObject(jishoObj)
{
  var word = null;
  var reading = null;
  var definitions = null;

    try {
          word = jishoObj.data[0].japanese[0].word; // word
    }catch(err) {
      console.log("could not read word.");
    }

    try {
          reading = jishoObj.data[0].japanese[0].reading; // reading
    }catch(err) {
      console.log("could not read reading");
    }

    try {

        var definitionArray = ""; // all definitions with part of speech
        for (var i = 0; i < jishoObj.data[0].senses.length; i++) {
        var partOfSpeech = jishoObj.data[0].senses[i].parts_of_speech[0];

        if (typeof partOfSpeech !== "undefined") {
          if(!partOfSpeech.includes("Wikipedia")) {
             definitionArray += "(" + partOfSpeech + ")" + " ";
          }

        }

        definitionArray += (i + 1) + ". ";
        for (var j = 0; j < jishoObj.data[0].senses[i].english_definitions.length; j++) {

              definitionArray += jishoObj.data[0].senses[i].english_definitions[j] + "; ";
        }
      }
    }catch(err) {
      console.log("could not read definitions");
    }

    
    var customObject = {word: word, reading: reading, definitions: definitionArray};
    //console.log (customObject);

    if (customObject.word === undefined) {
      customObject.word = customObject.reading // word is the reading

      var optionVal = localStorage.getItem('optionShowReadingIfWordSame');

      if (optionVal == 'false') {
          customObject.reading = " "; // no need for reading
      }

    }

    return customObject;
}

function clearAllElementsData()
{
  $('#word').val("");
  $('#reading').val("");
  $('#definitions').val("");
}

function setToSuccess()
{
  $('#successLabel').css("color", "green");
  $('#successLabel').html("Success");
  $('#successStatus').show();
  fadeSuccessStatus();
}

function setToError()
{
  $('#successLabel').css("color", "red");
  $('#successLabel').html("Error updating spreadsheet");
  $('#successStatus').show();
  fadeSuccessStatus();
}

function fadeSuccessStatus()
{
  $('#successStatus').fadeOut(3000);
}

function fillInElementsWithData(parsedObject) {
  try {
      $('#word').val(parsedObject.word);
      $('#reading').val(parsedObject.reading);
      $('#definitions').val(parsedObject.definitions);
  } catch(err) {
    
  }
}

// get all data in form and return object
function getFormData() {
  var form = document.getElementById("gform");
  var elements = form.elements; // all form elements
  var fields = Object.keys(elements).map(function(k) {
    if(elements[k].name !== undefined) {
      return elements[k].name;
    // special case for Edge's html collection
    }else if(elements[k].length > 0){
      return elements[k].item(0).name;
    }
  }).filter(function(item, pos, self) {
    return self.indexOf(item) == pos && item;
  });
  var data = {};
  fields.forEach(function(k){
    data[k] = elements[k].value;
    var str = ""; // declare empty string outside of loop to allow
                  // it to be appended to for each item in the loop
    if(elements[k].type === "checkbox"){ // special case for Edge's html collection
      str = str + elements[k].checked + ", "; // take the string and append 
                                              // the current checked value to 
                                              // the end of it, along with 
                                              // a comma and a space
      data[k] = str.slice(0, -2); // remove the last comma and space 
                                  // from the  string to make the output 
                                  // prettier in the spreadsheet
    }else if(elements[k].length){
      for(var i = 0; i < elements[k].length; i++){
        if(elements[k].item(i).checked){
          str = str + elements[k].item(i).value + ", "; // same as above
          data[k] = str.slice(0, -2);
        }
      }
    }
  });

  // add form-specific values into the data
  data.formDataNameOrder = JSON.stringify(fields);
  data.formGoogleSheetName = form.dataset.sheet || "vocabulary"; // default sheet name
  data.formGoogleSendEmail = form.dataset.email || ""; // no email by default

  //console.log(data);
  return data;
}

document.addEventListener("DOMContentLoaded", function()
{
  $('#word').focus();
  $('#word').keypress(function (e) {
    if (e.keyCode == 13 && $('#word').val())
    {
      $('#submitButton').click();
    }
  });


  var subButton = document.getElementById('submitButton');
  subButton.addEventListener('click', function()
  {

    // get each line in box
    var lines = $('#word').val().split('\n');
    for(var i = 0; i < lines.length; i++){
     
      console.log(lines[i]);
     // get word from box
      var wordEntered = lines[i];

      if (wordEntered && localStorage.getItem("sheetScriptUrl"))
      {
        // get all data from API
        var allData = getJishoObject(wordEntered);
        
        var parsedObject = parseJishoObject(allData);
        
        fillInElementsWithData(parsedObject);

        var data = getFormData();

        if (data !== null && data.word && data.reading && data.definitions && localStorage.getItem("sheetScriptUrl")) {
          var url = localStorage.getItem("sheetScriptUrl");
          var xhr = new XMLHttpRequest();
          xhr.open('POST', url, false);
          // xhr.withCredentials = true;
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

          // url encode form data for sending as post data
          var encoded = Object.keys(data).map(function(k) {
              return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
          }).join('&')
          xhr.send(encoded);
        }
      }


      clearAllElementsData();
  }
})
});
