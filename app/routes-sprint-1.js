const path = require('path')
const express = require('express')
const router = express.Router()
const NotifyClient = require('notifications-node-client').NotifyClient;
const notify = new NotifyClient(process.env.NOTIFYAPIKEY);
const csv = require('fast-csv');
const data = require(path.join(__dirname, '/data', '/session-data-defaults.js'));
const staff = data.staff.flat();
const prefix = 'sprint-1'

router.get('/gov/:page', function (req, res) {
  res.render(`${prefix}/gov/${req.params.page}`, { page: req.query.page, showBulkUpload: req.query.showBulkUpload && true, query: req.query })
});

router.get('/sfc/:page', function (req, res) {
  console.log(__dirname);
  res.render(`${prefix}/sfc/${req.params.page}`, { page: req.query.page, showBulkUpload: req.query.showBulkUpload && true, query: req.query })
});

router.get('/download/staff-contact-details', function (req, res) {
  var csvStream = csv.format({ headers: true });

  res.setHeader('Content-disposition', 'attachment; filename=staff-contact-details.csv');
  res.setHeader('Content-type', 'text/csv');

  csvStream.pipe(res);

  staff.forEach(s => csvStream.write({...s, email: ''}));

  csvStream.end();
});

router.post('/email/invite', async function (req, res) {
  try {
    const sfc = req.body.sfc == 'true';
    await notify.sendEmail('a111f463-05fb-4e1f-aec1-9532eff41cc4', req.body.email, {
      personalisation: {
        name: req.body.name,
        sfc: sfc ? 'yes' : 'no',
        gov: sfc ? 'no' : 'yes'
      }
    });
  }
  catch (ex) {}
  finally
  {
    res.send();
  }
});

module.exports = router
