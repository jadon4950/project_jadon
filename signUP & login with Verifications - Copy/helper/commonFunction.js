var nodemailer = require('nodemailer');

module.exports = {

    getOtp: () => {
        const otp = Math.floor(Math.random() * 9000 + 1000);
        return otp;
      },

      sendEmail: (email, fullName, otp, callback) => {
          var text = `Dear ${fullName}, your otp for verification is ${otp}`
          var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'jadon4950@gmail.com',
          pass: 'shubham_515253'
        }
      });
      
      var mailOptions = {
        from: 'jadon4950@gmail.com',
        to: 'jadon4950@gmail.com',
        subject: 'otp verification',
        text: text
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          callback(error,null);
        } else {
          callback(null, info);
        }
      });
    },

    sendEmailLink: (email, fullName, otp, _id, callback) => {
      var text = `Dear ${fullName} ,  your  otp for signUp verification is: ${otp} & email link is : http://localhost:2030/user/emailVerify/${_id}`
      var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'jadon4950@gmail.com',
      pass: 'shubham_515253'
    }
  });
  
  var mailOptions = {
    from: 'jadon4950@gmail.com',
    to: 'jadon4950@gmail.com',
    subject: 'otp verification',
    text: text
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      callback(error,null);
    } else {
      callback(null, info);
    }
  });
}

}