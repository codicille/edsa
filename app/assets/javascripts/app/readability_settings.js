var ReadabilitySettings,
    __bind = function(fn, me) { return function() { return fn.apply(me, arguments) }};

ReadabilitySettings = (function() {
  function ReadabilitySettings() {
    // Scope callback functions to instance
    var _this = this;
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
      veil: $('.veil'),
      fontSizeButtons: $('.font-size a'),
      lineHeightButtons: $('.line-height a'),
      alignmentButtons: $('.alignment a'),
      fontFamilyPrev: $('.js-prev-font'),
      fontFamilyNext: $('.js-next-font'),
      fontFamilyExample: $('.js-font-example'),
      fontFamilyName: $('.js-font-name'),
      fontFamilyChoices: $('.js-font-choices')
    }

    var mainComputedStyle = window.getComputedStyle(this.elements.main[0]);

    this.initialStyles = {
      fontSize: parseInt(mainComputedStyle.getPropertyValue('font-size')),
      lineHeight: parseInt(mainComputedStyle.getPropertyValue('line-height')),
      alignment: mainComputedStyle.getPropertyValue('text-align'),
      theme: this.elements.body[0].className.match(/theme-([a-zA-Z0-9]+)/)[1],
      fontFamily: this.elements.main[0].className.match(/font-([a-zA-Z0-9]+)/)[1]
    }

    // Initialization
    $.each(this.initialStyles, function(property, value) {
      _this.setInitialOption(property, value)
    })

    this.applySavedSettings();

    this.initAlignmentButtonsGroup();
    this.initThemeSlider();

    if (UA.IS_TOUCH_DEVICE) {
      this.elements.veil.onTap(this.closeSubmenu);
    } else {
      this.elements.veil.on('click', this.closeSubmenu);
    }
  }

  ReadabilitySettings.prototype.applySavedSettings = function() {
    var savedSettings = JSON.parse(localStorage.getItem("readabilitySettings"));

    if(!savedSettings) return;

    this.setFontSize(savedSettings.fontSize);
    this.setLineHeight(savedSettings.lineHeight);
    this.setAlignment(savedSettings.alignment);
    this.setFontFamily(savedSettings.fontFamily);
    this.setTheme(savedSettings.theme);
  }

  ReadabilitySettings.prototype.get = function(option) {
    return this.options[option];
  }

  ReadabilitySettings.prototype.setInitialOption = function(option, value) {
    if(!value) return;
    if(option == 'lineHeight') value = this.getRoundedLineHeight(value);

    this.options[option].default = value;
    this.options[option].current = value;
  }

  // Submenu Management
  ReadabilitySettings.prototype.toggleSubmenu = function() {
    this.options.submenuOpened ? this.closeSubmenu() : this.openSubmenu();
  }

  ReadabilitySettings.prototype.openSubmenu = function() {
    if (this.options.submenuOpened) { return }
    this.options.submenuOpened = true;

    this.elements.body.addClass('show-readability-settings submenu-opened');
  }

  ReadabilitySettings.prototype.closeSubmenu = function() {
    if (!this.options.submenuOpened) { return }
    this.options.submenuOpened = false;

    this.elements.body.removeClass('show-readability-settings submenu-opened');
  }

  // Font-size Management
  ReadabilitySettings.prototype.largerFontSize  = function() { this.changeFontSize(1) }
  ReadabilitySettings.prototype.smallerFontSize = function() { this.changeFontSize(-1) }
  ReadabilitySettings.prototype.normalFontSize  = function() { this.setFontSize(this.options.fontSize.default) }

  ReadabilitySettings.prototype.changeFontSize = function(increment) {
    var newFontSize = this.options.fontSize.current + increment;
    this.setFontSize(newFontSize);
  }

  ReadabilitySettings.prototype.setFontSize = function(fontSize) {
    if (!fontSize) return;
    this.elements.fontSizeButtons.removeClass('active');
    this.elements.fontSizeButtons.filter('.font-size-' + fontSize).addClass('active');

    if (this.options.fontSize.current == fontSize) return;
    this.options.fontSize.current = fontSize;
    this.updateLocalStorage('fontSize', fontSize);

    this.elements.main.css('font-size', fontSize + 'px');
  }

  // Line-height Management
  ReadabilitySettings.prototype.largerLineHeight  = function() { this.changeLineHeight(1) }
  ReadabilitySettings.prototype.smallerLineHeight = function() { this.changeLineHeight(-1) }
  ReadabilitySettings.prototype.normalLineHeight  = function() { this.setLineHeight(this.options.lineHeight.default) }

  ReadabilitySettings.prototype.getRoundedLineHeight = function(lineHeight) {
    var roundedLineHeight;

    lineHeight = lineHeight / this.options.fontSize.default;
    roundedLineHeight = Math.round(lineHeight * 10) / 10;

    return roundedLineHeight;
  }

  ReadabilitySettings.prototype.changeLineHeight = function(increment) {
    var newLineHeight = (this.options.lineHeight.current * 10 + increment) / 10;
    this.setLineHeight(newLineHeight);
  }

  ReadabilitySettings.prototype.setLineHeight = function(lineHeight) {
    if (!lineHeight) return;
    this.elements.lineHeightButtons.removeClass('active');
    this.elements.lineHeightButtons.filter('.line-height-' + lineHeight * 10).addClass('active');

    if (this.options.lineHeight.current == lineHeight) { return }
    this.options.lineHeight.current = lineHeight;
    this.updateLocalStorage('lineHeight', lineHeight);


    this.elements.main.css('line-height', lineHeight);
  }

  // Alignment Management
  ReadabilitySettings.prototype.leftAlignment    = function() { this.setAlignment('left') }
  ReadabilitySettings.prototype.justifyAlignment = function() { this.setAlignment('justify') }

  ReadabilitySettings.prototype.initAlignmentButtonsGroup = function() {
    var buttonsGroup, $buttonsGroup, defaultButton;

    $buttonsGroup = $('.alignments');
    defaultButton = $buttonsGroup.find('.alignment-' + this.options.alignment.current);

    buttonsGroup = new ButtonsGroup($buttonsGroup, defaultButton);
  }

  ReadabilitySettings.prototype.setAlignment = function(alignment) {
    if (!alignment) return;
    this.elements.alignmentButtons.removeClass('active');
    this.elements.alignmentButtons.filter('.alignment-' + alignment).addClass('active');

    if(this.options.alignment.current == alignment) return;
    var previousAlignment = this.options.alignment.current;
    this.options.alignment.current = alignment;
    this.updateLocalStorage('alignment', alignment);

    this.elements.main.removeClass('align-' + previousAlignment);
    this.elements.main.addClass('align-' + alignment);
  }

  ReadabilitySettings.prototype.updateLocalStorage = function(property, value) {
    var settings = JSON.parse(localStorage.getItem('readabilitySettings')) || {};

    settings[property] = value;
    localStorage.setItem('readabilitySettings', JSON.stringify(settings));
  }

  ReadabilitySettings.prototype.initThemeSlider = function() {
    var callback = this.setTheme;

    $(".slider-container .slider").slider({
      value: this.options.theme.current,
      min: 1,
      max: 5,
      step: 1,
      slide: function(e, ui) { callback(ui.value) }
    });
  }

  ReadabilitySettings.prototype.setTheme = function(theme) {
    if (!theme || this.options.theme.current == theme) { return }

    var previousTheme = this.options.theme.current;
    this.options.theme.current = theme;
    this.updateLocalStorage('theme', theme);

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
    defaultButton = $buttonsGroup.find('.font-' + this.options.fontFamily.current);

    $buttonsGroup.on('selectChange', function(e, fontFamily) {
      _this.fontFamily(fontFamily);
    });

    buttonsGroup = new ButtonsGroup($buttonsGroup, defaultButton);
  }

  ReadabilitySettings.prototype.setFontFamily = function(fontFamily) {
    if (!fontFamily) return;
    var previousFontFamily = this.options.fontFamily.current;
    this.options.fontFamily.current = fontFamily;
    this.updateFontFamilyPreviewer(previousFontFamily, fontFamily);

    if (previousFontFamily == fontFamily) return;
    this.updateLocalStorage('fontFamily', fontFamily);
    this.elements.main.removeClass('font-' + previousFontFamily);
    this.elements.main.addClass('font-' + fontFamily);
  }

  ReadabilitySettings.prototype.cycleFont = function(increment){
    // data should not be stored in dom
    // @todo improve it to not rely on DOM node for font family data
    this.retrieveFontFamilyNode(this.options.fontFamily.current);

    var currentIndex = this.retrieveFontFamilyNode(this.options.fontFamily.current).index(),
        $familyChoicesOptions = this.elements.fontFamilyChoices.find('option'),
        desiredTargetIndex = currentIndex + increment
        targetIndex = (desiredTargetIndex > $familyChoicesOptions.length - 1) ? 0 : desiredTargetIndex,
        targetOption = $familyChoicesOptions.eq(targetIndex);

    this.setFontFamily(targetOption.attr('value'));
  }

  ReadabilitySettings.prototype.nextFont = function(){ this.cycleFont(1); }
  ReadabilitySettings.prototype.prevFont = function(){ this.cycleFont(-1); }

  ReadabilitySettings.prototype.retrieveFontFamilyNode = function(value){
    var currentOption = 'option[value="' + value + '"]';
    return this.elements.fontFamilyChoices.find(currentOption);
  }

  ReadabilitySettings.prototype.retrieveFontFamilyDisplayName = function(fontName){
    return this.retrieveFontFamilyNode(fontName).text();
  }

  ReadabilitySettings.prototype.updateFontFamilyPreviewer = function(previousFont, newFont){
    this.elements.fontFamilyExample.removeClass('font-' + previousFont);
    this.elements.fontFamilyExample.addClass('font-' + newFont);
    this.elements.fontFamilyName.text(this.retrieveFontFamilyDisplayName(newFont));
  }

  return ReadabilitySettings;

})();

// Singleton
window.ReadabilitySettings = new ReadabilitySettings();
