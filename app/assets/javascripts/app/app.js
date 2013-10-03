var App = (function() {
  function App() {
    // Global variables
    this.options = {
      defaultTitle: document.title,
      currentState: null,
      advancedMenusOpened: false,
      summaryOpened: false,
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

    // jQuery cached elements
    this.elements = {
      body: $('body'),
      window: $(window),
      par: $('p, .paragraph').not('.exclude'),
      chap: $('.chapter').not('.exclude'),
      lim: $('.lim').not('.exclude'),
      contentWrap: $('section[role=main]'),
      sections: $('.section'),
      currentParagraph: $('[data-hook="current-paragraph"]'),
      paragraphCount: $('[data-hook="paragraph-count"]'),
      paragraphSelect: $('select[name="par"]'),
      anchorsWrap: $('.anchors'),
      anchorsButton: $('.anchors .button'),
      allLinks: $('a[href^="javascript:"]:not(a[href="javascript:"])'),
      summaryButton: $('[data-hook="toggle-summary"]'),
      authorWrap: $('[data-hook="author"'),
      titleWrap: $('[data-hook="textTitle"')
    }

    // Events
    $(document).on('keyup', this.handleKeyup.bind(this));
    this.elements.window.on('scroll resize', this.onWindowScroll.bind(this));
    this.elements.paragraphSelect.on('change', this.onParagraphSelectChange.bind(this));
    this.elements.anchorsButton.on(UA.CLICK, this.onAnchorsButtonClick.bind(this));
    this.elements.summaryButton.on(UA.CLICK, this.onSummaryButtonClick.bind(this));
    this.elements.sections.find('h3:first').on('click', this.onHeadingClick.bind(this));
    $('.veil').on(UA.CLICK, this.hideAdvancedMenus.bind(this));

    // Onload
    this.setTitle();
    this.gotoCurrentAnchor();
    this.setParagraphCount();
    this.setChapterCount();
    this.setData();

    // Mobile
    if (UA.IS_TOUCH_DEVICE) {
      var App = this;
      window.scrollTo(0, 1);

      this.elements.anchorsButton = $('.anchors')
      this.elements.allLinks.on('click', function(e) { return false });
      this.elements.allLinks.onTap(function(e) {
        action = this.href.match(/javascript:(.+)/)[1];
        eval(action);
      });

      // Handle touch events, leave don't block clicks
      this.elements.contentWrap.on('touchstart', this.onContentTouchStart.bind(this));
      this.elements.contentWrap.on('touchend', this.onContentTouchEnd.bind(this));

      this.elements.sections.find('h3:first').onTap(this.onHeadingClick.bind(this));
    }
  }

  // Utils
  App.prototype.getScrollTop = function() {
    return window.pageYOffset || (typeof this.elements.window.scrollTop === "function" ? this.elements.window.scrollTop() : 0);
  }

  App.prototype.smoothScrollTo = function(offset) {
    this.elements.body.animate({
      scrollTop: offset,
      duration: 400
    });
  }

  App.prototype.isInTheFold = function(elem) {
    var rect = elem.getBoundingClientRect();
    if (rect.top <= 0 && rect.bottom > 0) { return true }
    return false;
  }

  App.prototype.showNextPageHint = function() {
    var nextPageHint = document.createElement("div");
    nextPageHint.className = "pageswipe-hint";
    this.elements.contentWrap.after(nextPageHint);
    $(nextPageHint).one('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', this.onPageChangeEnded.bind(this));
  }

  // Advanced menus management
  App.prototype.showAdvancedMenus = function() {
    if (this.options.advancedMenusOpened) { return }
    this.options.advancedMenusOpened = true;
    this.options.currentScrollTop = this.getScrollTop();

    this.elements.body.addClass('show-advanced-menus');
  }

  App.prototype.hideAdvancedMenus = function() {
    if (!this.options.advancedMenusOpened) { return }
    this.options.advancedMenusOpened = false;

    if (ReadabilitySettings) { ReadabilitySettings.closeSubmenu() }
    this.elements.body.removeClass('show-advanced-menus submenu-opened');
    this.elements.anchorsWrap.removeClass('opened');
  }

  App.prototype.hideTextSettingsMenus = function() {
    this.elements.body.removeClass('show-font-size-menu show-line-height-menu show-font-family-menu show-alignment-menu');
    this.options.textInfosOpened = false;
  }

  App.prototype.showTextSettingsMenu = function(menu) {
    var isToggle = this.options.textInfosOpened == menu;
    this.hideTextSettingsMenus();

    if(isToggle) return;
    this.options.textInfosOpened = menu;
    this.elements.body.addClass('show-' + menu + '-menu');
  }

  // Events callback
  App.prototype.onContentTouchStart = function(e) {
    this.gestureStartTime = new Date();
    this.gestureStartPosition = e.originalEvent.changedTouches[0].clientY;
    this.gestureStartScreenPosition = this.elements.window.scrollTop();

    this.elements.body.stop(); // In case the body is scrolling via jQuery
  }

  App.prototype.onContentTouchEnd = function(e) {
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
  }

  App.prototype.getTapZone = function(){
    var wHeight = window.innerHeight,
        tapZoneHeight = wHeight * (this.options.nextPageTapZone/100),
        maxTapZone = this.options.maxTapZone,
        limitedTapZoneHeight = ((tapZoneHeight > maxTapZone) ? maxTapZone : tapZoneHeight);

    return wHeight - limitedTapZoneHeight;
  }

  App.prototype.onPageChangeEnded = function(e) {
    $('.pageswipe-hint').remove();
  }

  App.prototype.onSummaryButtonClick = function(e) {
    this.options.summaryOpened ? this.closeSummary() : this.openSummary();
  }

  App.prototype.openSummary = function() {
    this.options.scrollPosition = this.getScrollTop();
    this.elements.body.addClass('show-summary');
    this.options.summaryOpened = true;
    this.elements.window.scrollTop(0);
  }

  App.prototype.closeSummary = function() {
    this.elements.body.removeClass('show-summary');
    this.options.summaryOpened = false;
    this.elements.window.scrollTop(this.options.scrollPosition);
  }

  App.prototype.onHeadingClick = function(e) {
    var $el, $section, number, matches;

    if(!this.options.summaryOpened) return;

    $el = $(e.currentTarget);
    $section = $el.parents('.section');
    number = this.elements.sections.index($section);
    matches = this.getAnchorTypeAndNumberMatchesFromEl($section[0]);

    this.closeSummary();

    //@todo make a decision about whether the advanced menus should close or not
    this.hideAdvancedMenus();

    this.gotoAnchorFromMatches(matches);
  }

  App.prototype.handleKeyup = function(e) {
    var keys, key;

    keys = { escape: 27 };
    key = e.keyCode ? e.keyCode : e.which;

    if (key != keys.escape) { return }

    if (ReadabilitySettings.get('submenuOpened')) {
      ReadabilitySettings.closeSubmenu();
    } else {
      this.hideAdvancedMenus();
    }
  }

  App.prototype.onWindowScroll = function(e) {
    var _this, scrollTop, currentAnchor;

    _this = this;
    scrollTop = this.getScrollTop();
    currentAnchor = null;

    // Change history state to current section & paragraph
    this.elements.sections.each(function(i, section) {
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
  }

  App.prototype.onAnchorsButtonClick = function(e) {
    this.elements.anchorsWrap.toggleClass('opened');
    this.elements.body.toggleClass('submenu-opened');
  }

  App.prototype.onParagraphSelectChange = function(e) {
    var value = e.currentTarget.value;
    this.replaceState(this.options.lastAnchorTypeChanged, value, true);
  }

  // Anchors management
  App.prototype.getAnchorTypeAndNumberMatchesFromHref = function(string) {
    var matches = string.match(/(lim|par|chap)(\/)([0-9]+)/);
    if (matches == null) { return null }

    return { type: matches[1], number: matches[3] }
  }

  App.prototype.getAnchorTypeAndNumberMatchesFromEl = function(el) {
    var anchorType = $(el).data('type');
    if(!anchorType) { return null }

    return { type: anchorType, number: this.elements[anchorType].index(el) + 1 }
  }

  App.prototype.gotoAnchor = function(anchorType, anchorNumber) {
    var $elem, offset;

    $elem = $(this.elements[anchorType][anchorNumber - 1]);
    offset = $elem.offset().top;

    this.elements.window.scrollTop(offset);
    document.title = this.options.defaultTitle + ' | ' + anchorType.capitalize() + ' ' + anchorNumber;
  }

  App.prototype.gotoAnchorFromMatches = function(matches) {
    if (matches == null) { return }
    this.gotoAnchor(matches.type, matches.number);
  }

  App.prototype.gotoCurrentAnchor = function() {
    var currentHref, matches;

    currentHref = window.location.href;
    matches = this.getAnchorTypeAndNumberMatchesFromHref(currentHref);

    if (matches == null) { return }
    this.gotoAnchorFromMatches(matches);
  }

  // History management
  App.prototype.replaceState = function(anchorType, anchorNumber, scrollToAnchor) {
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
  }

  App.prototype.replaceStateFromMatches = function(matches, scrollToAnchor) {
    if (matches == null) { return }
    this.replaceState(matches.type, matches.number, scrollToAnchor);
  }

  App.prototype.clearState = function() {
    if (this.options.currentState == null) { return }
    this.options.currentState = null;

    var state, title, url;

    state = {};
    title = this.options.defaultTitle;
    url = '/';

    window.history.replaceState(state, title, url);
    document.title = title;
  }

  // Sections and chapters management
  App.prototype.setCurrentSection = function(anchor) {
    var sameType, sameNumner;
    sameType = anchor.type == this.options.currentSection.type;
    sameNumner = anchor.number == this.options.currentSection.number;

    if (sameType && sameNumner) { return }
    this.options.currentSection = anchor;

    if (anchor.type == 'chap') { this.setCurrentChapter(anchor.number) }
    else { this.setCurrentChapter(1) }
  }

  App.prototype.setCurrentChapter = function(chapterNumber) {
    var sameNumber, paragraphNumber, $optgroup;
    sameNumber = chapterNumber == this.options.currentChapter;

    if (sameNumber && !this.options.forceChapterChange) { return }

    $optgroup = $(this.elements.paragraphSelect.find('optgroup')[parseInt(chapterNumber)+1]);
    paragraphNumber = $optgroup.find('option').first().val();

    this.options.currentChapter = chapterNumber;
    this.options.forceChapterChange = false;

    this.setCurrentParagraph(paragraphNumber);
  }

  App.prototype.setCurrentParagraph = function(paragraphNumber) {
    var sameNumber = paragraphNumber == this.options.currentParagraph;
    if (sameNumber && !this.options.forceParagraphChange) { return }

    this.options.currentParagraph = paragraphNumber;
    this.options.forceParagraphChange = false;

    this.elements.currentParagraph.html(paragraphNumber);
    this.elements.paragraphSelect[0].options.selectedIndex = paragraphNumber - 1;
  }

  App.prototype.setParagraphCount = function(count) {
    if (count == null) { count = $('p, .paragraph').not('.exclude').length }
    if (count == this.options.paragraphCount) { return }

    this.options.paragraphCount = count;
    this.setAnchorSelect();

    this.elements.paragraphCount.html(count);
  }

  App.prototype.setChapterCount = function(count) {
    if (count == null) { count = this.elements.chap.length }
    if (count == this.options.chapterCount) { return }

    this.options.chapterCount = count;
  }

  App.prototype.setAnchorSelect = function() {
    var $sections = $('.section'),
        options = "",
        i = 1;

    $sections.each(function(index, el) {
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

    this.elements.paragraphSelect.html(options);
  }

  App.prototype.setData = function() {
    var _this = this;

    $.each(['lim', 'par', 'chap'], function(i, el){
      _this.elements[el].data('type', el);
    })
  }

  App.prototype.setTitle = function() {
    var author = this.elements.contentWrap.find('.author').text(),
        textTitle = this.elements.contentWrap.find('.title').text();

    this.defaultTitle = author + " - " + textTitle;
    document.title = this.defaultTitle;
    this.elements.authorWrap.text(author);
    this.elements.titleWrap.text(textTitle);
  }

  App.prototype.changeSiblingAnchorSelect = function(siblingAnchorSelect, anchorNumber, anchorType) {
    siblingAnchorSelect.options.selectedIndex = anchorNumber - 1;

    this.options.forceChapterChange = true;
    this.options.forceParagraphChange = true;

    this.options.lastAnchorTypeChanged = anchorType;
  }

  return App;

})();

// Singleton
window.App = new App();
