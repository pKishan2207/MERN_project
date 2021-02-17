const express = require("express");
const router = express.Router();
const {check, validationResult} = require('express-validator');

const {signout, signin, signup, isSignedIn} = require('../controllers/auth');

router.post('/signup', [
    check("name", "Name should  be atleast 3 characters long").isLength({min: 3}),
    check("email", "Not a valid Email").isEmail(),
    check("password", "Password should  be atleast 3 characters long").isLength({min: 3})
], signup);

router.post('/signin', [
    check("email", "Not a valid Email").isEmail(),
    check("password", "Password is required").isLength({min: 1})
], signin);

router.get('/signout', signout);

router.get('/testroute', isSignedIn, (req, res) => {
    res.send("isSignedIn - a protected route.")
});



module.exports = router;