var ReadabilitySettings = function() { this.initialize.apply(this, arguments) };
ReadabilitySettings.prototype = (function() { var pro = {};

  // Global variables
  var options = {
    submenuOpened: false,
    fontSize: {
      default: 0,
      current: 0
    },
    lineHeight: {
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
    setLineHeightOptions(mainComputedStyle);

    initContrastSlider();
  }

  pro.toggleSubmenu = function() {
    options.submenuOpened ? closeSubmenu() : openSubmenu();
  }

  pro.largerFontSize  = function() { changeFontSize(1) }
  pro.smallerFontSize = function() { changeFontSize(-1) }
  pro.normalFontSize  = function() { setFontSize(options.fontSize.default) }

  pro.largerLineHeight  = function() { changeLineHeight(1) }
  pro.smallerLineHeight = function() { changeLineHeight(-1) }
  pro.normalLineHeight  = function() { setLineHeight(options.lineHeight.default) }

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

  // Line-height Management
  var setLineHeightOptions = function(mainComputedStyle) {
    var mainLineHeight, lineHeight, roundedLineHeight;

    mainLineHeight = parseInt(mainComputedStyle.getPropertyValue('line-height'));
    lineHeight = mainLineHeight / options.fontSize.default;
    roundedLineHeight = Math.round(lineHeight * 10) / 10;

    options.lineHeight.default = roundedLineHeight;
    options.lineHeight.current = roundedLineHeight;
  }

  var changeLineHeight = function(increment) {
    var newLineHeight = (options.lineHeight.current * 10 + increment) / 10;
    setLineHeight(newLineHeight);
  }

  var setLineHeight = function(lineHeight) {
    if (options.lineHeight.current == lineHeight) { return }
    options.lineHeight.current = lineHeight;

    elements.main.css('line-height', lineHeight);
  }

return pro })();

// Singleton
window.ReadabilitySettings = new ReadabilitySettings();
