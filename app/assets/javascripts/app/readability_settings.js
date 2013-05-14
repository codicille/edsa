var ReadabilitySettings = function() { this.initialize.apply(this, arguments) };
ReadabilitySettings.prototype = (function() { var pro = {};

  // Global variables
  var options = {
    submenuOpened: false,
    fontSize: {
      default: 0,
      current: 0
    }
  }

  // jQuery cached elements
  var elements = {
    container: $('.readability-settings-container'),
    main: $('[role="main"]')
  }

  // Public scope --------------------------------------------------------------
  pro.initialize = function(args) {
    var mainComputedStyle = window.getComputedStyle(elements.main[0]);

    setFontSizeOptions(mainComputedStyle);
    initContrastSlider();
  }

  pro.toggleSubmenu = function() {
    options.submenuOpened ? closeSubmenu() : openSubmenu();
  }

  pro.largerFontSize  = function() { changeFontSize(1) }
  pro.smallerFontSize = function() { changeFontSize(-1) }
  pro.normalFontSize  = function() { setFontSize(options.fontSize.default) }

  // Private scope -------------------------------------------------------------
  var openSubmenu = function() {
    if (options.submenuOpened) { return }
    options.submenuOpened = true;

    elements.container.addClass('show-submenu');
  }

  var closeSubmenu = function() {
    if (!options.submenuOpened) { return }
    options.submenuOpened = false;

    elements.container.removeClass('show-submenu');
  }

  var initContrastSlider = function() {
    $(".slider-container .slider").slider({
      value: 1,
      min: 1,
      max: 5,
      step: 1,
      slide: function(e, ui) {
        // console.log(ui.value);
      }
    })
  }

  // Font-size Management
  var setFontSizeOptions = function(mainComputedStyle) {
    var mainFontSize = parseInt(mainComputedStyle.getPropertyValue('font-size'));

    options.fontSize.default = mainFontSize;
    options.fontSize.current = mainFontSize;
  }

  var changeFontSize = function(increment) {
    var newFontSize = options.fontSize.current + increment;
    setFontSize(newFontSize);
  }

  var setFontSize = function(fontSize) {
    if (options.fontSize.current == fontSize) { return }
    options.fontSize.current = fontSize;

    elements.main.css('font-size', fontSize + 'px');
  }

return pro })();

// Singleton
window.ReadabilitySettings = new ReadabilitySettings();
