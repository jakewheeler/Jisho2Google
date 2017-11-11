function getJishoObject(word)
{
  var fData = [];
  $.ajax({
    url: 'http://jisho.org/api/v1/search/words?keyword=' + word,
    async: false,
    dataType: 'json',
    success: function(data){
      fData = data;
    }
  });

  return fData;
}

function parseJishoObject(jishoObj)
{
  try
  {
    var word = jishoObj.data[0].japanese[0].word; // word
    var reading = jishoObj.data[0].japanese[0].reading; // reading
    var definitionArray = ""; // all definitions with part of speech

    for (var i = 0; i < jishoObj.data[0].senses.length; i++) {
      var partOfSpeech = jishoObj.data[0].senses[i].parts_of_speech[0];

      if (typeof partOfSpeech !== "undefined") {
            definitionArray += "(" + partOfSpeech + ")" + " ";
      }

      definitionArray += (i + 1) + ". ";
      for (var j = 0; j < jishoObj.data[0].senses[i].english_definitions.length; j++) {

            definitionArray += jishoObj.data[0].senses[i].english_definitions[j] + "; ";
      }
    }
    
    var customObject = {word: word, reading: reading, definitions: definitionArray};
    console.log(customObject);

    return customObject;
  }catch(err){

    setToError();
    return null;
  }

  
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
    setToError();
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
  var subButton = document.getElementById('submitButton');
  subButton.addEventListener('click', function()
  {
     // get word from box
    var wordEntered = $('#word').val();

    if (wordEntered)
    {
      // get all data from API
      var allData = getJishoObject(wordEntered);
      
      var parsedObject = parseJishoObject(allData);
      
      fillInElementsWithData(parsedObject);

      var data = getFormData();

      if (data !== null && data.word && data.reading && data.definitions) {
        var url = "https://script.google.com/macros/s/AKfycbw_X_Im0yb3UpOqutJ8XXwldjZjSm2GuNjuJMa7_zBnYCle5r6H/exec";
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        // xhr.withCredentials = true;
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        // url encode form data for sending as post data
        var encoded = Object.keys(data).map(function(k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
        }).join('&')
        xhr.send(encoded);

        setToSuccess();
      }
      else {
        setToError();
      }
    }
    else {
      setToError();
    }
})
});
