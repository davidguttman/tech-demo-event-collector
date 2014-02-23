var hq = require('hyperquest')
var es = require('event-stream')
var moment = require('moment')

var baseUrl = window.location.origin

var rs = hq(baseUrl + '/pageviews').pipe(es.split()).pipe(es.parse())

var dotWidth = 6

var maxDuration = 10 * 60 * 1000
var maxMS = 24 * 3600 * 1000

var count = 0
rs.on('data', function(pv) {
  count += 1
  // if (count > 100) {return}
  if (pv.duration && pv.ts) {
    pv.duration = pv.duration > maxDuration ? maxDuration : pv.duration
    pv.ms = dayMs(pv.ts)
    addPageview(pv)
  }
})

rs.on('end', function() {
  console.log('count', count);
})

var locationInfo = document.createElement('div')
window.document.body.appendChild(locationInfo)
locationInfo.style.position = 'absolute'
locationInfo.style.background = 'rgba(255,255,255,0.80)'
locationInfo.style.padding = 5 + 'px'
locationInfo.style.zIndex = 200

window.document.addEventListener('mousemove', function(evt) {
  console.log('evt', evt);
  locationInfo.style.left = evt.clientX + 20 + 'px'
  locationInfo.style.top = evt.clientY + 20 + 'px'
  var durationVal = mapValue(evt.clientX, 0, window.innerWidth, 0, maxDuration)
  var timeVal = mapValue(evt.clientY, 0, window.innerHeight, 0, maxMS)
  
  var duration = moment(durationVal).format('mm:ss:SS')
  var time = moment(timeVal).add('hours', 8).format('h:mm:ss a')

  locationInfo.innerHTML = 'Duration: ' + duration + '<br/>Time: ' + time 
})

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

function mapValue (val, fromMin, fromMax, toMin, toMax) {
  var fromRange = fromMax - fromMin
  var fromNorm = (val - fromMin) / fromRange
  var toRange = toMax - toMin
  var toVal = (fromNorm * toRange) + toMin
  return toVal
}

function dayMs (date) {
  var d = new Date(date)
  var ms = d - new Date(d.toISOString().substring(0,10))
  return ms
}