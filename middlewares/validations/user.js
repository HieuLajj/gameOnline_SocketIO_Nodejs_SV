const {check,validationResult} = require('express-validator')

exports.validateUserSignUp = [
    check('name').trim().not().isEmpty().isLength({min:3, max:20}).
    withMessage('Name must be within 3 to 20 character!'),
    check('email').normalizeEmail().isEmail().withMessage('Invalid email!'),
    check('password').trim().not().isEmpty().isLength({min:6,max:20}).
    withMessage('Password must be 3 to 20 characters long!'),
];


exports.userVlidation = (req, res, next) => {
    const result = validationResult(req).array();
    if (!result.length) return next();
  
    const error = result[0].msg;
    res.json({ success: false, message: error });
  };
  
exports.validateUserSignIn = [
    check('email').trim().isEmail().withMessage('email / password is required!'),
    check('password')
      .trim()
      .not()
      .isEmpty()
      .withMessage('email / password is required!'),
  ];