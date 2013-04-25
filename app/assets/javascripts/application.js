// Cached elements
var $body, $window;

$body = $('body');
$window = $(window);

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
