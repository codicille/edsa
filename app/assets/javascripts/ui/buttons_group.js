var ButtonsGroup,
    __bind = function(fn, me) { return function() { return fn.apply(me, arguments) }};

ButtonsGroup = (function() {
  function ButtonsGroup($elem, $defaultSelectedButton) {
    // Scope callback functions to instance
    this.onButtonClick = __bind(this.onButtonClick, this);

    // jQuery cached elements
    this.elements = {
      group: $elem,
      buttons: $elem.find('.simple-button'),
      select: $elem.children('select'),
      selectedButton: null
    }

    this.elements.buttons.on('click', this.onButtonClick);

    if (this.elements.select.length) { this.initSelect() }
    if ($defaultSelectedButton) { this.select($defaultSelectedButton[0]) }
  }

  ButtonsGroup.prototype.onButtonClick = function(e) {
    this.select(e.currentTarget);
  }

  ButtonsGroup.prototype.select = function(button, updateSelect) {
    if (updateSelect == null) { updateSelect = true }
    if (this.elements.selectedButton == button) { return }

    this.unselect();

    this.elements.selectedButton = button;
    $(button).addClass('selected');

    if (updateSelect && this.elements.select.length) {
      var selectedIndex = $(button).index();
      this.elements.select[0].selectedIndex = selectedIndex;
    }
  }

  ButtonsGroup.prototype.unselect = function() {
    $(this.elements.selectedButton).removeClass('selected');
  }

  ButtonsGroup.prototype.initSelect = function() {
    var _this = this;

    this.elements.select.on('change', function(e) {
      var $button = _this.elements.buttons.eq(this.selectedIndex);
      _this.select($button[0], false);
      _this.elements.group.trigger('selectChange', this.value);
    });
  }

  return ButtonsGroup;

})();
