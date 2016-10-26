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

    this.el.css({overflow: 'auto'})

    // Prevent dragging for images
    this.el.on('dragstart', 'img', function(event) { event.preventDefault(); });

    // Setup hammer
    this.hammer = new Hammer(this.el[0]);
    this.hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    this.hammer.on("panstart", this.onPanStart.bind(this))
    this.hammer.on("pan", this.onPan.bind(this))

    // Enable scaling optionally
    if(opts.scaleable) {
      this.hammer.get('pinch').set({ enable: true })
      this.hammer.on("pinchstart", this.onPinchStart.bind(this))
      this.hammer.on("pinch", this.onPinch.bind(this))
    }
    this.setTranslate({x: 0, y: 0})
    this.setScale(1)
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

  onPinchStart(event) {
    // Record start value of scale
    this.scaleStart = this.getScale()

    // Update transform origin to center point of pinch
    const transformOrigin = {
      x: (event.center.x - event.target.x) / this.scaleStart,
      y: (event.center.y - event.target.y) / this.scaleStart
    }

    this.updateTransformOrigin(transformOrigin)
  }

  onPinch(event) {
    var scale = event.scale
    scale = scale * this.scaleStart
    this.scaleElement(scale)
    this.adjustPosition()
  }

  updateTransformOrigin(transformOrigin) {
    this.setTransformOrigin(transformOrigin)

    const translationOffset = this.calculateTranslationOffset()
    this.setTranslate(translationOffset)
  }

  adjustPosition() {
    const translationOffset = this.calculateTranslationOffset()
    const adjustedScrollPosition = this.calculateAdjustedScrollPosition(translationOffset)

    this.setTranslate(translationOffset)
    this.setScrollPosition(adjustedScrollPosition)
  }

  calculateAdjustedScrollPosition(translationOffset) {
    const translate = this.getTranslate()
    const scrollPosition = this.getScrollPosition()

    return  {
      x: scrollPosition.x + (translationOffset.x - translate.x),
      y: scrollPosition.y + (translationOffset.y - translate.y)
    }
  }

  scaleElement(scale) {
    scale = ensureWithinBoundaries(scale, this.minScale, this.maxScale)

    this.setScale(scale)
  }

  // get/set scale
  getScale() {
    return this.el.children().css('scale')
  }

  // Calculates how much translate we need to position content in (0,0) inside parent element
  calculateTranslationOffset() {
    var scale = this.getScale()
    var origin = this.getTransformOrigin()
    return {
      x: origin.x * (scale-1),
      y: origin.y * (scale-1)
    }
  }

  // Return current {x,y} transform origin
  getTransformOrigin() {
    var transformOrigin = this.el.children().css('transformOrigin')
    var parts = transformOrigin.split(" ")
    return {
      x: parseInt(parts[0]),
      y: parseInt(parts[1])
    }
  }

  setTransformOrigin(transformOrigin) {
    const transformOriginStr = transformOrigin.x + 'px ' + transformOrigin.y + 'px'
    this.el.children().css({transformOrigin: transformOriginStr})
  }

  // Return current {x,y} translate
  getTranslate() {
    var translate = this.el.children().css('translate');
    var parts

    if(typeof(translate) === 'string') {
      // Parse translate string "-123px,-61px"
      parts = translate.split(',')
      return {
        x: parseInt(parts[0]),
        y: parseInt(parts[1])
      }
    }
    else {
      return { x:0, y: 0}
    }
  }

  setTranslate(translation) {
    this.el.children().css({translate: [translation.x, translation.y]})
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
