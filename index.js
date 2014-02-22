var http = require('http')
var pj = require('post-json')

var storageHosts = 
  [ 'localhost:3010'
  , 'localhost:3011'
  , 'localhost:3012'
  ]

var server = http.createServer(function(req, res) {
  var buffer = ''
  req.on('data', function(chunk) { buffer += chunk })
  
  req.on('end', function() {
    forwardEvent(buffer)
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('OK')
  })
})

function forwardEvent (eventString) {
  var event = JSON.parse(eventString)
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
  var d = str.substring(str.length-1)
  return parseInt(d, 16)
}