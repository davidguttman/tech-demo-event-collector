var http = require('http')
var pj = require('post-json')
var hq = require('hyperquest')
var es = require('event-stream')

var storageHosts = 
  [ 'localhost:3010'
  , 'localhost:3011'
  , 'localhost:3012'
  ]

var nUpdates = 0
var lastUpdates = 0

setInterval(function() {
  // console.log(port, nUpdates, nUpdates - lastUpdates)
  lastUpdates = nUpdates
}, 1000)

var server = http.createServer(function(req, res) {
  if (req.url === '/event') return addEvent(req, res)
  if (req.url === '/pageviews') return getPageviews(req, res)
})

function getPageviews (req, res) {
  var streams = storageHosts.map(function(host) {
    return hq('http://'+host+'/pageviews').pipe(es.split())
  })
  var tr = es.through(function(data) { this.queue(data + '\n') })
  var merged = es.merge.apply(this, streams).pipe(tr).pipe(res)
}

function addEvent (req, res) {
  var buffer = ''
  req.on('data', function(chunk) { buffer += chunk })
  
  req.on('end', function() {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('OK')
    forwardEvent(buffer)
    nUpdates += 1
  })
}

function forwardEvent (eventString) {
  try {
    var event = JSON.parse(eventString)
  } catch (err) {
    return false
  }
  
  var n = toInt(event.pageviewId)
  var iHost = n % storageHosts.length
  var host = storageHosts[iHost]
  var url = 'http://'+host+'/event'

  pj(url, event, function(err, res) {
    if (err) console.error(err)
  })
}

var port = process.env.PORT || 3000
server.listen(port)

console.log('Collector running on port:', port)

function toInt (str) {
  var d = str.substring(str.length-3)
  return parseInt(d, 16)
}