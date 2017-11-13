document.addEventListener("DOMContentLoaded", function()
{

  initializeOptions();

  var showReadingWordSame = document.getElementById('show-reading-if-word-same');
  showReadingWordSame.addEventListener('click', function()
  {
    if (showReadingWordSame.checked) {

      localStorage.setItem('optionShowReadingIfWordSame', true);
    }
    else {
      localStorage.setItem('optionShowReadingIfWordSame', false);
    }
  });
});

var settingsSubmitButton = document.getElementById('settingsSubmitButton');
settingsSubmitButton.addEventListener('click', function()
{
  var success = false;
  $enteredURL = $('#scriptUrlBox').val();
  if ($enteredURL) {
      localStorage.setItem('sheetScriptUrl', $enteredURL);
  }
});

function initializeOptions()
{

  var optionVal = localStorage.getItem('optionShowReadingIfWordSame');

  if (optionVal == null) {
    $('#show-reading-if-word-same').prop('checked', true).change();
    localStorage.setItem('optionShowReadingIfWordSame', true);
  }
  else if (optionVal == 'true') {
    $('#show-reading-if-word-same').prop('checked', true).change();
  }
  else {
    $('#show-reading-if-word-same').prop('checked', false).change();
  }

}