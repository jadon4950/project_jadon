const router = require('express').Router();
const userController = require('../controllers/controller');

router.post('/signUp', userController.signUp);
router.post('/signUpLink', userController.signUpLink);
router.put('/resendOtp', userController.resendOtp);
router.put('/otpVerify', userController.otpVerify);
router.put('/forgotPassword', userController.forgotPassword);
router.put('/resetPassword', userController.resetPassword);
router.put('/resetPass', userController.resetPass);
router.get('/emailVerify/:_id', userController.emailVerify);
router.put('/userLogin', userController.userLogin);
router.post('/Authentication', userController.Authentication);
router.put('/login', userController.login);
router.put('/login2FA', userController.login2FA);
router.get('/userList', userController.userList);
router.get('/viewUserContent/:_id', userController.viewUserContent);
router.put('/editProfile', userController.editProfile);


module.exports = router;


// {
//     "firstName" : "shubham",
//     "lastName":"jadon",
//     "email": "4@gmail.com",
//     "mobileNumber":"4665",
//     "password": "testing" 
// }