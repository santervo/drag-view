# drag-view

DragView makes an element scrollable and scaleable with touch/mouse gestures within it's parent container,
ensuring that it will remain bounded by it's containers edges.

## Installation

Install drag-view and jquery to your project. JQuery is required but it's marked as peer dependency.

```
npm install --save drag-view jquery
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
