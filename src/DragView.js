import $ from 'jquery'
import Hammer from 'hammerjs'
import 'jquery.transit'

import AnimationFrame from './AnimationFrame'
import StyleSheet from './StyleSheet'

const ensureWithinBoundaries = (value, min, max) => {
  value = value < min ? min : value
  value = value > max ? max : value
  return value
}

export default class DragView {
  constructor(selector, opts = {}) {
    this.el = $(selector)
    this.content = this.el.children()

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

    this.style = new StyleSheet(this.content)
    this.style.setTranslate({x: 0, y: 0})
    this.style.setScale(1)

    this.frame = new AnimationFrame()
  }

  scaleIn(amount) {
    this.centerTransformOrigin()

    amount = amount || 0.25
    const scale = this.style.getScale() * 1 - amount
    this.updateScale(scale)
  }

  scaleOut(amount) {
    this.centerTransformOrigin()

    amount = amount || 0.25
    const scale = this.style.getScale() * 1 + amount
    this.updateScale(scale)
  }

  getScale() {
    this.style.getScale()
  }

  centerTransformOrigin() {
    const scale = this.style.getScale()
    const contentPosition = this.content.position()
    const transformOrigin = {
      x: ((this.el.width() / 2) - contentPosition.left) / scale,
      y: ((this.el.height() / 2) - contentPosition.top) / scale
    }
    this.style.setTransformOrigin(transformOrigin)

    // Update translate so that scroll position remains same
    this.style.setTranslate(this.calculateTranslationOffset())
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
    const position = {
      x: this.scrollStart.x - event.deltaX,
      y: this.scrollStart.y - event.deltaY
    }
    this.setScrollPosition(position)
  }

  onPanEnd() {
    this.scrollStart = null
  }

  onPinchStart(event) {
    // Record start value of scale
    this.scaleStart = this.style.getScale()

    // Update transform origin to center point of pinch
    const position = this.content.offset()
    const transformOrigin = {
      x: (event.center.x - position.left) / this.scaleStart,
      y: (event.center.y - position.top) / this.scaleStart
    }
    this.style.setTransformOrigin(transformOrigin)

    // Update translate so that scroll position remains same
    this.style.setTranslate(this.calculateTranslationOffset())
  }

  onPinch(event) {
    const scale = event.scale * this.scaleStart
    this.frame.throttle(() => {
      this.updateScale(scale)
    })
  }

  calculateAdjustedScrollPosition(translationOffset) {
    const translate = this.style.getTranslate()
    const scrollPosition = this.getScrollPosition()

    return  {
      x: scrollPosition.x + (translationOffset.x - translate.x),
      y: scrollPosition.y + (translationOffset.y - translate.y)
    }
  }

  updateScale(scale) {
    scale = ensureWithinBoundaries(scale, this.minScale, this.maxScale)
    this.style.setScale(scale)

    // Adjust translate so that content will remain positioned at point (0,0)
    // and scroll position so that no visible scrolling occurs because of translation change
    const translationOffset = this.calculateTranslationOffset()
    const adjustedScrollPosition = this.calculateAdjustedScrollPosition(translationOffset)

    this.style.setTranslate(translationOffset)
    this.setScrollPosition(adjustedScrollPosition)
  }

  // Calculates how much translate we need to position content in (0,0) inside parent element
  calculateTranslationOffset() {
    const scale = this.style.getScale()
    const origin = this.style.getTransformOrigin()
    return {
      x: origin.x * (scale-1),
      y: origin.y * (scale-1)
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
