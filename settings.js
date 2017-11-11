var settingsSubmitButton = document.getElementById('settingsSubmitButton');
settingsSubmitButton.addEventListener('click', function()
{
  var success = false;
  $enteredURL = $('#scriptUrlBox').val();
  if ($enteredURL) {
      localStorage.setItem('sheetScriptUrl', $enteredURL);
  }
});