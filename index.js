"use strict";

const tls = require('tls');
const moment = require('moment');
var express = require('express');
var app = express();

var checkExpiration = (domain) => {

    console.log(domain);

    let options = {
        rejectUnauthorized: false,
        host: domain,
        servername: domain,
        port: 443
    };

    return new Promise(function(resolve, reject){
        try {
            let socket = tls.connect(options, () => {

                let validTo = socket.getPeerCertificate().valid_to;
                let validToMoment = moment.utc(validTo, 'MMM D HH:mm:ss YYYY Z');


                socket.end();

                resolve({
                    host: options.host,
                    expiration: validToMoment.format(),
                    expirationUnformatted: validTo
                })

            });

            socket.on('error', function(e){
                reject(e);
            })
        } catch (e) {
            reject(e);
        }

    });

};

var respond = (req, res) => {

    let result = checkExpiration(req.params.domain);

    result.catch(function(e){
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            error: 'unsorted',
            errorObject: e
        }));
    });

    result.then(function(a){
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(a));
    })
};


app.get('/ssl-expiration/:domain', respond);

app.listen(8080, function() {
    console.log('listening at 8080');
});





