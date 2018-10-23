var express = require('express')
  , router = express.Router()
  
router.use('/', require('./routes/index'));
router.use('/dashboard', require('./routes/dashboard'));
router.use('/entry', require('./routes/entry'));
router.use('/entry/month-config', require('./routes/month-config'));
router.use('/subgroup', require('./routes/subgroup'));
router.use('/user', require('./routes/user'));


router.get('/about', function(req, res) {
  res.send('Learn about us')
})

module.exports = router