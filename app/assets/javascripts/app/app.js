var App,
    __bind = function(fn, me) { return function() { return fn.apply(me, arguments) }};

App = (function() {
  function App() {
    // Scope callback functions to instance
    this.handleKeyup             = __bind(this.handleKeyup, this);
    this.onWindowScroll          = __bind(this.onWindowScroll, this);
    this.onChapterSelectChange   = __bind(this.onChapterSelectChange, this);
    this.onParagraphSelectChange = __bind(this.onParagraphSelectChange, this);
    this.onAnchorsButtonClick    = __bind(this.onAnchorsButtonClick, this);
    this.hideAdvancedMenus       = __bind(this.hideAdvancedMenus, this);
    //@todo handle tap equivalent of click events on touch devices

    // Global variables
    this.options = {
      defaultTitle: document.title,
      currentState: null,
      advancedMenusOpened: false,
      currentScrollTop: 0,
      currentSection: {},
      currentChapter: 1,
      currentParagraph: 1,
      paragraphCount: 1,
      chapterCount: 1,
      forceChapterChange: false,
      forceParagraphChange: false,
      lastAnchorTypeChanged: 'paragraph'
    }

    // jQuery cached elements
    this.elements = {
      body: $('body'),
      window: $(window),
      sections: $('.section'),
      sectionName: $('[data-hook="section-name"]'),
      currentChapter: $('[data-hook="current-chapter"]'),
      currentParagraph: $('[data-hook="current-paragraph"]'),
      paragraphCount: $('[data-hook="paragraph-count"]'),
      chapterSelect: $('select[name="chapter"]'),
      paragraphSelect: $('select[name="paragraph"]'),
      anchorsWrap: $('.anchors'),
      anchorsButton: $('.anchors .button'),
      allLinks: $('a[href^="javascript:"]:not(a[href="javascript:"])')
    }

    // Events
    $(document).on('keyup', this.handleKeyup);
    this.elements.window.on('scroll', this.onWindowScroll);
    this.elements.window.on('resize', this.onWindowScroll);
    this.elements.chapterSelect.on('change', this.onChapterSelectChange);
    this.elements.paragraphSelect.on('change', this.onParagraphSelectChange);
    this.elements.anchorsButton.on('click', this.onAnchorsButtonClick);
    $('.veil').on('click', this.hideAdvancedMenus);

    // Onload
    this.gotoCurrentAnchor();
    this.setParagraphCount();
    this.setChapterCount();

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
    }
  }

  // Utils
  App.prototype.getScrollTop = function() {
    return window.pageYOffset || (typeof this.elements.window.scrollTop === "function" ? this.elements.window.scrollTop() : 0);
  }

  App.prototype.isInTheFold = function(elem) {
    var rect = elem.getBoundingClientRect();
    if (rect.top <= 0 && rect.bottom > 0) { return true }
    return false;
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

  // Events callback
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
      _this.setCurrentSection(_this.getAnchorTypeAndNumberMatches(section.id));

      $(section).children('.paragraph').each(function(ii, paragraph) {
        if (!_this.isInTheFold(paragraph)) { return true }
        currentAnchor = paragraph;
        _this.setCurrentParagraph(_this.getAnchorTypeAndNumberMatches(paragraph.id).number);
      });
    });

    if (currentAnchor == null) {
      this.clearState();
      this.setCurrentChapter(1);
      this.setCurrentParagraph(1);
      return;
    }

    matches = this.getAnchorTypeAndNumberMatches(currentAnchor.id);
    this.replaceStateFromMatches(matches, false);
  }

  App.prototype.onAnchorsButtonClick = function(e) {
    this.elements.anchorsWrap.toggleClass('opened');
    this.elements.body.toggleClass('submenu-opened');
  }

  App.prototype.onChapterSelectChange = function(e) {
    var value, paragraphNumber, $chapter, $paragraph;

    value = e.currentTarget.value;
    $chapter = $('#chapter-' + value);
    $paragraph = $chapter.children('.paragraph:first-of-type');

    paragraphNumber = this.getAnchorTypeAndNumberMatches($paragraph[0].id).number;
    this.changeSiblingAnchorSelect(this.elements.paragraphSelect[0], paragraphNumber, 'chapter');

    this.replaceState(this.options.lastAnchorTypeChanged, value, true);
  }

  App.prototype.onParagraphSelectChange = function(e) {
    var value, chapterNumber, $chapter, $paragraph;

    value = e.currentTarget.value;
    $paragraph = $('#paragraph-' + value);
    $chapter = $paragraph.parent('');

    chapterNumber = this.getAnchorTypeAndNumberMatches($chapter[0].id).number;
    this.changeSiblingAnchorSelect(this.elements.chapterSelect[0], chapterNumber, 'paragraph');

    this.replaceState(this.options.lastAnchorTypeChanged, value, true);
  }

  // Anchors management
  App.prototype.getAnchorTypeAndNumberMatches = function(string) {
    var matches = string.match(/(paragraph|chapter|preface|foreword)(-|\/)([0-9]+)/);
    if (matches == null) { return null }

    return { type: matches[1], number: matches[3] }
  }

  App.prototype.gotoAnchor = function(anchorType, anchorNumber) {
    var id, $elem, offset;

    id = '#' + anchorType + '-' + anchorNumber;
    $elem = $(id);
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
    matches = this.getAnchorTypeAndNumberMatches(currentHref);

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

    this.elements.sectionName.html(anchor.type.capitalize());

    if (anchor.type == 'chapter') { this.setCurrentChapter(anchor.number) }
    else { this.setCurrentChapter(1) }
  }

  App.prototype.setCurrentChapter = function(chapterNumber) {
    var sameNumber = chapterNumber == this.options.currentChapter;
    if (sameNumber && !this.options.forceChapterChange) { return }

    this.options.currentChapter = chapterNumber;
    this.options.forceChapterChange = false;

    this.elements.currentChapter.html(chapterNumber);
    this.elements.chapterSelect[0].options.selectedIndex = chapterNumber - 1;
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
    if (count == null) { count = $('.paragraph').length }
    if (count == this.options.paragraphCount) { return }

    this.options.paragraphCount = count;
    this.setAnchorSelect('paragraph');

    this.elements.paragraphCount.html(count);
  }

  App.prototype.setChapterCount = function(count) {
    if (count == null) { count = $('.chapter').length }
    if (count == this.options.chapterCount) { return }

    this.options.chapterCount = count;
    this.setAnchorSelect('chapter');
  }

  App.prototype.setAnchorSelect = function(anchorType) {
    var $select, anchorCount;

    anchorCount = this.options[anchorType + 'Count'];
    $select = this.elements[anchorType + 'Select'];

    for (var i=1; i <= anchorCount; i++) {
      $select.append('<option value="' + i + '">' + i + '</option>')
    }
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
