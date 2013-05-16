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
    },
    theme: {
      default: null,
      current: null
    },
    fontFamily: {
      default: null,
      current: null
    }
  }

  // jQuery cached elements
  var elements = {
    body: $('body'),
    main: $('[role="main"]'),
    paragraphCountLinks: $('.paragraph-count')
  }

  // Public scope --------------------------------------------------------------
  pro.initialize = function(args) {
    var mainComputedStyle = window.getComputedStyle(elements.main[0]);

    setFontSizeOptions(mainComputedStyle);
    setLineHeightOptions(mainComputedStyle);
    setThemeOptions();
    setFontFamilyOptions();

    initFontFamilyButtonsGroup();
    initThemeSlider();
  }

  pro.toggleSubmenu = function() {
    options.submenuOpened ? closeSubmenu() : openSubmenu();
  }

  pro.openSubmenu = function() { openSubmenu() }
  pro.closeSubmenu = function() { closeSubmenu() }

  pro.largerFontSize  = function() { changeFontSize(1) }
  pro.smallerFontSize = function() { changeFontSize(-1) }
  pro.normalFontSize  = function() { setFontSize(options.fontSize.default) }

  pro.largerLineHeight  = function() { changeLineHeight(1) }
  pro.smallerLineHeight = function() { changeLineHeight(-1) }
  pro.normalLineHeight  = function() { setLineHeight(options.lineHeight.default) }

  pro.fontFamily = function(fontFamily) { setFontFamily(fontFamily) }

  // Private scope -------------------------------------------------------------
  var openSubmenu = function() {
    if (options.submenuOpened) { return }
    options.submenuOpened = true;

    elements.body.addClass('show-readability-settings');
  }

  var closeSubmenu = function() {
    if (!options.submenuOpened) { return }
    options.submenuOpened = false;

    elements.body.removeClass('show-readability-settings');
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
    elements.paragraphCountLinks.css('line-height', lineHeight * 1.5);
  }

  // Themes Management
  var setThemeOptions = function() {
    var theme = elements.body[0].className.match(/theme-(.+)/)[1];

    options.theme.default = theme;
    options.theme.current = theme;
  }

  var initThemeSlider = function() {
    $(".slider-container .slider").slider({
      value: options.theme.default,
      min: 1,
      max: 5,
      step: 1,
      slide: function(e, ui) { setTheme(ui.value) }
    });
  }

  var setTheme = function(theme) {
    if (options.theme.current == theme) { return }
    var previousTheme = options.theme.current;
    options.theme.current = theme;

    elements.body.removeClass('theme-' + previousTheme);
    elements.body.addClass('theme-' + theme);
  }

  // Font family Management
  var initFontFamilyButtonsGroup = function() {
    var buttonsGroup, $buttonsGroup, defaultButton;

    $buttonsGroup = $('.buttons-group.fonts');
    defaultButton = $buttonsGroup.find('.font-' + options.fontFamily.default);

    buttonsGroup = new ButtonsGroup($buttonsGroup, defaultButton);
  }

  var setFontFamilyOptions = function() {
    var fontName = elements.main[0].className.match(/font-(.+)/)[1];

    options.fontFamily.default = fontName;
    options.fontFamily.current = fontName;
  }

  var setFontFamily = function(fontFamily) {
    if (options.fontFamily.current == fontFamily) { return }
    var previousFontFamily = options.fontFamily.current;
    options.fontFamily.current = fontFamily;

    elements.main.removeClass('font-' + previousFontFamily);
    elements.main.addClass('font-' + fontFamily);
  }

return pro })();

// Singleton
window.ReadabilitySettings = new ReadabilitySettings();
