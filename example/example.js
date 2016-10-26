import DragView from '../src'

var el = document.getElementById('container')

new DragView(el, { scaleable: true, minScale: 0.5, maxScale: 3 })
