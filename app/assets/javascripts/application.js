//= require_tree ./ext
//= require_self

// Global variables & cached elements
var $body, $window, $currentChapter, $currentParagraph, $paragraphCount, $chapterSelect, $paragraphSelect,
    defaultTitle, currentState, advancedMenusOpened, currentScrollTop, currentChapter, currentParagraph,
    paragraphCount, chapterCount;

$body = $('body');
$window = $(window);

$currentChapter = $('[data-hook="current-chapter"]');
$currentParagraph = $('[data-hook="current-paragraph"]');
$paragraphCount = $('[data-hook="paragraph-count"]');
$chapterSelect = $('select[name="chapter"]')
$paragraphSelect = $('select[name="paragraph"]')

defaultTitle = document.title;
currentState = null;
advancedMenusOpened = false;
currentScrollTop = 0;
currentChapter = 1;
currentParagraph = 1;
paragraphCount = 1;
chapterCount = 1;

// Advanced menus
showAdvancedMenus = function() {
  if (advancedMenusOpened) { return }
  advancedMenusOpened = true;
  currentScrollTop = getScrollTop();

  $body.addClass('show-advanced-menus');
}

hideAdvancedMenus = function() {
  if (!advancedMenusOpened) { return }
  advancedMenusOpened = false;

  $body.removeClass('show-advanced-menus');
}

getScrollTop = function() {
  return window.pageYOffset || (typeof $window.scrollTop === "function" ? $window.scrollTop() : 0);
}

// History replace state
getAnchorTypeAndNumberMatches = function(string) {
  var matches = string.match(/(paragraph|chapter)(-|\/)([0-9]+)/);
  if (matches == null) { return null }

  return { type: matches[1], number: matches[3] }
}

gotoAnchor = function(anchorType, anchorNumber) {
  var id, $elem, offset;

  id = '#' + anchorType + '-' + anchorNumber;
  $elem = $(id);
  offset = $elem.offset().top;

  $window.scrollTop(offset);
  document.title = defaultTitle + ' | ' + anchorType.capitalize() + ' ' + anchorNumber;
}

gotoAnchorFromMatches = function(matches) {
  if (matches == null) { return }
  gotoAnchor(matches.type, matches.number);
}

gotoCurrentAnchor = function() {
  var currentHref, matches;

  currentHref = window.location.href;
  matches = getAnchorTypeAndNumberMatches(currentHref);

  if (matches == null) { return }

  gotoAnchorFromMatches(matches);
}

replaceState = function(anchorType, anchorNumber, scrollToAnchor) {
  if (currentState && currentState.type == anchorType && currentState.number == anchorNumber) { return }

  var state, title, url;
  if (scrollToAnchor == null) { scrollToAnchor = false }

  state = { type: anchorType, number: anchorNumber };
  title = defaultTitle + ' | ' + anchorType.capitalize() + ' ' + anchorNumber;
  url = '/' + anchorType + '/' + anchorNumber;

  history.replaceState(state, title, url);
  currentState = state;

  if (scrollToAnchor) {
    gotoAnchor(anchorType, anchorNumber);
  } else {
    document.title = title;
  }
}

replaceStateFromMatches = function(matches, scrollToAnchor) {
  if (matches == null) { return }
  replaceState(matches.type, matches.number, scrollToAnchor);
}

clearState = function() {
  if (currentState == null) { return }
  currentState = null;

  var state, title, url;

  state = {};
  title = defaultTitle;
  url = '/';

  history.replaceState(state, title, url);
  document.title = title;
}

isInTheFold = function(elem) {
  var rect = elem.getBoundingClientRect();
  if (rect.top <= 0 && rect.bottom > 0) { return true }
  return false;
}

onParagraphCountClick = function(e) {
  e.preventDefault();

  var matches = getAnchorTypeAndNumberMatches(this.getAttribute('href'));
  replaceStateFromMatches(matches, true);
}

onWindowScroll = function(e) {
  var scrollTop, scrollDifference, currentAnchor;

  scrollTop = getScrollTop();
  currentAnchor = null;

  // Close advanced menus
  if (advancedMenusOpened) {
    scrollDifference = Math.abs(scrollTop - currentScrollTop);
    if (scrollDifference > 200) { hideAdvancedMenus() }
  }

  // Change history state to current chapter & paragraph
  $('.chapter').each(function(i, chapter) {
    if (!isInTheFold(chapter)) { return true }
    currentAnchor = chapter;
    setCurrentChapter(getAnchorTypeAndNumberMatches(chapter.id).number);

    $(chapter).children('.paragraph').each(function(ii, paragraph) {
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

setCurrentChapter = function(chapterNumber) {
  if (chapterNumber == currentChapter) { return }

  currentChapter = chapterNumber;
  $currentChapter.html(chapterNumber);

  $chapterSelect[0].options.selectedIndex = chapterNumber - 1;
}

setCurrentParagraph = function(paragraphNumber) {
  if (paragraphNumber == currentParagraph) { return }

  currentParagraph = paragraphNumber;
  $currentParagraph.html(paragraphNumber);

  $paragraphSelect[0].options.selectedIndex = paragraphNumber - 1;
}

setParagraphCount = function(count) {
  if (count == null) { count = $('.paragraph').length }
  if (count == paragraphCount) { return }

  paragraphCount = count;
  setAnchorSelect('paragraph');

  $paragraphCount.html(count);
}

setChapterCount = function(count) {
  if (count == null) { count = $('.chapter').length }
  if (count == chapterCount) { return }

  chapterCount = count;
  setAnchorSelect('chapter');
}

setAnchorSelect = function(anchorType) {
  var $select, anchorCount;

  anchorCount = this[anchorType + 'Count'];
  $select = this['$' + anchorType + 'Select'];

  for (var i=1; i <= anchorCount; i++) {
    $select.append('<option value="' + i + '">' + i + '</option>')
  }
}

// Events
$('.paragraph-count').on('click', onParagraphCountClick);
$window.on('scroll', onWindowScroll);
$window.on('resize', onWindowScroll);

// Onload
gotoCurrentAnchor();
setParagraphCount();
setChapterCount();
