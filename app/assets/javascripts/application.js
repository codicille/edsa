//= require_tree ./ext
//= require_self

// Cached elements
var $body, $window, defaultTitle;

$body = $('body');
$window = $(window);
defaultTitle = document.title;

// Advanced menus
showAdvancedMenus = function() {
  $body.addClass('show-advanced-menus');
  initScroll();
}

hideAdvancedMenus = function() {
  $body.removeClass('show-advanced-menus');
  stopScroll();
}

getScrollTop = function() {
  return window.pageYOffset || (typeof $window.scrollTop === "function" ? $window.scrollTop() : 0);
}

stopScroll = function(e) { $window.off('scroll') }
initScroll = function(e) {
  var initialScrollTop = getScrollTop();

  $window.on('scroll', function(e) {
    var scrollTop, difference;

    scrollTop = getScrollTop();
    difference = Math.abs(scrollTop - initialScrollTop);

    if (difference > 100) { hideAdvancedMenus() }
  })
}

// History replace state
getAnchorTypeAndNumberMatches = function(url) {
  return url.match(/(paragraph|chapter)(-|\/)([0-9]+)/);
}

gotoAnchor = function(anchorType, anchorNumber) {
  var id, $elem, offset;

  id = '#' + anchorType + '-' + anchorNumber
  $elem = $(id)
  offset = $elem.offset().top

  $window.scrollTop(offset)
  document.title = defaultTitle + ' | ' + anchorType.capitalize() + ' ' + anchorNumber;
}

$('.paragraph-count').on('click', function(e) {
  var matches, anchorType, anchorNumber, state, title, url;
  e.preventDefault();

  matches = getAnchorTypeAndNumberMatches(this.getAttribute('href'));
  anchorType = matches[1];
  anchorNumber = matches[3];

  state = {};
  title = defaultTitle + ' - ' + anchorType.capitalize() + ' ' + anchorNumber;
  url = '/' + anchorType + '/' + anchorNumber;

  history.replaceState(state, title, url)
  gotoAnchor(anchorType, anchorNumber)
})

initCurrentAnchor = function() {
  var currentHref, matches;

  currentHref = window.location.href;
  matches = getAnchorTypeAndNumberMatches(currentHref);

  if (matches == null) { return }

  anchorType = matches[1];
  anchorNumber = matches[3];

  gotoAnchor(anchorType, anchorNumber);
}

initCurrentAnchor()
