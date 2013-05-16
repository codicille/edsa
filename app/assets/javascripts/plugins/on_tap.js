$.fn.onTap = function(callback) {
  if (window.ontouchend !== void 0) {
    // Init touchMoveCount
    this.each(function() {
      this._touchMoveCount = 0
    });

    // Count touch moves
    this.on('touchmove', function() {
      this._touchMoveCount++;
    });

    // callback() if touchMoveCount is < 3
    this.on('touchend', function(e) {
      if (this._touchMoveCount < 3) { callback.call(this, e) }
      this._touchMoveCount = 0;
    });

    // Cancel click event
    this.on('click', function() {
      return false;
    });
  }
}
