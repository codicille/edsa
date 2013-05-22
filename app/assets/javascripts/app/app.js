var App = function() { this.initialize.apply(this, arguments) };
App.prototype = (function() { var pro = {};
  var _this = null;

  // Global variables
  var options = {
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
  var elements = {
    body: $('body'),
    window: $(window),
    sectionName: $('[data-hook="section-name"]'),
    currentChapter: $('[data-hook="current-chapter"]'),
    currentParagraph: $('[data-hook="current-paragraph"]'),
    paragraphCount: $('[data-hook="paragraph-count"]'),
    chapterSelect: $('select[name="chapter"]'),
    paragraphSelect: $('select[name="paragraph"]'),
    anchorsButton: $('.anchors button'),
    allLinks: $('a[href^="javascript:"]:not(a[href="javascript:"])')
  }

  // Public scope --------------------------------------------------------------
  pro.initialize = function(args) {
    _this = this;

    // Events
    $('.paragraph-count').on('click', onParagraphCountClick);
    elements.window.on('scroll', onWindowScroll);
    elements.window.on('resize', onWindowScroll);
    elements.chapterSelect.on('change', onChapterSelectChange);
    elements.paragraphSelect.on('change', onParagraphSelectChange);
    elements.anchorsButton.on('click', onAnchorsButtonClick);

    // Onload
    gotoCurrentAnchor();
    setParagraphCount();
    setChapterCount();

    // Mobile
    window.scrollTo(0, 1);
    elements.allLinks.onTap(function(e) {
      action = this.href.match(/javascript:(.+)/)[1];
      eval(action);
    });
  }

  pro.showAdvancedMenus = function() {
    if (options.advancedMenusOpened) { return }
    options.advancedMenusOpened = true;
    options.currentScrollTop = this.getScrollTop();

    elements.body.addClass('show-advanced-menus');
  }

  pro.hideAdvancedMenus = function() {
    if (!options.advancedMenusOpened) { return }
    options.advancedMenusOpened = false;

    if (ReadabilitySettings) { ReadabilitySettings.closeSubmenu() }
    elements.body.removeClass('show-advanced-menus');
  }

  pro.getScrollTop = function() {
    return window.pageYOffset || (typeof elements.window.scrollTop === "function" ? elements.window.scrollTop() : 0);
  }

  // Private scope -------------------------------------------------------------
  var getAnchorTypeAndNumberMatches = function(string) {
    var matches = string.match(/(paragraph|chapter|preface|foreword)(-|\/)([0-9]+)/);
    if (matches == null) { return null }

    return { type: matches[1], number: matches[3] }
  }

  var gotoAnchor = function(anchorType, anchorNumber) {
    var id, $elem, offset;

    id = '#' + anchorType + '-' + anchorNumber;
    $elem = $(id);
    offset = $elem.offset().top;

    elements.window.scrollTop(offset);
    document.title = options.defaultTitle + ' | ' + anchorType.capitalize() + ' ' + anchorNumber;
  }

  var gotoAnchorFromMatches = function(matches) {
    if (matches == null) { return }
    gotoAnchor(matches.type, matches.number);
  }

  var gotoCurrentAnchor = function() {
    var currentHref, matches;

    currentHref = window.location.href;
    matches = getAnchorTypeAndNumberMatches(currentHref);

    if (matches == null) { return }
    gotoAnchorFromMatches(matches);
  }

  var replaceState = function(anchorType, anchorNumber, scrollToAnchor) {
    if (options.currentState && options.currentState.type == anchorType && options.currentState.number == anchorNumber) { return }

    var state, title, url;
    if (scrollToAnchor == null) { scrollToAnchor = false }

    state = { type: anchorType, number: anchorNumber };
    title = options.defaultTitle + ' | ' + anchorType.capitalize() + ' ' + anchorNumber;
    url = '/' + anchorType + '/' + anchorNumber;

    window.history.replaceState(state, title, url);
    options.currentState = state;

    if (scrollToAnchor) {
      gotoAnchor(anchorType, anchorNumber);
    } else {
      document.title = title;
    }
  }

  var replaceStateFromMatches = function(matches, scrollToAnchor) {
    if (matches == null) { return }
    replaceState(matches.type, matches.number, scrollToAnchor);
  }

  var clearState = function() {
    if (options.currentState == null) { return }
    options.currentState = null;

    var state, title, url;

    state = {};
    title = options.defaultTitle;
    url = '/';

    window.history.replaceState(state, title, url);
    document.title = title;
  }

  var isInTheFold = function(elem) {
    var rect = elem.getBoundingClientRect();
    if (rect.top <= 0 && rect.bottom > 0) { return true }
    return false;
  }

  var onParagraphCountClick = function(e) {
    e.preventDefault();

    var matches = getAnchorTypeAndNumberMatches(this.getAttribute('href'));
    replaceStateFromMatches(matches, true);
  }

  var onWindowScroll = function(e) {
    var scrollTop, currentAnchor;

    scrollTop = _this.getScrollTop();
    currentAnchor = null;

    // Change history state to current section & paragraph
    $('.section').each(function(i, section) {
      if (!isInTheFold(section)) { return true }
      currentAnchor = section;
      setCurrentSection(getAnchorTypeAndNumberMatches(section.id));

      $(section).children('.paragraph').each(function(ii, paragraph) {
        if (!isInTheFold(paragraph)) { return true }
        currentAnchor = paragraph;
        setCurrentParagraph(getAnchorTypeAndNumberMatches(paragraph.id).number);
      });
    });

    if (currentAnchor == null) {
      clearState();
      setCurrentChapter(1);
      setCurrentParagraph(1);
      return;
    }

    matches = getAnchorTypeAndNumberMatches(currentAnchor.id);
    replaceStateFromMatches(matches, false);
  }

  var setCurrentSection = function(anchor) {
    if (anchor.type == options.currentSection.type && anchor.number == options.currentSection.number) { return }
    options.currentSection = anchor;

    elements.sectionName.html(anchor.type.capitalize());

    if (anchor.type == 'chapter') { setCurrentChapter(anchor.number) }
    else { setCurrentChapter(1) }
  }

  var setCurrentChapter = function(chapterNumber) {
    if (chapterNumber == options.currentChapter && !options.forceChapterChange) { return }

    options.currentChapter = chapterNumber;
    options.forceChapterChange = false;

    elements.currentChapter.html(chapterNumber);
    elements.chapterSelect[0].options.selectedIndex = chapterNumber - 1;
  }

  var setCurrentParagraph = function(paragraphNumber) {
    if (paragraphNumber == options.currentParagraph && !options.forceParagraphChange) { return }

    options.currentParagraph = paragraphNumber;
    options.forceParagraphChange = false;

    elements.currentParagraph.html(paragraphNumber);
    elements.paragraphSelect[0].options.selectedIndex = paragraphNumber - 1;
  }

  var setParagraphCount = function(count) {
    if (count == null) { count = $('.paragraph').length }
    if (count == options.paragraphCount) { return }

    options.paragraphCount = count;
    setAnchorSelect('paragraph');

    elements.paragraphCount.html(count);
  }

  var setChapterCount = function(count) {
    if (count == null) { count = $('.chapter').length }
    if (count == options.chapterCount) { return }

    options.chapterCount = count;
    setAnchorSelect('chapter');
  }

  var setAnchorSelect = function(anchorType) {
    var $select, anchorCount;

    anchorCount = options[anchorType + 'Count'];
    $select = elements[anchorType + 'Select'];

    for (var i=1; i <= anchorCount; i++) {
      $select.append('<option value="' + i + '">' + i + '</option>')
    }
  }

  var onChapterSelectChange = function(e) {
    var value, paragraphNumber, $chapter, $paragraph;

    value = e.currentTarget.value;
    $chapter = $('#chapter-' + value);
    $paragraph = $chapter.children('.paragraph:first-of-type');

    paragraphNumber = getAnchorTypeAndNumberMatches($paragraph[0].id).number;
    changeSiblingAnchorSelect(elements.paragraphSelect[0], paragraphNumber, 'chapter');
  }

  var onParagraphSelectChange = function(e) {
    var value, chapterNumber, $chapter, $paragraph;

    value = e.currentTarget.value;
    $paragraph = $('#paragraph-' + value);
    $chapter = $paragraph.parent('');

    chapterNumber = getAnchorTypeAndNumberMatches($chapter[0].id).number;
    changeSiblingAnchorSelect(elements.chapterSelect[0], chapterNumber, 'paragraph');
  }

  var changeSiblingAnchorSelect = function(siblingAnchorSelect, anchorNumber, anchorType) {
    siblingAnchorSelect.options.selectedIndex = anchorNumber - 1;

    options.forceChapterChange = true;
    options.forceParagraphChange = true;

    options.lastAnchorTypeChanged = anchorType;
  }

  var onAnchorsButtonClick = function(e) {
    var anchorNumber, $select;

    $select = elements[options.lastAnchorTypeChanged + 'Select'];
    anchorNumber = $select.val();

    replaceState(options.lastAnchorTypeChanged, anchorNumber, true);
  }

return pro })();

// Singleton
window.App = new App();
