var ButtonsGroup = function() { this.initialize.apply(this, arguments) };
ButtonsGroup.prototype = (function() { var pro = {};

  // jQuery cached elements
  var elements = {
    group: null,
    buttons: null,
    select: null,
    selectedButton: null
  }

  // Public scope --------------------------------------------------------------
  pro.initialize = function($elem, $defaultSelectedButton) {
    elements.group = $elem;

    elements.select = $elem.children('select');

    elements.buttons = $elem.find('.simple-button');
    elements.buttons.on('click', onButtonClick);

    if ($defaultSelectedButton) {
      select($defaultSelectedButton[0]);
    }

    if (elements.select.length) { initSelect(); }
  }

  // Private scope -------------------------------------------------------------
  var onButtonClick = function(e) {
    select(e.currentTarget);
  }

  var select = function(button, updateSelect) {
    if (updateSelect == null) { updateSelect = true }
    if (elements.selectedButton == button) { return }

    unselect();

    elements.selectedButton = button;
    $(button).addClass('selected');

    if (updateSelect && elements.select.length) {
      var selectedIndex = $(button).index();
      elements.select[0].selectedIndex = selectedIndex;
    }
  }

  var unselect = function() {
    $(elements.selectedButton).removeClass('selected');
  }

  var initSelect = function() {
    elements.select.on('change', function(e){
      var $button = elements.buttons.eq(this.selectedIndex);
      select($button[0], false);

      if (ReadabilitySettings) { ReadabilitySettings.fontFamily(this.value) }
    });
  }

return pro })();
