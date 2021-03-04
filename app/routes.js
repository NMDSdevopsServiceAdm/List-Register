const express = require('express')
const router = express.Router()

router.get('/enter-staff-details', function (req, res) {
    res.render('enter-staff-details', { page: req.query.page })
  })

module.exports = router
