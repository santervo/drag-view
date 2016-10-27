import DragView from '../src'
import $ from 'jquery'

var el = document.getElementById('container')
var dragView = new DragView(el, { scaleable: true, minScale: 0.5, maxScale: 3 })

$('button.zoom-in').click(() => {
  dragView.scaleIn()
})

$('button.zoom-out').click(() => {
  dragView.scaleOut()
})
