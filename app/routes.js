const path = require('path')
const express = require('express')
const url = require('url');
const router = express.Router()
const NotifyClient = require('notifications-node-client').NotifyClient;
const notify = new NotifyClient(process.env.NOTIFYAPIKEY);
const csv = require('fast-csv');
const data = require(path.join(__dirname, '/data', '/session-data-defaults.js'));
const staff = data.staff.flat();

/*router.get('/employee/:page', function (req, res) {
  const version = req.query.version;
  const figma = req.query.figma;
  const email = req.query.email ?? 'name@email.com';
  let path = `employee/${req.params.page}`;
  if (req.params.page === 'start' && version === 'a') {
    path += '-version-a';
  }
  if (req.params.page === 'how-to-contact-you' && req.session.data.version === 'b') {
    path += '-version-b';
  }
  res.render(path, { version, figma, email })
});*/

router.get('/employee/start', function (req, res) {
  req.session.data = {};
  const version = req.query.version;
  const figma = req.query.figma;
  const email = req.query.email ?? 'name@email.com';
  let path = 'employee/start';
  if (version === 'a') {
    path += '-version-a';
  }
  res.render(path, { version, figma, email })
});

router.get('/employee/how-to-contact-you', function (req, res) {
  let path = 'employee/how-to-contact-you';
  if (req.session.data.version === 'b') {
    path += '-version-b';
  }
  res.render(path)
});

router.post('/employee/start', function (req, res) {
  res.redirect('/employee/add-your-details');
});

router.post('/employee/add-your-details', function (req, res) {
  res.redirect('/employee/how-to-contact-you');
});

router.post('/employee/how-to-contact-you', function (req, res) {
  if (req.body.version === 'a') {
    res.redirect('/employee/your-employer-details');
  } else {
    res.redirect('/employee/confirm-your-details');
  }
});

router.post('/employee/your-employer-details', function (req, res) {
  res.redirect('/employee/confirm-your-details');
});

router.post('/employee/confirm-your-details', function (req, res) {
  res.redirect('/employee/thank-you');
});

router.post('/gov/start', function (req, res) {
  redirect(req, res, 'gov');
});

router.post('/sfc/start', function (req, res) {
  redirect(req, res, 'sfc');
});

function redirect(req, res, path) {
  const choice = req.body['how-to-enter-staff-details'];
  if (choice === 'manually') {
    res.redirect(url.format({
      pathname: `/${path}/enter-staff-details`,
      query: req.query
    }));
  } else if (choice === 'bulk-upload') {
    res.redirect(`/${path}/bulk-upload?back=/${path}/start`);
  } else {
    res.status(400).send();
  }
}

router.get('/gov/:page', function (req, res) {
  const showB = req.query.version === 'b';
  res.render(`gov/${req.params.page}`, { page: req.query.page, showBulkUpload: req.query.showBulkUpload && true, query: req.query, showB, back: req.query.back })
});

router.get('/sfc/:page', function (req, res) {
  const showB = req.query.version === 'b';
  res.render(`sfc/${req.params.page}`, { page: req.query.page, showBulkUpload: req.query.showBulkUpload && true, query: req.query, showB, back: req.query.back })
});

router.get('/download/staff-contact-details', function (req, res) {
  var csvStream = csv.format();

  res.setHeader('Content-disposition', 'attachment; filename=staff-contact-details.csv');
  res.setHeader('Content-type', 'text/csv');

  csvStream.pipe(res);

  csvStream.write(['Name', 'Job role', 'Email address or mobile phone number']);
  staff.forEach(s => csvStream.write([s.name, s.title, '']));

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
