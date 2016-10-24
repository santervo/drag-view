# drag-view

DragView makes an element scrollable and scaleable with touch/mouse gestures within it's parent container,
ensuring that it will remain bounded by it's containers edges.

## Installation

```
npm install --save drag-view
```

## Usage

```
var DragView = require('drag-view')

var el = document.getElementById('view')

new DragView(el, { scaleable: true })
```

## Development

Start webpack dev server serving the example code in http://localhost:8080 with

```
npm start
```
