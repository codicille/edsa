var ReadabilitySettings,
    __bind = function(fn, me) { return function() { return fn.apply(me, arguments) }};

ReadabilitySettings = (function() {
  function ReadabilitySettings() {
    // Scope callback functions to instance
    this.closeSubmenu = __bind(this.closeSubmenu, this);
    this.setTheme     = __bind(this.setTheme, this);

    // Global variables
    this.options = {
      submenuOpened: false,
      fontSize:   { default: 0,    current: 0 },
      lineHeight: { default: 0,    current: 0 },
      alignment:  { default: null, current: null },
      theme:      { default: null, current: null },
      fontFamily: { default: null, current: null }
    }

    // jQuery cached elements
    this.elements = {
      body: $('body'),
      main: $('[role="main"]'),
      paragraphCountLinks: $('.paragraph-count'),
      veil: $('.veil')
    }

    // Initialization
    var mainComputedStyle = window.getComputedStyle(this.elements.main[0]);

    this.setFontSizeOptions(mainComputedStyle);
    this.setLineHeightOptions(mainComputedStyle);
    this.setAlignmentOptions(mainComputedStyle);
    this.setThemeOptions();
    this.setFontFamilyOptions();

    this.initAlignmentButtonsGroup();
    this.initFontFamilyButtonsGroup();
    this.initThemeSlider();

    if (UA.IS_TOUCH_DEVICE) {
      this.elements.veil.onTap(this.closeSubmenu);
    } else {
      this.elements.veil.on('click', this.closeSubmenu);
    }
  }

  ReadabilitySettings.prototype.get = function(option) {
    return this.options[option];
  }

  // Submenu Management
  ReadabilitySettings.prototype.toggleSubmenu = function() {
    this.options.submenuOpened ? this.closeSubmenu() : this.openSubmenu();
  }

  ReadabilitySettings.prototype.openSubmenu = function() {
    if (this.options.submenuOpened) { return }
    this.options.submenuOpened = true;

    this.elements.body.addClass('show-readability-settings');
  }

  ReadabilitySettings.prototype.closeSubmenu = function() {
    if (!this.options.submenuOpened) { return }
    this.options.submenuOpened = false;

    this.elements.body.removeClass('show-readability-settings');
  }

  // Font-size Management
  ReadabilitySettings.prototype.largerFontSize  = function() { this.changeFontSize(1) }
  ReadabilitySettings.prototype.smallerFontSize = function() { this.changeFontSize(-1) }
  ReadabilitySettings.prototype.normalFontSize  = function() { this.setFontSize(this.options.fontSize.default) }

  ReadabilitySettings.prototype.setFontSizeOptions = function(mainComputedStyle) {
    var mainFontSize = parseInt(mainComputedStyle.getPropertyValue('font-size'));

    this.options.fontSize.default = mainFontSize;
    this.options.fontSize.current = mainFontSize;
  }

  ReadabilitySettings.prototype.changeFontSize = function(increment) {
    var newFontSize = this.options.fontSize.current + increment;
    this.setFontSize(newFontSize);
  }

  ReadabilitySettings.prototype.setFontSize = function(fontSize) {
    if (this.options.fontSize.current == fontSize) { return }
    this.options.fontSize.current = fontSize;

    this.elements.main.css('font-size', fontSize + 'px');
  }

  // Line-height Management
  ReadabilitySettings.prototype.largerLineHeight  = function() { this.changeLineHeight(1) }
  ReadabilitySettings.prototype.smallerLineHeight = function() { this.changeLineHeight(-1) }
  ReadabilitySettings.prototype.normalLineHeight  = function() { this.setLineHeight(this.options.lineHeight.default) }

  ReadabilitySettings.prototype.setLineHeightOptions = function(mainComputedStyle) {
    var mainLineHeight, lineHeight, roundedLineHeight;

    mainLineHeight = parseInt(mainComputedStyle.getPropertyValue('line-height'));
    lineHeight = mainLineHeight / this.options.fontSize.default;
    roundedLineHeight = Math.round(lineHeight * 10) / 10;

    this.options.lineHeight.default = roundedLineHeight;
    this.options.lineHeight.current = roundedLineHeight;
  }

  ReadabilitySettings.prototype.changeLineHeight = function(increment) {
    var newLineHeight = (this.options.lineHeight.current * 10 + increment) / 10;
    this.setLineHeight(newLineHeight);
  }

  ReadabilitySettings.prototype.setLineHeight = function(lineHeight) {
    if (this.options.lineHeight.current == lineHeight) { return }
    this.options.lineHeight.current = lineHeight;

    this.elements.main.css('line-height', lineHeight);
    this.elements.paragraphCountLinks.css('line-height', lineHeight * 1.5);
  }

  // Alignment Management
  ReadabilitySettings.prototype.leftAlignment    = function() { this.setAlignment('left') }
  ReadabilitySettings.prototype.justifyAlignment = function() { this.setAlignment('justify') }

  ReadabilitySettings.prototype.initAlignmentButtonsGroup = function() {
    var buttonsGroup, $buttonsGroup, defaultButton;

    $buttonsGroup = $('.alignments');
    defaultButton = $buttonsGroup.find('.alignment-' + this.options.alignment.default);

    buttonsGroup = new ButtonsGroup($buttonsGroup, defaultButton);
  }

  ReadabilitySettings.prototype.setAlignmentOptions = function(mainComputedStyle) {
    var mainAlignment = mainComputedStyle.getPropertyValue('text-align');

    this.options.alignment.default = mainAlignment;
    this.options.alignment.current = mainAlignment;
  }

  ReadabilitySettings.prototype.setAlignment = function(alignment) {
    if (this.options.alignment.current == alignment) { return }
    this.options.alignment.current = alignment;

    this.elements.main.css('text-align', alignment);
  }

  // Themes Management
  ReadabilitySettings.prototype.setThemeOptions = function() {
    var theme = this.elements.body[0].className.match(/theme-(.+)/)[1];

    this.options.theme.default = theme;
    this.options.theme.current = theme;
  }

  ReadabilitySettings.prototype.initThemeSlider = function() {
    var callback = this.setTheme;

    $(".slider-container .slider").slider({
      value: this.options.theme.default,
      min: 1,
      max: 5,
      step: 1,
      slide: function(e, ui) { callback(ui.value) }
    });
  }

  ReadabilitySettings.prototype.setTheme = function(theme) {
    if (this.options.theme.current == theme) { return }

    var previousTheme = this.options.theme.current;
    this.options.theme.current = theme;

    this.elements.body.removeClass('theme-' + previousTheme);
    this.elements.body.addClass('theme-' + theme);
  }

  // Font family Management
  ReadabilitySettings.prototype.fontFamily = function(fontFamily) {
    this.setFontFamily(fontFamily);
  }

  ReadabilitySettings.prototype.initFontFamilyButtonsGroup = function() {
    var _this, buttonsGroup, $buttonsGroup, defaultButton;

    _this = this;
    $buttonsGroup = $('.buttons-group.fonts');
    defaultButton = $buttonsGroup.find('.font-' + this.options.fontFamily.default);

    $buttonsGroup.on('selectChange', function(e, fontFamily) {
      _this.fontFamily(fontFamily);
    });

    buttonsGroup = new ButtonsGroup($buttonsGroup, defaultButton);
  }

  ReadabilitySettings.prototype.setFontFamilyOptions = function() {
    var fontName = this.elements.main[0].className.match(/font-(.+)/)[1];

    this.options.fontFamily.default = fontName;
    this.options.fontFamily.current = fontName;
  }

  ReadabilitySettings.prototype.setFontFamily = function(fontFamily) {
    if (this.options.fontFamily.current == fontFamily) { return }

    var previousFontFamily = this.options.fontFamily.current;
    this.options.fontFamily.current = fontFamily;

    this.elements.main.removeClass('font-' + previousFontFamily);
    this.elements.main.addClass('font-' + fontFamily);
  }

  return ReadabilitySettings;

})();

// Singleton
window.ReadabilitySettings = new ReadabilitySettings();
