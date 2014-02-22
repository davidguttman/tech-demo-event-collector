var pj = require('post-json')

var data = {pageviewId: 'pv_00286731-a514-492b-882c-d797175362fd'}

pj('http://localhost:3000', data, function(err, res) {
  if (err) console.error(err)

  console.log('res', res.body);
})