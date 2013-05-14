var ReadabilitySettings = function() { this.initialize.apply(this, arguments) };
ReadabilitySettings.prototype = (function() { var pro = {};

  // Global variables
  var options = {
    submenuOpened: false
  }

  // jQuery cached elements
  var elements = {
    container: $('.readability-settings-container')
  }

  // Public scope --------------------------------------------------------------
  pro.initialize = function(args) {
    initContrastSlider();
  }

  pro.toggleSubmenu = function() {
    options.submenuOpened ? closeSubmenu() : openSubmenu();
  }

  // Private scope -------------------------------------------------------------
  var openSubmenu = function() {
    if (options.submenuOpened) { return }
    options.submenuOpened = true;

    elements.container.addClass('show-submenu');
  }

  var closeSubmenu = function() {
    if (!options.submenuOpened) { return }
    options.submenuOpened = false;

    elements.container.removeClass('show-submenu');
  }

  var initContrastSlider = function() {
    $(".slider-container .slider").slider({
      value: 1,
      min: 1,
      max: 5,
      step: 1,
      slide: function(e, ui) {
        // console.log(ui.value);
      }
    })
  }

return pro })();

// Singleton
window.ReadabilitySettings = new ReadabilitySettings();
