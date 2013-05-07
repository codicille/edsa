//= require_tree ./ext
//= require_self

// Global variables & cached elements
var $body, $window, defaultTitle, currentState;

$body = $('body');
$window = $(window);

defaultTitle = document.title;
currentState = null;
advancedMenusOpened = false;
currentScrollTop = 0;

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
    if (scrollDifference > 100) { hideAdvancedMenus() }
  }

  // Change history state to current chapter & paragraph
  $('.chapter').each(function(i, chapter) {
    if (!isInTheFold(chapter)) { return true }
    currentAnchor = chapter;

    $(chapter).children('.paragraph').each(function(ii, paragraph) {
      if (!isInTheFold(paragraph)) { return true }
      currentAnchor = paragraph;
    });
  });

  if (currentAnchor == null) {
    clearState();
    return;
  }

  matches = getAnchorTypeAndNumberMatches(currentAnchor.id);
  replaceStateFromMatches(matches, false);
}

// Events
$('.paragraph-count').on('click', onParagraphCountClick);
$window.on('scroll', onWindowScroll);
$window.on('resize', onWindowScroll);

// Onload
gotoCurrentAnchor();
