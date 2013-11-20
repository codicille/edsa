var ReadabilitySettings = (function() {
  function ReadabilitySettings() {
    var _this = this;

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
    this.$els = {
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

    var mainComputedStyle = window.getComputedStyle(this.$els.main[0]);

    this.initialStyles = {
      fontSize: parseInt(mainComputedStyle.getPropertyValue('font-size')),
      lineHeight: parseInt(mainComputedStyle.getPropertyValue('line-height')),
      alignment: mainComputedStyle.getPropertyValue('text-align'),
      theme: this.$els.body[0].className.match(/theme-([a-zA-Z0-9]+)/)[1],
      fontFamily: this.$els.main[0].className.match(/font-([a-zA-Z0-9]+)/)[1]
    }

    this.init();
  }

  ReadabilitySettings.prototype = {
    init: function(){
      // Initialization
      $.each(this.initialStyles, function(property, value) {
        this.setInitialOption(property, value)
      }.bind(this))

      this.applySavedSettings();

      this.initAlignmentButtonsGroup();
      this.initThemeSlider();
      this.initFontSizeButtons();

      if (EDSA_UA.IS_TOUCH_DEVICE) {
        this.$els.veil.onTap(this.closeSubmenu.bind(this));
      } else {
        this.$els.veil.on('click', this.closeSubmenu.bind(this));
      }
    },

    initFontSizeButtons: function(){
      $('[data-font-size]').on('click', function(e){
        e.preventDefault();
        var $this = $(e.currentTarget);
        this.setFontSize($this.data('font-size'));
      }.bind(this))
    },

    applySavedSettings: function() {
      var savedSettings = JSON.parse(localStorage.getItem("readabilitySettings"));
      if(!savedSettings) return;

      this.setFontSize(savedSettings.fontSize);
      this.setLineHeight(savedSettings.lineHeight);
      this.setAlignment(savedSettings.alignment);
      this.setFontFamily(savedSettings.fontFamily);
      this.setTheme(savedSettings.theme);
    },

    get: function(option) {
      return this.options[option];
    },

    setInitialOption: function(option, value) {
      if(!value) return;
      if(option == 'lineHeight') value = this.getRoundedLineHeight(value);

      this.options[option].default = value;
      this.options[option].current = value;
    },

    // Submenu Management
    toggleSubmenu: function() {
      this.options.submenuOpened ? this.closeSubmenu() : this.openSubmenu();
    },

    openSubmenu: function() {
      if (this.options.submenuOpened) { return }
      this.options.submenuOpened = true;

      this.$els.body.addClass('show-readability-settings submenu-opened');
    },

    closeSubmenu: function() {
      if (!this.options.submenuOpened) { return }
      this.options.submenuOpened = false;

      this.$els.body.removeClass('show-readability-settings submenu-opened');
    },

    // Font-size Management
    largerFontSize : function() { this.changeFontSize(1) },
    smallerFontSize: function() { this.changeFontSize(-1) },
    normalFontSize : function() { this.setFontSize(this.options.fontSize.default) },

    changeFontSize: function(increment) {
      var newFontSize = this.options.fontSize.current + increment;
      this.setFontSize(newFontSize);
    },

    setFontSize: function(fontSize) {
      if (!fontSize) return;
      this.$els.fontSizeButtons.removeClass('active');
      this.$els.fontSizeButtons.filter('[data-font-size="' + fontSize.toString() +'"]').addClass('active');

      // fontSize > 3 is a tmp fix for users with old settings using px instead of em
      if (this.options.fontSize.current == fontSize || fontSize > 3) return;

      this.options.fontSize.current = fontSize;
      this.updateLocalStorage('fontSize', fontSize);

      this.$els.main.css('font-size', fontSize + 'em');
    },

    // Line-height Management
    largerLineHeight : function() { this.changeLineHeight(1) },
    smallerLineHeight: function() { this.changeLineHeight(-1) },
    normalLineHeight : function() { this.setLineHeight(this.options.lineHeight.default) },

    getRoundedLineHeight: function(lineHeight) {
      var roundedLineHeight;

      lineHeight = lineHeight / this.options.fontSize.default;
      roundedLineHeight = Math.round(lineHeight * 10) / 10;

      return roundedLineHeight;
    },

    changeLineHeight: function(increment) {
      var newLineHeight = (this.options.lineHeight.current * 10 + increment) / 10;
      this.setLineHeight(newLineHeight);
    },

    setLineHeight: function(lineHeight) {
      if (!lineHeight) return;
      this.$els.lineHeightButtons.removeClass('active');
      this.$els.lineHeightButtons.filter('.line-height-' + lineHeight * 10).addClass('active');

      if (this.options.lineHeight.current == lineHeight) { return }
      this.options.lineHeight.current = lineHeight;
      this.updateLocalStorage('lineHeight', lineHeight);


      this.$els.main.css('line-height', lineHeight);
    },

    // Alignment Management
    leftAlignment   : function() { this.setAlignment('left') },
    justifyAlignment: function() { this.setAlignment('justify') },

    initAlignmentButtonsGroup: function() {
      var buttonsGroup, $buttonsGroup, defaultButton;

      $buttonsGroup = $('.alignments');
      defaultButton = $buttonsGroup.find('.alignment-' + this.options.alignment.current);

      buttonsGroup = new ButtonsGroup($buttonsGroup, defaultButton);
    },

    setAlignment: function(alignment) {
      if (!alignment) return;
      this.$els.alignmentButtons.removeClass('active');
      this.$els.alignmentButtons.filter('.alignment-' + alignment).addClass('active');

      if(this.options.alignment.current == alignment) return;
      var previousAlignment = this.options.alignment.current;
      this.options.alignment.current = alignment;
      this.updateLocalStorage('alignment', alignment);

      this.$els.main.removeClass('align-' + previousAlignment);
      this.$els.main.addClass('align-' + alignment);
    },

    updateLocalStorage: function(property, value) {
      var settings = JSON.parse(localStorage.getItem('readabilitySettings')) || {};

      settings[property] = value;
      localStorage.setItem('readabilitySettings', JSON.stringify(settings));
    },

    initThemeSlider: function() {
      var callback = this.setTheme.bind(this);

      $(".slider-container .slider").slider({
        value: this.options.theme.current,
        min: 1,
        max: 5,
        step: 1,
        slide: function(e, ui) { callback(ui.value) }
      });
    },

    setTheme: function(theme) {
      if (!theme || this.options.theme.current == theme) { return }

      var previousTheme = this.options.theme.current;
      this.options.theme.current = theme;
      this.updateLocalStorage('theme', theme);

      this.$els.body.removeClass('theme-' + previousTheme);
      this.$els.body.addClass('theme-' + theme);
    },

    // Font family Management
    fontFamily: function(fontFamily) {
      this.setFontFamily(fontFamily);
    },

    initFontFamilyButtonsGroup: function() {
      var _this, buttonsGroup, $buttonsGroup, defaultButton;

      _this = this;
      $buttonsGroup = $('.buttons-group.fonts');
      defaultButton = $buttonsGroup.find('.font-' + this.options.fontFamily.current);

      $buttonsGroup.on('selectChange', function(e, fontFamily) {
        _this.fontFamily(fontFamily);
      });

      buttonsGroup = new ButtonsGroup($buttonsGroup, defaultButton);
    },

    setFontFamily: function(fontFamily) {
      if (!fontFamily) return;
      var previousFontFamily = this.options.fontFamily.current;
      this.options.fontFamily.current = fontFamily;
      this.updateFontFamilyPreviewer(previousFontFamily, fontFamily);

      if (previousFontFamily == fontFamily) return;
      this.updateLocalStorage('fontFamily', fontFamily);
      this.$els.main.removeClass('font-' + previousFontFamily);
      this.$els.main.addClass('font-' + fontFamily);
    },

    cycleFont: function(increment){
      // data should not be stored in dom
      // @todo improve it to not rely on DOM node for font family data
      this.retrieveFontFamilyNode(this.options.fontFamily.current);

      var currentIndex = this.retrieveFontFamilyNode(this.options.fontFamily.current).index(),
          $familyChoicesOptions = this.$els.fontFamilyChoices.find('option'),
          desiredTargetIndex = currentIndex + increment
          targetIndex = (desiredTargetIndex > $familyChoicesOptions.length - 1) ? 0 : desiredTargetIndex,
          targetOption = $familyChoicesOptions.eq(targetIndex);

      this.setFontFamily(targetOption.attr('value'));
    },

    nextFont: function(){ this.cycleFont(1); },
    prevFont: function(){ this.cycleFont(-1); },

    retrieveFontFamilyNode: function(value){
      var currentOption = 'option[value="' + value + '"]';
      return this.$els.fontFamilyChoices.find(currentOption);
    },

    retrieveFontFamilyDisplayName: function(fontName){
      return this.retrieveFontFamilyNode(fontName).text();
    },

    updateFontFamilyPreviewer: function(previousFont, newFont){
      this.$els.fontFamilyExample.removeClass('font-' + previousFont);
      this.$els.fontFamilyExample.addClass('font-' + newFont);
      this.$els.fontFamilyName.text(this.retrieveFontFamilyDisplayName(newFont));
    }
  }

  return ReadabilitySettings;

})();

// Singleton
window.ReadabilitySettings = new ReadabilitySettings();
