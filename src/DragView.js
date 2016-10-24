import $ from 'jquery'
import Hammer from 'hammerjs'
import 'jquery.transit'

const ensureWithinBoundaries = (value, min, max) => {
  value = value < min ? min : value
  value = value > max ? max : value
  return value
}

export default class DragView {
  constructor(selector, opts = {}) {
    this.el = $(selector)

    this.minScale = opts.minScale || 1
    this.maxScale = opts.maxScale || 3

    // Prevent dragging for images
    this.el.on('dragstart', 'img', function(event) { event.preventDefault(); });

    // Setup hammer
    this.hammer = new Hammer(this.el[0]);
    this.hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    this.hammer.on("panstart", this.onPanStart.bind(this))
    this.hammer.on("pan", this.onPan.bind(this))

    // Enable scaling optionally
    if(opts.scaleable) {
      // Set transform origin so full scaled content will be scaleable
      this.el.children().css({transformOrigin: "0 0"})
      this.hammer.get('pinch').set({ enable: true })
      this.hammer.on("pinchstart", this.onPinchStart.bind(this))
      this.hammer.on("pinch", this.onPinch.bind(this))
    }
  }

  // Function that stores the scroll position at the start of pan event
  onPanStart() {
    this.scrollStart = this.getScrollPosition()
  }

  onPan(event) {
    var position = {
      x: this.scrollStart.x - event.deltaX,
      y: this.scrollStart.y - event.deltaY
    }
    this.setScrollPosition(position)
  }

  onPinchStart() {
    this.scaleStart = this.getScale()
  }

  onPinch(event) {
    var scale = event.scale
    scale = scale * this.scaleStart
    this.scaleElement(scale)

    // Update scroll position so that we don't go over boundary
    this.setScrollPosition(this.getScrollPosition())
  }

  scaleElement(scale) {
    scale = ensureWithinBoundaries(scale, this.minScale, this.maxScale)

    this.setScale(scale)
  }

  // get/set scale
  getScale() {
    return this.el.children().css('scale')
  }

  setScale(scale) {
    this.el.children().css({scale: scale})
  }

  // Return current {x,y} translate
  getScrollPosition() {
    return {
      x: this.el.scrollLeft(),
      y: this.el.scrollTop()
    }
  }

  setScrollPosition(position) {
    this.el.scrollLeft(position.x)
    this.el.scrollTop(position.y)
  }
}
