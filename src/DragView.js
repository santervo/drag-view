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
  }

  scaleIn(amount) {
    this.centerTransformOrigin()

    amount = amount || 0.25
    const scale = this.scale * (1 + amount)
    this.updateScale(scale)
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
    const contentRect = this.contentEl.getBoundingClientRect()
    this.transformOrigin = {
      x: (event.center.x - contentRect.left) / this.scaleStart,
      y: (event.center.y - contentRect.top) / this.scaleStart
    }
    this.contentEl.style.transformOrigin = this.contentEl.style.webkitTransformOrigin = this.transformOrigin.x + "px " + this.transformOrigin.y + "px"

    // Update translate so that scroll position remains same
    this.translate = this.calculateTranslate();
  }

  onPinch(event) {
    const scale = event.scale * this.scaleStart
    this.updateScale(scale)
  }

  centerTransformOrigin() {
    const transformOrigin = {
      x: ((this.el.offsetWidth / 2) + this.el.scrollLeft) / this.scale,
      y: ((this.el.offsetHeight / 2) + this.el.scrollTop) / this.scale
    }
    this.transformOrigin = transformOrigin
    this.contentEl.style.transformOrigin = this.contentEl.style.webkitTransformOrigin = this.transformOrigin.x + "px " + this.transformOrigin.y + "px"

    // Update translate so that scroll position remains same
    this.translate = this.calculateTranslate();
  }

  updateScale(scale) {
    this.scale = ensureWithinBoundaries(scale, this.minScale, this.maxScale)
    this.frame.throttle(() => { this.render() })
  }

  render() {
    // Adjust translate so that content will remain positioned at point (0,0)
    const nextTranslate = this.calculateTranslate()

    // Adjust scroll position so that view remains centered in current position
    this.el.scrollLeft = this.el.scrollLeft + (nextTranslate.x - this.translate.x)
    this.el.scrollTop = this.el.scrollTop + (nextTranslate.y - this.translate.y)

    this.translate = nextTranslate

    // Set transform (translate and scale)
    this.contentEl.style.webkitTransform = this.contentEl.style.transform = "translate("+this.translate.x+"px,"+this.translate.y+"px) scale("+this.scale+","+this.scale+")"
  }

  // Calculates how much translate we need to position content in (0,0) inside parent element
  calculateTranslate() {
    return {
      x: this.transformOrigin.x * (this.scale-1),
      y: this.transformOrigin.y * (this.scale-1)
    }
  }

  calculateAdjustedScrollPosition(nextTranslate) {
    return  {
      x: this.el.scrollLeft + (nextTranslate.x - this.translate.x),
      y: this.el.scrollTop + (nextTranslate.y - this.translate.y)
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
