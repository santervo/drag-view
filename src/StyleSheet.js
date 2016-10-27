import $ from 'jquery'

// Class for parsing/setting style values on element
export default class StyleSheet {
  constructor(el) {
    this.el = $(el)
  }

  // Return current {x,y} transform origin
  getTransformOrigin() {
    const transformOrigin = this.el.css('transformOrigin')
    const parts = transformOrigin.split(" ")
    return {
      x: parseInt(parts[0]),
      y: parseInt(parts[1])
    }
  }

  setTransformOrigin(transformOrigin, unit) {
    unit = unit || 'px'
    const transformOriginStr = transformOrigin.x + unit + ' ' + transformOrigin.y + unit
    this.el.css({transformOrigin: transformOriginStr})
  }

  // Return current {x,y} translate
  getTranslate() {
    const translate = this.el.css('translate');

    if(typeof(translate) === 'string') {
      // Parse translate string "-123px,-61px"
      const parts = translate.split(',')
      return {
        x: parseInt(parts[0]),
        y: parseInt(parts[1])
      }
    }
    else {
      return { x:0, y: 0}
    }
  }

  setTranslate(point) {
    this.el.css({translate: [point.x, point.y]})
  }

  // get/set scale
  getScale() {
    return this.el.css('scale')
  }

  setScale(scale) {
    this.el.css({scale: scale})
  }

}
