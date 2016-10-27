export default class AnimationFrame {
  throttle(callback) {
    if(!this.frame) {
      this.frame = window.requestAnimationFrame(() => {
        callback()
        this.frame = null
      })
    }
  }
}
