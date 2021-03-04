const express = require('express')
const router = express.Router()

router.get('/:path/:page', function (req, res) {
  res.render(`${req.params.path}/${req.params.page}`, { page: req.query.page })
})

module.exports = router
