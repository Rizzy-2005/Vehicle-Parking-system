const express = require("express");
const router = express.Router();

router.get("/",(req,res) => {
  console.log(req.session.attendant_id);
});

module.exports = router;