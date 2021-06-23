const express = require('express');
const app = express();

const router = require('./routes/routes');

var db = require('./dbConnectivity/mongodb');


app.use(express.urlencoded( {extended: false}));
app.use(express.json( ));

app.get('/test', (req, res) => 
{
    return res.send({ responseCode: 200, responseMessage: "Hello.......!" })
}) 

app.use('/user', router);


app.listen(2030, (err, result) => {
    if (err) {
        console.log("server error", err)
    }
    else {
        console.log("Server is listening at 2030")
    }
})