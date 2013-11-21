if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}


$.fn.onTap = function(callback) {
  if (window.ontouchend !== void 0) {
    // Init touchMoveCount
    this.each(function() {
      this._touchMoveCount = 0
    });

    // Count touch moves
    this.on('touchmove', function() {
      this._touchMoveCount++;
    });

    // callback() if touchMoveCount is < 3
    this.on('touchend', function(e) {
      if (this._touchMoveCount < 3) { callback.call(this, e) }
      this._touchMoveCount = 0;
    });

    // Cancel click event
    this.on('click', function() {
      return false;
    });
  }
}


var ButtonsGroup = (function() {
  function ButtonsGroup($elem, $defaultSelectedButton) {
    // jQuery cached elements
    this.$els = {
      group: $elem,
      buttons: $elem.find('.simple-button'),
      select: $elem.children('select'),
      selectedButton: null
    }

    this.$els.buttons.on('click', this.onButtonClick.bind(this));

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


// Global Namespace
window.EDSA_UA = {};

// Touch
EDSA_UA.IS_TOUCH_DEVICE = window.ontouchend !== void 0;
EDSA_UA.CLICK = (EDSA_UA.IS_TOUCH_DEVICE) ? 'touchend' : 'click';

// Transition
EDSA_UA.HAS_TRANSITIONS = false;

// SVG
EDSA_UA.HAS_SVG = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;

// Retina
EDSA_UA.IS_RETINA = ('devicePixelRatio' in window && devicePixelRatio > 1) || ('matchMedia' in window && matchMedia("(min-resolution:144dpi)").matches);

(function(){
  var elem, html, prefix, prefixes, _i, _j, _len, _len1, _ref;
  html = document.documentElement;

  prefixes = ['webkit', 'Moz', 'Ms', 'O'];
  for (_i = 0, _len = prefixes.length; _i < _len; _i++) {
    prefix = prefixes[_i];
    if (html.style["" + prefix + "Transition"] !== void 0) {
      html.className += " " + (prefix.toLowerCase());
      EDSA_UA.HAS_TRANSITIONS = true;
      EDSA_UA.BROWSER = prefix.toLowerCase();
    }
  }

  // HTML Classes
  html.className = html.className.replace('no-js', 'js');
  html.className += EDSA_UA.IS_TOUCH_DEVICE ? ' touch' : ' no-touch';
  html.className += EDSA_UA.HAS_TRANSITIONS ? ' transitions' : ' no-transitions';
  html.className += EDSA_UA.HAS_SVG ? ' svg' : ' no-svg';
  html.className += EDSA_UA.IS_RETINA ? ' retina' : ' no-retina';

  if (/\bipad\b/i.test(navigator.userAgent)) { html.className += ' ios ipad'; }
  if (/\biphone\b/i.test(navigator.userAgent)) { html.className += ' ios iphone'; }
  if (/safari/i.test(navigator.userAgent)) {
    if (/version\/4/i.test(navigator.userAgent)) { html.className += ' safari-4'; }
    if (/version\/5/i.test(navigator.userAgent)) { html.className += ' safari-5'; }
  }
  if (/firefox\/3/i.test(navigator.userAgent)) { html.className += ' firefox-3'; }

  // HTML5 Shiv
  _ref = ['article', 'aside', 'canvas', 'details', 'figcaption', 'figure', 'footer', 'header', 'hgroup', 'mark', 'menu', 'nav', 'section', 'summary', 'time'];
  for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
    elem = _ref[_j];
    document.createElement(elem);
  }
})

var App = (function() {
  function App(opts) {
    // Global variables
    this.options = {
      defaultTitle: document.title,
      currentState: null,
      advancedMenusOpened: false,
      summaryOpened: false,
      relativeSummary: false,
      currentScrollTop: 0,
      currentSection: {},
      currentChapter: 1,
      currentParagraph: 1,
      paragraphCount: 1,
      chapterCount: 1,
      forceChapterChange: false,
      forceParagraphChange: false,
      lastAnchorTypeChanged: 'par',
      gestureTime: 220, // Max allowable time before a gesture stops being a quick swipe
      nextPageTapZone: 25, // percentage
      maxTapZone: 150, // pixels
      scrollPosition: 0
    }

    $.extend(this.options, opts);

    // jQuery cached elements
    this.$els = {
      body: $('body'),
      window: $(window),
      par: $('p, .paragraph').not('.exclude'),
      chap: $('.chapter').not('.exclude'),
      lim: $('.lim').not('.exclude'),
      contentWrap: $('section[role=main]'),
      sections: $('section[role=main] section'),
      currentParagraph: $('[data-hook="current-paragraph"]'),
      paragraphCount: $('[data-hook="paragraph-count"]'),
      paragraphSelect: $('select[name="par"]'),
      anchorsWrap: $('.anchors'),
      anchorsButton: $('.anchors .button'),
      allLinks: $('a[href^="javascript:"]:not(a[href="javascript:"])'),
      summaryButton: $('[data-hook="toggle-summary"]'),
      authorWrap: $('[data-hook="author"]'),
      titleWrap: $('[data-hook="textTitle"]'),
      closeAdvancedMenuBtn: $('[data-hook="close-advanced-menu"]'),
      showAdvancedMenuBtn: $('[data-hook="show-advanced-menu"]'),
      showTextSettingsMenuBtn: $('[data-hook="show-text-settings-menu"]'),
      changeLineHeightBtns: $('[data-hook="change-line-height"]'),
      changeFontBtns: $('[data-hook="change-font"]'),
      changeAlignmentBtns: $('[data-hook="change-alignment"]'),
      toggleSubmenuBtn: $('[data-hook="toggle-submenu"]'),
      backLibraryBtn: $('[data-hook="back-library"]')
    }

    // Events
    $(document).on('keyup', this.handleKeyup.bind(this));
    this.$els.window.on('scroll resize', this.onWindowScroll.bind(this));
    this.$els.paragraphSelect.on('change', this.onParagraphSelectChange.bind(this));
    this.$els.anchorsButton.on(EDSA_UA.CLICK, this.onAnchorsButtonClick.bind(this));
    this.$els.summaryButton.on(EDSA_UA.CLICK, this.onSummaryButtonClick.bind(this));
    this.$els.sections.find('h3:first').on('click', this.onHeadingClick.bind(this));
    this.$els.closeAdvancedMenuBtn.on('click', this.hideAdvancedMenus.bind(this));
    this.$els.showAdvancedMenuBtn.on('click', this.showAdvancedMenus.bind(this));
    this.$els.showTextSettingsMenuBtn.on('click', this.showTextSettingsMenu.bind(this));
    this.$els.changeLineHeightBtns.on('click', this.changeLineHeight.bind(this));
    this.$els.changeFontBtns.on('click', this.changeFont.bind(this));
    this.$els.changeAlignmentBtns.on('click', this.changeAlignment.bind(this));
    this.$els.toggleSubmenuBtn.on('click', this.toggleSubmenu.bind(this));
    $('.veil').on(EDSA_UA.CLICK, this.hideAdvancedMenus.bind(this));

    this.init();
  }

  // Utils
  App.prototype = {
    init: function(){
      // Onload
      this.setTitle();
      this.gotoCurrentAnchor();
      this.setParagraphCount();
      this.setChapterCount();
      this.setData();
      this.initClasses();
      this.handleMobileDevices();
      this.initStartupHint();
      this.manageBackLibrary();
    },

    handleMobileDevices: function(){
      // Mobile
      if (!EDSA_UA.IS_TOUCH_DEVICE) { return; }
      var App = this;
      window.scrollTo(0, 1);

      this.$els.anchorsButton = $('.anchors')
      this.$els.allLinks.on('click', function(e) { return false });
      this.$els.allLinks.onTap(function(e) {
        action = this.href.match(/javascript:(.+)/)[1];
        eval(action);
      });

      // Handle touch events, leave don't block clicks
      this.$els.contentWrap.on('touchstart', this.onContentTouchStart.bind(this));
      this.$els.contentWrap.on('touchend', this.onContentTouchEnd.bind(this));

      this.$els.sections.find('h3:first').onTap(this.onHeadingClick.bind(this));
    },

    getScrollTop: function() {
      return window.pageYOffset || (typeof this.$els.window.scrollTop === "function" ? this.$els.window.scrollTop() : 0);
    },

    smoothScrollTo: function(offset) {
      this.$els.body.animate({
        scrollTop: offset,
        duration: 400
      });
    },

    isInTheFold: function(elem) {
      var rect = elem.getBoundingClientRect();
      if (rect.top <= 0 && rect.bottom > 0) { return true }
      return false;
    },

    showNextPageHint: function() {
      var nextPageHint = document.createElement("div");
      nextPageHint.className = "pageswipe-hint";
      this.$els.contentWrap.after(nextPageHint);
      $(nextPageHint).one('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', this.onPageChangeEnded.bind(this));
    },

    // Advanced menus management
    showAdvancedMenus: function(e) {
      if(e) e.preventDefault();

      if (this.options.advancedMenusOpened) { return }
      this.options.advancedMenusOpened = true;
      this.options.currentScrollTop = this.getScrollTop();

      this.$els.body.addClass('show-advanced-menus');
    },

    hideAdvancedMenus: function(e) {
      if(e) e.preventDefault();

      if (!this.options.advancedMenusOpened) { return }
      this.options.advancedMenusOpened = false;

      if (ReadabilitySettings) { ReadabilitySettings.closeSubmenu() }
      this.$els.body.removeClass('show-advanced-menus submenu-opened');
      this.$els.anchorsWrap.removeClass('opened');
    },

    hideTextSettingsMenus: function() {
      this.$els.body.removeClass('show-font-size-menu show-line-height-menu show-font-family-menu show-alignment-menu');
      this.options.textInfosOpened = false;
    },

    showTextSettingsMenu: function(e) {
      e.preventDefault();

      var menu = $(e.currentTarget).data('setting'),
          isToggle = this.options.textInfosOpened == menu;

      this.hideTextSettingsMenus();

      if(isToggle) return;
      this.options.textInfosOpened = menu;
      this.$els.body.addClass('show-' + menu + '-menu');
    },

    // Events callback
    onContentTouchStart: function(e) {
      this.gestureStartTime = new Date();
      this.gestureStartPosition = e.originalEvent.changedTouches[0].clientY;
      this.gestureStartScreenPosition = this.$els.window.scrollTop();

      this.$els.body.stop(); // In case the body is scrolling via jQuery
    },

    onContentTouchEnd: function(e) {
      this.gestureEndTime = new Date();
      this.gestureEndPosition = e.originalEvent.changedTouches[0].clientY;

      var elapsedTime = this.gestureEndTime - this.gestureStartTime,
          positionDelta = this.gestureEndPosition - this.gestureStartPosition,
          speed = positionDelta / elapsedTime;

      if(elapsedTime <= this.options.gestureTime) {
        var pageIncrement = window.innerHeight * 0.75,
            tapZone = this.getTapZone();

        // Note: Negative speed means going *down* the page
        //       Also, no more swipe detection for now

        if(!speed){
          if(this.gestureEndPosition >= tapZone && !this.options.summaryOpened){
            this.showNextPageHint();
            this.smoothScrollTo(this.gestureStartScreenPosition + pageIncrement);
          }
          else {
            this.showAdvancedMenus();
          }
        }
      }
    },

    getTapZone: function(){
      var wHeight = window.innerHeight,
          tapZoneHeight = wHeight * (this.options.nextPageTapZone/100),
          maxTapZone = this.options.maxTapZone,
          limitedTapZoneHeight = ((tapZoneHeight > maxTapZone) ? maxTapZone : tapZoneHeight);

      return wHeight - limitedTapZoneHeight;
    },

    onPageChangeEnded: function(e) {
      $('.pageswipe-hint').remove();
    },

    onSummaryButtonClick: function(e) {
      this.options.summaryOpened ? this.closeSummary() : this.openSummary();
    },

    openSummary: function() {
      this.options.scrollPosition = this.getScrollTop();
      this.$els.body.addClass('show-summary');
      this.options.summaryOpened = true;
      this.$els.window.scrollTop(0);
    },

    closeSummary: function() {
      this.$els.body.removeClass('show-summary');
      this.options.summaryOpened = false;
      this.$els.window.scrollTop(this.options.scrollPosition);
    },

    onHeadingClick: function(e) {
      var $el, $section, number, matches;

      if(!this.options.summaryOpened) return;

      $el = $(e.currentTarget);
      $section = $el.parents('section');
      number = this.$els.sections.index($section);
      matches = this.getAnchorTypeAndNumberMatchesFromEl($section[0]);

      this.closeSummary();

      //@todo make a decision about whether the advanced menus should close or not
      this.hideAdvancedMenus();

      this.gotoAnchorFromMatches(matches);
    },

    handleKeyup: function(e) {
      var keys, key;

      keys = { escape: 27 };
      key = e.keyCode ? e.keyCode : e.which;

      if (key != keys.escape) { return }

      if (ReadabilitySettings.get('submenuOpened')) {
        ReadabilitySettings.closeSubmenu();
      } else {
        this.hideAdvancedMenus();
      }
    },

    onWindowScroll: function(e) {
      var _this, scrollTop, currentAnchor;

      _this = this;
      scrollTop = this.getScrollTop();
      currentAnchor = null;

      // Change history state to current section & paragraph
      this.$els.sections.each(function(i, section) {
        if (!_this.isInTheFold(section)) { return true }
        currentAnchor = section;
        _this.setCurrentSection(_this.getAnchorTypeAndNumberMatchesFromEl(section));

        $(section).children('p, .paragraph').not('.exclude').each(function(ii, paragraph) {
          if (!_this.isInTheFold(paragraph)) { return true }
          currentAnchor = paragraph;
          _this.setCurrentParagraph(_this.getAnchorTypeAndNumberMatchesFromEl(paragraph).number);
        });
      });

      if (currentAnchor == null) {
        this.clearState();
        this.setCurrentChapter(1);
        this.setCurrentParagraph(1);
        return;
      }

      matches = this.getAnchorTypeAndNumberMatchesFromEl(currentAnchor);
      this.replaceStateFromMatches(matches, false);
    },

    onAnchorsButtonClick: function(e) {
      this.$els.anchorsWrap.toggleClass('opened');
      this.$els.body.toggleClass('submenu-opened');
    },

    onParagraphSelectChange: function(e) {
      var value = e.currentTarget.value;
      this.replaceState(this.options.lastAnchorTypeChanged, value, true);
    },

    // Anchors management
    getAnchorTypeAndNumberMatchesFromHref: function(string) {
      var matches = string.match(/(lim|par|chap)(\-)([0-9]+)/);
      if (matches == null) { return null }

      return { type: matches[1], number: matches[3] }
    },

    getAnchorTypeAndNumberMatchesFromEl: function(el) {
      var anchorType = $(el).data('type');
      if(!anchorType) { return null }

      return { type: anchorType, number: this.$els[anchorType].index(el) + 1 }
    },

    gotoAnchor: function(anchorType, anchorNumber) {
      var $elem, offset;

      $elem = $(this.$els[anchorType][anchorNumber - 1]);
      offset = $elem.offset().top;

      this.$els.window.scrollTop(offset);
      document.title = this.options.defaultTitle + ' | ' + anchorType.capitalize() + ' ' + anchorNumber;
    },

    gotoAnchorFromMatches: function(matches) {
      if (matches == null) { return }
      this.gotoAnchor(matches.type, matches.number);
    },

    gotoCurrentAnchor: function() {
      var currentHref, matches;

      currentHref = window.location.href;
      matches = this.getAnchorTypeAndNumberMatchesFromHref(currentHref);

      if (matches == null) { return }
      this.gotoAnchorFromMatches(matches);
    },

    // History management
    replaceState: function(anchorType, anchorNumber, scrollToAnchor) {
      if (this.options.currentState && this.options.currentState.type == anchorType && this.options.currentState.number == anchorNumber) { return }

      var state, title, url;

      state = { type: anchorType, number: anchorNumber };
      title = this.options.defaultTitle + ' | ' + anchorType.capitalize() + ' ' + anchorNumber;
      url = '#' + anchorType + '-' + anchorNumber;

      window.history.replaceState(state, title, url);
      this.options.currentState = state;

      if (scrollToAnchor) {
        this.gotoAnchor(anchorType, anchorNumber);
      } else {
        document.title = title;
      }
    },

    replaceStateFromMatches: function(matches, scrollToAnchor) {
      if (matches == null) { return }
      this.replaceState(matches.type, matches.number, scrollToAnchor);
    },

    clearState: function() {
      if (this.options.currentState == null) { return }
      this.options.currentState = null;

      var state, title, url;

      state = {};
      title = this.options.defaultTitle;
      url = '#';

      window.history.replaceState(state, title, url);
      document.title = title;
    },

    // Sections and chapters management
    setCurrentSection: function(anchor) {
      var sameType, sameNumner;
      sameType = anchor.type == this.options.currentSection.type;
      sameNumner = anchor.number == this.options.currentSection.number;

      if (sameType && sameNumner) { return }
      this.options.currentSection = anchor;

      if (anchor.type == 'chap') { this.setCurrentChapter(anchor.number) }
      else { this.setCurrentChapter(1) }
    },

    setCurrentChapter: function(chapterNumber) {
      var sameNumber, paragraphNumber, $optgroup;
      sameNumber = chapterNumber == this.options.currentChapter;

      if (sameNumber && !this.options.forceChapterChange) { return }

      $optgroup = $(this.$els.paragraphSelect.find('optgroup')[parseInt(chapterNumber)+1]);
      paragraphNumber = $optgroup.find('option').first().val();

      this.options.currentChapter = chapterNumber;
      this.options.forceChapterChange = false;

      this.setCurrentParagraph(paragraphNumber);
    },

    setCurrentParagraph: function(paragraphNumber) {
      var sameNumber = paragraphNumber == this.options.currentParagraph;
      if (sameNumber && !this.options.forceParagraphChange) { return }

      this.options.currentParagraph = paragraphNumber;
      this.options.forceParagraphChange = false;

      this.$els.currentParagraph.html(paragraphNumber);
      this.$els.paragraphSelect[0].options.selectedIndex = paragraphNumber - 1;
    },

    setParagraphCount: function(count) {
      if (count == null) { count = $('p, .paragraph').not('.exclude').length }
      if (count == this.options.paragraphCount) { return }

      this.options.paragraphCount = count;
      this.setAnchorSelect();

      this.$els.paragraphCount.html(count);
    },

    setChapterCount: function(count) {
      if (count == null) { count = this.$els.chap.length }
      if (count == this.options.chapterCount) { return }

      this.options.chapterCount = count;
    },

    setAnchorSelect: function() {
      var options = "",
          i = 1;

      this.$els.sections.each(function(index, el) {
        var currentChapter = $(el),
            title = currentChapter.find('h1, h2, h3').first().text(),
            paragraphsCount = currentChapter.find('p, .paragraph').not('.exclude').length,
            j = 0;

        options += '<optgroup label="' + title + '">';

        while(j < paragraphsCount) {
          options += '<option value="' + i + '">' + i + '</option>'
          j++; i++;
        }

        options += '</optgroup>';
      })

      this.$els.paragraphSelect.html(options);
    },

    setData: function() {
      var _this = this;

      $.each(['lim', 'par', 'chap'], function(i, el){
        _this.$els[el].data('type', el);
      })
    },

    setTitle: function() {
      var author = this.$els.contentWrap.find('.author').text(),
          textTitle = this.$els.contentWrap.find('.title').text();

      this.options.defaultTitle = author + " - " + textTitle;
      document.title = this.options.defaultTitle;
      this.$els.authorWrap.text(author);
      this.$els.titleWrap.text(textTitle);
    },

    changeSiblingAnchorSelect: function(siblingAnchorSelect, anchorNumber, anchorType) {
      siblingAnchorSelect.options.selectedIndex = anchorNumber - 1;

      this.options.forceChapterChange = true;
      this.options.forceParagraphChange = true;

      this.options.lastAnchorTypeChanged = anchorType;
    },

    initClasses: function() {
      if(this.options.relativeSummary) { this.$els.body.addClass('relative-summary') }
    },

    initStartupHint: function(){
      if(!EDSA_UA.IS_TOUCH_DEVICE) { return; }

      var savedSettings = $.parseJSON(localStorage.getItem('edsa'));
      if($.isEmptyObject(savedSettings) || savedSettings.firstVisit == true){
        localStorage.setItem('edsa', JSON.stringify({
          firstVisit: false
        }));

        this.startupHint = new Modal(
          $('.js-startup-hint'),
          {
            openCallback: function(){
              this.$els.body.addClass('show-startup-hint');
              document.ontouchmove = function(e){ e.preventDefault(); }
            }.bind(this),
            closeCallback: function(){
              this.$els.body.removeClass('show-startup-hint');
              document.ontouchmove = function(e){ return true; }
            }.bind(this)
          }
        );
      }
    },

    changeLineHeight: function(e){
      e.preventDefault();
      var lineHeight = $(e.currentTarget).data('line-height');
      ReadabilitySettings.setLineHeight(lineHeight);
    },

    changeFont: function(e){
      e.preventDefault();
      var direction = $(e.currentTarget).data('font-direction');
      ReadabilitySettings.cycleFont(direction);
    },

    changeAlignment: function(e){
      e.preventDefault();
      var alignment = $(e.currentTarget).data('alignment');
      ReadabilitySettings.setAlignment(alignment);
    },

    toggleSubmenu: function(e){
      e.preventDefault();
      ReadabilitySettings.toggleSubmenu();
    },

    manageBackLibrary: function(){

      if(document.referrer) {
        this.$els.backLibraryBtn.on('click', this.handleBackLibrary.bind(this));
      }
      else {
        this.$els.backLibraryBtn.hide();
      }
    },

    handleBackLibrary: function(e){
      e.preventDefault();
      window.history.back();
    }
  }

  return App;

})();

function Modal($modal, options){
  this.opts = options;
  this.$el = $modal;
  this.$content = this.$el.find('.js-modal-content');
  this.$close = this.$el.find('.js-modal-close');
  this.init();
}

Modal.prototype = {
  init: function(){
    this.$close.on('click', function(){ this.close(); }.bind(this));
    this.$el.on('click', function(){ this.close(); }.bind(this));

    this.$content.on('click', function(e){
      e.stopImmediatePropagation();
    });

    this.open();
  },
  close: function(){
    this.$el.addClass('hidden');
    if(this.opts.closeCallback) { this.opts.closeCallback(); }
  },
  open: function(){
    this.$el.removeClass('hidden');
    if(this.opts.openCallback) { this.opts.openCallback(); }
  }
}

// Singleton
window.App = new App();

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
