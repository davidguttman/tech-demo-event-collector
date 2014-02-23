var hq = require('hyperquest')
var es = require('event-stream')

var url = window.location.origin + '/pageviews'

var pageviewStream = hq(url)
  .pipe(es.split())
  .pipe(es.parse())

pageviewStream.on('data', addPageview)

function addPageview (pageview) {
  var x = mapValue(pageview.duration, 0, maxDuration, 0, window.innerWidth)
  var y = mapValue(pageview.ms, 0, maxMS, window.innerHeight, 0)

  var el = document.createElement('div')
  el.style.position = 'absolute'
  el.style.left = x - dotWidth/2 + 'px'
  el.style.top = y - dotWidth/2 + 'px'
  el.style.width = dotWidth + 'px'
  el.style.height = dotWidth + 'px'
  el.style.borderRadius = dotWidth/2
  el.style.border = '1px solid'
  el.style.borderColor = pageview.advanced ? 'blue' : 'red'
  el.style.opacity = 0.50
  document.body.appendChild(el)
}