import Hammer from 'hammerjs'

import AnimationFrame from './AnimationFrame'

const ensureWithinBoundaries = (value, min, max) => {
  value = value < min ? min : value
  value = value > max ? max : value
  return value
}

export default class DragView {
  constructor(el, opts = {}) {
    if(typeof(el.get) === 'function') {
      el = el.get(0)
    }
    this.el = el
    this.contentEl = this.el.children[0]

    this.minScale = opts.minScale || 1
    this.maxScale = opts.maxScale || 3

    this.scrollStart = null

    this.el.style.overflow = 'auto'

    // Setup hammer
    this.hammer = new Hammer(this.el);
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
    this.scrollPosition = { x: 0, y: 0 }

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
    this.scrollPosition = {
      x: this.scrollStart.x - event.deltaX,
      y: this.scrollStart.y - event.deltaY
    }

    this.requestRender()
  }

  onPanEnd() {
    this.scrollStart = null
  }

  onPinchStart(event) {
    // Record start value of scale
    this.scaleStart = this.scale

    // Update transform origin to center point of pinch
    const contentRect = this.contentEl.getBoundingClientRect()
    this.transformOrigin = {
      x: (event.center.x - contentRect.left) / this.scaleStart,
      y: (event.center.y - contentRect.top) / this.scaleStart
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
      this.setScrollPosition(this.scrollPosition)
    })
  }

  centerTransformOrigin() {
    const transformOrigin = {
      x: ((this.el.offsetWidth / 2) + this.scrollPosition.x) / this.scale,
      y: ((this.el.offsetHeight / 2) + this.scrollPosition.y) / this.scale
    }
    this.transformOrigin = transformOrigin

    // Update translate so that scroll position remains same
    this.translate = this.calculateTranslationOffset();
  }


  updateScale(scale) {
    this.scale = ensureWithinBoundaries(scale, this.minScale, this.maxScale)

    // Adjust translate so that content will remain positioned at point (0,0)
    // and scroll position so that no visible scrolling occurs because of translation change
    const translationOffset = this.calculateTranslationOffset()
    const adjustedScrollPosition = this.calculateAdjustedScrollPosition(translationOffset)

    this.translate = translationOffset
    this.scrollPosition = adjustedScrollPosition
  }

  // Calculates how much translate we need to position content in (0,0) inside parent element
  calculateTranslationOffset() {
    return {
      x: this.transformOrigin.x * (this.scale-1),
      y: this.transformOrigin.y * (this.scale-1)
    }
  }

  calculateAdjustedScrollPosition(translationOffset) {
    return  {
      x: this.scrollPosition.x + (translationOffset.x - this.translate.x),
      y: this.scrollPosition.y + (translationOffset.y - this.translate.y)
    }
  }
  // Return current {x,y} translate
  getScrollPosition() {
    return {
      x: this.el.scrollLeft,
      y: this.el.scrollTop
    }
  }

  setScrollPosition(position) {
    this.el.scrollLeft = position.x
    this.el.scrollTop = position.y
  }
}
