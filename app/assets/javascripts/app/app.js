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
      titleWrap: $('[data-hook="textTitle"]')
    }

    // Events
    $(document).on('keyup', this.handleKeyup.bind(this));
    this.$els.window.on('scroll resize', this.onWindowScroll.bind(this));
    this.$els.paragraphSelect.on('change', this.onParagraphSelectChange.bind(this));
    this.$els.anchorsButton.on(UA.CLICK, this.onAnchorsButtonClick.bind(this));
    this.$els.summaryButton.on(UA.CLICK, this.onSummaryButtonClick.bind(this));
    this.$els.sections.find('h3:first').on('click', this.onHeadingClick.bind(this));
    $('.veil').on(UA.CLICK, this.hideAdvancedMenus.bind(this));

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
    },

    handleMobileDevices: function(){
      // Mobile
      if (!UA.IS_TOUCH_DEVICE) { return; }
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
    showAdvancedMenus: function() {
      if (this.options.advancedMenusOpened) { return }
      this.options.advancedMenusOpened = true;
      this.options.currentScrollTop = this.getScrollTop();

      this.$els.body.addClass('show-advanced-menus');
    },

    hideAdvancedMenus: function() {
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

    showTextSettingsMenu: function(menu) {
      var isToggle = this.options.textInfosOpened == menu;
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
      var matches = string.match(/(lim|par|chap)(\/)([0-9]+)/);
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
      url = '/' + anchorType + '/' + anchorNumber;

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
      url = '/';

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
      if(!UA.IS_TOUCH_DEVICE) { return; }

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
