var ButtonsGroup = function() { this.initialize.apply(this, arguments) };
ButtonsGroup.prototype = (function() { var pro = {};

  // jQuery cached elements
  var elements = {
    group: null,
    buttons: null,
    selectedButton: null
  }

  // Public scope --------------------------------------------------------------
  pro.initialize = function($elem, $defaultSelectedButton) {
    elements.group = $elem;

    elements.buttons = $elem.children('.simple-button');
    elements.buttons.on('click', onButtonClick);

    if ($defaultSelectedButton) {
      select($defaultSelectedButton[0]);
    }
  }

  // Private scope -------------------------------------------------------------
  var onButtonClick = function(e) {
    select(e.currentTarget);
  }

  var select = function(button) {
    if (elements.selectedButton == button) { return }

    unselect();

    elements.selectedButton = button;
    $(button).addClass('selected');
  }

  var unselect = function() {
    $(elements.selectedButton).removeClass('selected');
  }

return pro })();
