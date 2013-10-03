var ButtonsGroup,
    __bind = function(fn, me) { return function() { return fn.apply(me, arguments) }};

ButtonsGroup = (function() {
  function ButtonsGroup($elem, $defaultSelectedButton) {
    // Scope callback functions to instance
    this.onButtonClick = __bind(this.onButtonClick, this);

    // jQuery cached elements
    this.$els = {
      group: $elem,
      buttons: $elem.find('.simple-button'),
      select: $elem.children('select'),
      selectedButton: null
    }

    this.$els.buttons.on('click', this.onButtonClick);

    if (this.$els.select.length) { this.initSelect() }
    if ($defaultSelectedButton) { this.select($defaultSelectedButton[0]) }
  }

  ButtonsGroup.prototype = {
    onButtonClick: function(e) {
      this.select(e.currentTarget);
    },

    select: function(button, updateSelect) {
      if (updateSelect == null) { updateSelect = true }
      if (this.$els.selectedButton == button) { return }

      this.unselect();

      this.$els.selectedButton = button;
      $(button).addClass('selected');

      if (updateSelect && this.$els.select.length) {
        var selectedIndex = $(button).index();
        this.$els.select[0].selectedIndex = selectedIndex;
      }
    },

    unselect: function() {
      $(this.$els.selectedButton).removeClass('selected');
    },

    initSelect: function() {
      var _this = this;

      this.$els.select.on('change', function(e) {
        var $button = _this.$els.buttons.eq(this.selectedIndex);
        _this.select($button[0], false);
        _this.$els.group.trigger('selectChange', this.value);
      });
    }
  }

  return ButtonsGroup;

})();
