import $ from 'jquery'
import Hammer from 'hammerjs'

import AnimationFrame from './AnimationFrame'

const ensureWithinBoundaries = (value, min, max) => {
  value = value < min ? min : value
  value = value > max ? max : value
  return value
}

export default class DragView {
  constructor(selector, opts = {}) {
    this.el = $(selector)
    this.content = this.el.children()
    this.contentEl = this.content[0]

    this.minScale = opts.minScale || 1
    this.maxScale = opts.maxScale || 3

    this.scrollStart = null

    this.el.css({overflow: 'auto'})

    // Prevent dragging for images
    this.el.on('dragstart', 'img', function(event) { event.preventDefault(); });

    // Setup hammer
    this.hammer = new Hammer(this.el[0]);
    this.hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    this.hammer.on("panstart", this.onPanStart.bind(this))
    this.hammer.on("pan", this.onPan.bind(this))
    this.hammer.on("panend", this.onPanEnd.bind(this))

    // Enable scaling optionally
    if(opts.scaleable) {
      this.hammer.get('pinch').set({ enable: true })
      this.hammer.on("pinchstart", this.onPinchStart.bind(this))
      this.hammer.on("pinch", this.onPinch.bind(this))
    }

    this.scale = 1
    this.translate = {x: 0, y: 0 }
    this.transformOrigin = { x:0, y: 0 }

    this.frame = new AnimationFrame()
  }

  getScale() {
    return this.scale
  }

  scaleOut(amount) {
    this.centerTransformOrigin()

    amount = amount || 0.25
    const scale = this.scale * (1 - amount)
    this.updateScale(scale)

    this.requestRender();
  }

  scaleIn(amount) {
    this.centerTransformOrigin()

    amount = amount || 0.25
    const scale = this.scale * (1 + amount)
    this.updateScale(scale)

    this.requestRender();
  }

  // Function that stores the scroll position at the start of pan event
  onPanStart() {
    this.scrollStart = this.getScrollPosition()
  }

  onPan(event) {
    if(this.scrollStart === null) {
      return
    }
    // Calculate scroll position from scroll start
    const scrollPosition = {
      x: this.scrollStart.x - event.deltaX,
      y: this.scrollStart.y - event.deltaY
    }

    this.setScrollPosition(scrollPosition)
  }

  onPanEnd() {
    this.scrollStart = null
  }

  onPinchStart(event) {
    // Record start value of scale
    this.scaleStart = this.scale

    // Update transform origin to center point of pinch
    const position = this.content.offset()
    this.transformOrigin = {
      x: (event.center.x - position.left) / this.scaleStart,
      y: (event.center.y - position.top) / this.scaleStart
    }

    // Update translate so that scroll position remains same
    this.translate = this.calculateTranslationOffset();
  }

  onPinch(event) {
    const scale = event.scale * this.scaleStart

    this.updateScale(scale)

    this.requestRender();
  }

  requestRender() {
    this.frame.throttle(() => {
      this.contentEl.style.transformOrigin = this.contentEl.style.webkitTransformOrigin = this.transformOrigin.x + "px " + this.transformOrigin.y + "px"
      this.contentEl.style.webkitTransform = this.contentEl.style.transform = "translate("+this.translate.x+"px,"+this.translate.y+"px) scale("+this.scale+","+this.scale+")"
    })
  }

  centerTransformOrigin() {
    const contentPosition = this.content.position()
    const transformOrigin = {
      x: ((this.el.width() / 2) - contentPosition.left) / this.scale,
      y: ((this.el.height() / 2) - contentPosition.top) / this.scale
    }
    this.transformOrigin = transformOrigin

    // Update translate so that scroll position remains same
    this.translate = this.calculateTranslationOffset();
  }

  calculateAdjustedScrollPosition(translationOffset) {
    const scrollPosition = this.getScrollPosition()

    return  {
      x: scrollPosition.x + (translationOffset.x - this.translate.x),
      y: scrollPosition.y + (translationOffset.y - this.translate.y)
    }
  }

  updateScale(scale) {
    this.scale = ensureWithinBoundaries(scale, this.minScale, this.maxScale)

    // Adjust translate so that content will remain positioned at point (0,0)
    // and scroll position so that no visible scrolling occurs because of translation change
    const translationOffset = this.calculateTranslationOffset()
    const adjustedScrollPosition = this.calculateAdjustedScrollPosition(translationOffset)

    this.translate = translationOffset
    this.setScrollPosition(adjustedScrollPosition)
  }

  // Calculates how much translate we need to position content in (0,0) inside parent element
  calculateTranslationOffset() {
    return {
      x: this.transformOrigin.x * (this.scale-1),
      y: this.transformOrigin.y * (this.scale-1)
    }
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
