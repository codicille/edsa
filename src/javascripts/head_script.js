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