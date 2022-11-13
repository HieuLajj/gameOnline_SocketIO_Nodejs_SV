const router = require("express").Router();
const userController= require("../controllers/userController");
const { isAuth } = require("../middlewares/validations/auth");
const { validateUserSignUp, userVlidation, validateUserSignIn } = require("../middlewares/validations/user");
const User =  require('../models/user');

//ADD USER
router.post("/add_user",validateUserSignUp,userVlidation,userController.add_user);

// SIGN IN
router.post('/sign_in',validateUserSignIn, userVlidation,userController.userSignIn);

//raise_win
router.post('/increasewin',isAuth, userController.increasewin);

//raise_lose
router.get('/increaselose',isAuth, userController.increaselose);
module.exports = router;