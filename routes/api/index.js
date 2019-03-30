const express = require("express");
const router = express.Router();


//@ Description     > Testing route
//@ Route           > /api/test
//@ Access Control  > Public
router.get('/', (req, res, next) => {
  console.log(`testing...`);
  return res.status(200).json({
    message: `Yay! It is working....`
  });
});


module.exports = router;