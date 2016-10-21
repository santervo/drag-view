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
    this.parentEl = this.el.parent()

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
      this.hammer.get('pinch').set({ enable: true })
      this.hammer.on("pinchstart", this.onPinchStart.bind(this))
      this.hammer.on("pinch", this.onPinch.bind(this))
    }

    // IMPORTANT: initialize with zero translate and 1 scale. The order of these
    // is important, and affects the CSS transformation
    this.setTranslate({x: 0, y: 0})
    this.setScale(1)
  }

  // Function that stores the translate value at the start of pan event
  onPanStart() {
    this.translationStart = this.getTranslate()
  }

  onPan(event) {
    var translation = {
      x: event.deltaX + this.translationStart.x,
      y: event.deltaY + this.translationStart.y
    }
    this.translateElement(translation)
  }

  onPinchStart() {
    this.scaleStart = this.getScale()
  }

  onPinch(event) {
    var scale = event.scale
    scale = scale * this.scaleStart
    this.scaleElement(scale)
  }

  translateElement(translation) {
    var boundaries = this.calculateTranslationBoundaries()
    translation.x = ensureWithinBoundaries(translation.x, boundaries.xMin, boundaries.xMax)
    translation.y = ensureWithinBoundaries(translation.y, boundaries.yMin, boundaries.yMax)

    this.setTranslate(translation)
  }

  scaleElement(scale) {
    scale = ensureWithinBoundaries(scale, this.minScale, this.maxScale)

    this.setScale(scale)

    // Updates translation so that it keeps within boundaries
    this.translateElement(this.getTranslate())
  }

  // Calculates boundaries for translation so that it's outer edges will align with container borders
  calculateTranslationBoundaries() {
    var scale = this.getScale()
    var transformOffsets = this.calculateTranslationOffsets()
    var container = this.getContainerDimensions()
    var content = this.getContentDimensions()

    return {
      xMin: (container.width - content.width * scale) - transformOffsets.x,
      yMin: (container.height - content.height * scale) - transformOffsets.y,
      xMax: 0 - transformOffsets.x,
      yMax: 0 - transformOffsets.y
    }
  }

  // Calculates how much we need to take account offset generated by transform origin setting
  calculateTranslationOffsets() {
    var scale = this.getScale()
    var origin = this.getTransformOrigin()
    return {
      x: (origin.x - (origin.x * scale)),
      y: (origin.y - (origin.y * scale))
    }
  }

  // get/set scale
  getScale() {
    return this.el.css('scale')
  }

  setScale(scale) {
    this.el.css({scale: scale})
  }

  // Return current {x,y} transform origin
  getTransformOrigin() {
    var transformOrigin = this.el.css('transformOrigin')
    var parts = transformOrigin.split(" ")
    return {
      x: parseInt(parts[0]),
      y: parseInt(parts[1])
    }
  }

  // Return current {x,y} translate
  getTranslate() {
    var translate = this.el.css('translate');
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
    this.el.css({translate: [translation.x, translation.y]})
  }

  getContainerDimensions() {
    return {
      width: this.parentEl.width(),
      height: this.parentEl.height()
    }
  }

  getContentDimensions() {
    return {
      width: this.el[0].scrollWidth,
      height: this.el[0].scrollHeight
    }
  }
}
