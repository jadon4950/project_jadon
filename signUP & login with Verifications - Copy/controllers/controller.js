var userModel = require('../models/userModel');
var commonFunction = require('../helper/commonFunction');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const Speakeasy = require("speakeasy");
module.exports = {

    // API for SignUp & send otp using nodemailer
    signUp: (req, res) => {
        try {
            const query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber },] }, { userType: "USER" }, { status: { $ne: "DELETE" } }] }
            userModel.findOne(query, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: error });
                }
                else if (result) {
                    if (result.email == req.body.email) {
                        return res.send({ responseCode: 409, responseMessage: "Email already exist.", responseResult: [] });
                    }
                    else {
                        return res.send({ responseCode: 409, responseMessage: "MobileNumber already exist.", responseResult: [] });

                    }
                }
                else {
                    var fullName = `${req.body.firstName} ${req.body.lastName}`
                    const mobileNumber = req.body.mobileNumber;
                    var password = bcrypt.hashSync(req.body.password);
                    req.body.otp = commonFunction.getOtp();
                    req.body.otpTime = new Date().getTime();
                    const last4digits = mobileNumber.toString().slice(-4);
                    req.body.userName = `${req.body.firstName}${last4digits}`;

                    commonFunction.sendEmail(req.body.email, fullName, req.body.otp, (emailErr, emailRes) => {
                        if (emailErr) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error1.", responseResult: emailErr });
                        } else {
                            new userModel(req.body).save((saveErr, saveRes) => {
                                if (saveErr) {
                                    return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: saveErr });
                                }
                                else {
                                    return res.send({ responseCode: 200, responseMessage: "SignUp successfully", responseResult: saveRes });
                                }
                            })
                        }
                    })
                }
            })
        }
        catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!" })
        }
    },

    // API for SignUp & email link verification 
    signUpLink: (req, res) => {
        try {
            const query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber },] }, { userType: "USER" }, { status: { $ne: "DELETE" } }] }
            userModel.findOne(query, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: error });
                }
                else if (result) {
                    if (result.email == req.body.email) {
                        return res.send({ responseCode: 409, responseMessage: "Email already exist.", responseResult: [] });
                    }
                    else {
                        return res.send({ responseCode: 409, responseMessage: "MobileNumber already exist.", responseResult: [] });

                    }
                }
                else {
                    var fullName = `${req.body.firstName} ${req.body.lastName}`
                    const mobileNumber = req.body.mobileNumber;
                    var password = bcrypt.hashSync(req.body.password);
                    req.body.otp = commonFunction.getOtp();
                    req.body.otpTime = new Date().getTime();
                    const last4digits = mobileNumber.toString().slice(-4);
                    req.body.userName = `${req.body.firstName}${last4digits}`;

                    new userModel(req.body).save((saveErr, saveRes) => {
                        if (saveErr) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: saveErr });
                        }
                        else {
                            commonFunction.sendEmailLink(req.body.email, fullName, saveRes.otp, saveRes._id, (emailErr, emailRes) => {
                                if (emailErr) {
                                    return res.send({ responseCode: 500, responseMessage: "Internal server error1.", responseResult: emailErr });
                                } else {
                                    return res.send({ responseCode: 200, responseMessage: "SignUp successfully", responseResult: saveRes });
                                }
                            })
                        }
                    })
                }
            })
        }
        catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!" })
        }
    },

    //API for ResendOtp
    resendOtp: (req, res) => {
        try {
            const query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber },] }, { userType: "USER" }, { status: { $ne: "DELETE" } }] }
            userModel.findOne(query, (error, result) => {
                console.log("result", result)
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: error });
                }
                else if (!result) {

                    return res.send({ responseCode: 409, responseMessage: "Email or mobileNumber not found", responseResult: [] });
                }
                else {
                    var fullName = `${req.body.firstName} ${req.body.lastName}`;
                    req.body.otp = commonFunction.getOtp();
                    req.body.otpTime = new Date().getTime();

                    commonFunction.sendEmail(req.body.email, fullName, req.body.otp, (emailErr, emailRes) => {
                        if (emailErr) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: emailErr });
                        } else {
                            console.log(result._id);
                            userModel.findByIdAndUpdate({ _id: result._id }, { $set: { otp: req.body.otp, otpTime: req.body.otpTime } }, (updateErr, updateRes) => {
                                if (updateErr) {
                                    res.send({ responseCode: 500, responseMessage: "intenel error", responseResult: updateErr });
                                }
                                else {
                                    res.send({ responseCode: 200, responseMessage: "resend otp sucess", responseResult: updateRes });
                                }
                            })
                        }
                    })
                }
            })
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!" })
        }
    },

    //API for OtpVerify
    otpVerify: (req, res) => {
        try {
            const query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber },] }, { userType: "USER" }, { status: { $ne: "DELETE" } }] }
            userModel.findOne(query, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: error });
                }
                else if (!result) {

                    return res.send({ responseCode: 409, responseMessage: "Email or mobileNumber not found", responseResult: [] });
                }
                else {
                    var currentTime = new Date().getTime();
                    var dbTime = result.otpTime;
                    var diff = currentTime - dbTime;
                    if (diff <= 60 * 60 * 1000) {
                        if (result.otp == req.body.otp) {
                            userModel.findByIdAndUpdate({ _id: result._id }, { $set: { otpVerification: true } }, { new: true }, (updateErr, updateRes) => {
                                if (updateErr) {
                                    res.send({ responseCode: 500, responseMessage: "intenel error", responseResult: updateErr });
                                }
                                else {
                                    res.send({ responseCode: 200, responseMessage: "otp verified successfully", responseResult: updateRes });
                                }
                            })
                        } else {
                            return res.send({ responseCode: 402, responseMessage: "Incorrect otp.", responseResult: [] });
                        }
                    } else {
                        return res.send({ responseCode: 402, responseMessage: "Otp Expired.", responseResult: [] });
                    }

                }
            })
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!" })
        }
    },

    // API for ForgotPassword
    forgotPassword: (req, res) => {
        try {
            const query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber },] }, { userType: "USER" }, { status: { $ne: "DELETE" } }] }
            userModel.findOne(query, (error, result) => {
                console.log("result", result)
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: error });
                }
                else if (!result) {

                    return res.send({ responseCode: 409, responseMessage: "Email or mobileNumber not found", responseResult: [] });
                }
                else {
                    var fullName = `${req.body.firstName} ${req.body.lastName}`;
                    req.body.otp = commonFunction.getOtp();
                    req.body.otpTime = new Date().getTime();

                    commonFunction.sendEmail(req.body.email, fullName, req.body.otp, (emailErr, emailRes) => {
                        if (emailErr) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: emailErr });
                        } else {
                            console.log(result._id);
                            userModel.findByIdAndUpdate({ _id: result._id }, { $set: { otp: req.body.otp, otpTime: req.body.otpTime } }, (updateErr, updateRes) => {
                                if (updateErr) {
                                    res.send({ responseCode: 500, responseMessage: "intenel error", responseResult: updateErr });
                                }
                                else {
                                    res.send({ responseCode: 200, responseMessage: "resend otp sucess", responseResult: updateRes });
                                }
                            })
                        }
                    })
                }
            })
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!" })
        }
    },

    //API for ResetPassword with OtpVerification true
    resetPassword: (req, res) => {
        try {
            const query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber },] }, { userType: "USER" }, { status: { $ne: "DELETE" } }] }
            userModel.findOne(query, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: error });
                }
                else if (!result) {
                    return res.send({ responseCode: 409, responseMessage: "Email or mobileNumber not found", responseResult: [] });
                }
                else {
                    var password = bcrypt.hashSync(req.body.password);
                    var confirmPassword = bcrypt.hashSync(req.body.confirmPassword);
                    if (result.otpVerification == true) {
                        if (bcrypt.compare(password, confirmPassword)) {
                            userModel.findByIdAndUpdate({ _id: result._id }, { $set: { password: password } }, { new: true }, (updateErr, updateRes) => {
                                if (updateErr) {
                                    res.send({ responseCode: 500, responseMessage: "intenel server  error", responseResult: updateErr });
                                }
                                else {
                                    res.send({ responseCode: 200, responseMessage: "Reset password successfuliy", responseResult: updateRes });
                                }
                            })
                        } else {
                            return res.send({ responseCode: 402, responseMessage: "Password unmatched", responseResult: [] });
                        }
                    } else {
                        return res.send({ responseCode: 402, responseMessage: "Please first verify", responseResult: [] });
                    }

                }
            })
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!" })
        }
    },

    //API for reset Password without OtpVerification
    resetPass: (req, res) => {
        try {
            const query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber },] }, { userType: "USER" }, { status: { $ne: "DELETE" } }] }
            userModel.findOne(query, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: error });
                }
                else if (!result) {
                    return res.send({ responseCode: 409, responseMessage: "Email or mobileNumber not found", responseResult: [] });
                }
                else {
                    var password = bcrypt.hashSync(req.body.password);
                    var confirmPassword = bcrypt.hashSync(req.body.confirmPassword);
                    console.log("console", bcrypt.compare(password, confirmPassword));
                    if (result.otpVerification == false) {
                        if (bcrypt.compare(password, confirmPassword)) {
                            userModel.findByIdAndUpdate({ _id: result._id }, { $set: { otpVerification: true, password: password } }, { new: true }, (updateErr, updateRes) => {
                                if (updateErr) {
                                    res.send({ responseCode: 500, responseMessage: "intenel server  error", responseResult: updateErr });
                                }
                                else {
                                    res.send({ responseCode: 200, responseMessage: "Reset password successfuliy", responseResult: updateRes });
                                }
                            })
                        } else {
                            return res.send({ responseCode: 402, responseMessage: "Password unmatched", responseResult: [] });
                        }
                    } else {
                        return res.send({ responseCode: 402, responseMessage: "Please first verify", responseResult: [] });
                    }

                }
            })
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!" })
        }
    },

    //API for Email Link Verification 
    emailVerify: (req, res) => {
        try {
            userModel.findOne({ _id: req.params._id, userType: "USER", status: "ACTIVE" }, (error, result) => {
                console.log(result)
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: error });
                } else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: "Data not found.", responseResult: result });
                } else {
                    if (result.emailVerification == false) {
                        userModel.findByIdAndUpdate({ _id: result._id }, { $set: { emailVerification: true } }, { new: true }, (updateError, updateRes) => {
                            if (updateError) {
                                return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: updateError });
                            } else {
                                return res.send({ responseCode: 200, responseMessage: "Successfully updated..", responseResult: updateRes });
                            }
                        })
                    } else {
                        return res.send({ responseCode: 409, responseMessage: "Email already verified.", responseResult: result });
                    }
                }
            })
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!" })

        }
    },

    //API for UserLOgin with otp verification & Email Verification 
    userLogin: (req, res) => {
        try {
            const query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber },] }, { userType: "USER" }, { status: { $ne: "DELETE" } }] }
            userModel.findOne(query, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: error });
                } else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: "email or mobile no. not found.", responseResult: [] });
                } else {
                    var password = bcrypt.hashSync(req.body.password);
                    // if (result.otpVerification == true) {

                    if (result.emailVerification == true) {

                        if (bcrypt.compare(password, result.password)) {
                            return res.send({ responseCode: 200, responseMessage: "login successfully.", responseResult: [] });
                        } else {
                            return res.send({ responseCode: 500, responseMessage: "Error enquired during login.", responseResult: error });
                        }
                    }
                    else {
                        return res.send({ responseCode: 402, responseMessage: "please first verify your email.", responseResult: [] });
                    }
                    //}
                    //else {
                    //   return res.send({ responseCode: 402, responseMessage: "please first verify your otp.", responseResult: [] });
                    // }

                }

            })

        }
        catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!" })
        }
    },

    //API for login using JSON WEB token
    login: (req, res) => {
        try {
            const query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber },] }, { userType: "USER" }, { status: { $ne: "DELETE" } }] }
            userModel.findOne(query, (error, result) => {
                console.log(result)
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: error });
                } else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: " Incorrect email or mobile no. .", responseResult: [] });
                } else {
                    // if (result.otpVerification == true && result.emailVerification == true) 
                    //      {
                    var password = bcrypt.hashSync(req.body.password);

                    // var check = bcrypt.compareSync(password, result.password);

                    if (bcrypt.compare(password, result.password)) {
                        console.log(result.password)
                        var token = jwt.sign({ _id: result._id, email: result.email }, 'testing', { expiresIn: '1h' });
                        var data = {
                            token: token,
                            _id: result._id,
                            email: result.email
                        }
                        console.log("line no-26------------", data)
                        return res.send({ responseCode: 200, responseMessage: "login successfully.", result: data });

                    } else {
                        return res.send({ responseCode: 404, responseMessage: "Error inquired during login." });
                    }
                    //}
                    //  else {
                    //      return res.send({ responseCode: 404, responseMessage: "please first verify your email." });
                    //  }
                }
            })

        }
        catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!" })
        }
    },

    Authentication: (req, res) => {
        try {
            var secret = Speakeasy.generateSecret({ name: "hello jadon...!", length: 20 });
            console.log(secret.base32);
            res.status(200).json({ "secret": secret.base32 });

            QRCode.toString(secret.otpauth_url, (error, image_data) => {
                console.log("image_data", image_data);
            });
        }
        catch (error) {
            return res.status(501).send({ responseMessage: "something went wrong" });
        }
    },

    //API for login with 2Factor Authentication
    login2FA: async (req, res) => {
        try {
            const query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }] }, { status: "ACTIVE", userType: "USER" }] }
            userModel.findOne(query, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: error });
                } else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: " Incorrect email or mobile no. .", responseResult: [] });
                } else {
                    // if (result.otpVerification == true && result.emailVerification == true) 
                    //      {
                    var password = bcrypt.hashSync(req.body.password);
                    //var check = bcrypt.compare(password, result.password);
                    //console.log("check",check)
                    if (bcrypt.compare(password, result.password)) {
                        var userToken = req.body.userToken;
                        var secretBase32 = req.body.secretBase32;
                        var verified = Speakeasy.totp.verify({
                            secret: secretBase32,
                            encoding: 'base32',
                            token: userToken,
                        });
                        if (verified) {
                            console.log("verified", verified);
                            var token = jwt.sign({ _id: result._id, email: result.email }, 'testing', { expiresIn: '1h' });
                            var data = {
                                token: token,
                                _id: result._id,
                                email: result.email
                            }
                            console.log("line no-26------------", data)
                            return res.send({ responseCode: 200, responseMessage: "login successfully.", responseResult: data });
                        } else {
                            return res.send({ responseCode: 404, responseMessage: "please verify userToken or secretBase32" });
                        }
                    }
                    else {
                        return res.send({ responseCode: 404, responseMessage: "Error inquired during login." });
                    }
                    // }
                    //  else {
                    //      return res.send({ responseCode: 404, responseMessage: "please first verify your email." });
                    //  }
                }
            })

        }
        catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!" })
        }
    },

    //API fot usersList
    userList: (req, res) => {
        userModel.find({ userType: "USER", status: "ACTIVE" }, (error, result) => {
            if (error) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error", responseResult: error })
            } else if (result.length == 0) {
                return res.send({ responseCode: 404, responseMessage: "Data not found", responseResult: result })
            } else {
                return res.send({ responseCode: 200, responseMessage: "Details fetched successfully.", responseResult: result })
            }
        })
    },
    //API for viewUserContent
    viewUserContent: (req, res) => {
        userModel.findOne({ _id: req.params._id, status: "ACTIVE", userType: "USER" }, (err, result) => {
            if (err) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error." });
            }
            else if (!result) {
                return res.send({ responseCode: 404, responseMessage: "Data not found." });
            }
            else {
                return res.send({ responseCode: 200, responseMessage: "Details have been fetched successfully.", result });
            }
        })
    },

    //API for Edit Profile
    editProfile: (req, res) => {
        try {
            userModel.findOne({ _id: req.body._id, userType: "USER", status: "ACTIVE" }, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: error });
                } else if (!result) {
                    return res.send({ responseCode: 404, responseMessage: "Data not found.", responseResult: result });
                } else {
                    if (req.body.email && !req.body.mobileNumer) {
                        userModel.findOne({ email: req.body.email, status: "ACTIVE", _id: { $ne: result._id } }, (findErr, findRes) => {
                            if (findErr) {
                                return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: findErr });
                            } else if (findRes) {
                                return res.send({ responseCode: 409, responseMessage: "Email already exist.", responseResult: findRes });
                            } else {
                                var firstName = req.body.firstName;
                                userModel.findByIdAndUpdate({ _id: result._id }, { $set: req.body }, { new: true }, (updateErr, updateRes) => {
                                    if (updateErr) {
                                        return res.send({ responseCode: 500, responseMessage: "Internal server error.", responseResult: updateErr });
                                    } else {
                                        return res.send({ responseCode: 200, responseMessage: "Successfully updated..", responseResult: updateRes });
                                    }
                                    r
                                })
                            }
                        })
                    } else if (!req.body.email && req.body.mobileNumer) {

                    } else if (req.body.email && req.body.mobileNumer) {

                    } else {

                    }
                }
            })

        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!" })

        }


    },

        viewStaticContent: (req, res) => {
        staticModel.findOne({ type: req.query.type, status: "ACTIVE" }, (err, result) => {
            if (err) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error." });
            }
            else if (!result) {
                return res.send({ responseCode: 404, responseMessage: "Data not found." });
            }
            else {
                return res.send({ responseCode: 200, responseMessage: "Details have been fetched successfully.", result });
            }
        })
    },

    editStaticContent : (req,res) => {
        var title= req.body.title;
        staticModel.findOneAndUpdate({ _id: req.params._id ,status: { $in: ["ACTIVE"] }}, { $set: { title:title } }, { new: true }, (updateError, updateRes) => {
            if (updateError) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error.",  responseResult: updateErr });
            }
            else if (!updateRes) {
                return res.send({ responseCode: 404, responseMessage: "Data not found." });
            }
            else {
                return res.send({ responseCode: 200, responseMessage: "Details have been updated successfully.", updateRes });
            }
    })
    }

}
