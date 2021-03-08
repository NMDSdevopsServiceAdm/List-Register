const path = require('path')
const express = require('express')
const router = express.Router()
const csv = require('fast-csv');

const data = require(path.join(__dirname, '/data', '/session-data-defaults.js'));
const staff = data.staff.flat();

router.post('/file-upload', function (req, res) {
  
})

router.get('/file-upload', function (req, res) {

})

router.get('/download/staff-contact-details', function (req, res) {
  var csvStream = csv.format({ headers: true });

  res.setHeader('Content-disposition', 'attachment; filename=staff-contact-details.csv');
  res.setHeader('Content-type', 'text/csv');

  csvStream.pipe(res);

  staff.forEach(s => csvStream.write({...s, email: ''}));

  csvStream.end();
})

router.get('/:path/:page', function (req, res) {
  res.render(`${req.params.path}/${req.params.page}`, { page: req.query.page, showBulkUpload: req.query.showBulkUpload && true })
})

module.exports = router
