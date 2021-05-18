const express = require('express');
const app = express();
const https = require('https');
const url = require('url');
const moment = require('moment');
const { CronJob } = require('cron');
const sound = require('sound-play');

const PINCODE = 135001;
const DATE = moment().add(0, 'day').format('DD-MM-YYYY');
const URL = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${PINCODE}&date=${DATE}`;


const findVaccineSlot = async() => {
    const body = await httpRequestGenerator();
    ((body || {}).centers || []).forEach(center => {
        (center.sessions || []).forEach(session => {
            if(session.min_age_limit >= 18 && session.available_capacity >= 0) {
                sound.play("alert.mp3");
                console.log(`FOUND CENTER @ AGE: ${session.min_age_limit}, NAME: ${center.name}, ADDRESS: ${center.address}, VACCINE: ${session.vaccine}, DOSE-1: ${session.available_capacity_dose1}, DOSE-2: ${session.available_capacity_dose2}`)
            }
        })
    });
}

// app.get('/', async(req, res, next) => {
//     const body = await httpRequestGenerator();
//     ((body || {}).centers || []).forEach(center => {
//         (center.sessions || []).forEach(session => {
//             if(session.min_age_limit >= 18 && session.available_capacity >= 0) {
//                 sound.play("alert.mp3");
//                 console.log(`FOUND CENTER @ AGE: ${session.min_age_limit}, NAME: ${center.name}, ADDRESS: ${center.address}, VACCINE: ${session.vaccine}, DOSE-1: ${session.available_capacity_dose1}, DOSE-2: ${session.available_capacity_dose2}`)
//             }
//         })
//     })
//     res.send({body});
//     next();
// })

const httpRequestGenerator = () => new Promise(async(resolve, reject) => {
    const urlKeys = url.parse(URL, true);
    const options = {
        hostname: urlKeys.hostname,
        method: 'GET',
		path: urlKeys.path,
    }
    const request = https.request(options, (response) => {
        const chunks = [];
        response.on('data', (chunk) => {
            chunks.push(chunk);
        });
        response.on('end', () => {
            const body = Buffer.concat(chunks);
            return(resolve(JSON.parse(body.toString())));
        });
    }).on('error', e => console.log("Error in HTTP request ==> "+ JSON.stringify(e)));
    request.write("");
    request.end();
})

// app.listen(3000, () => 
//     console.log("CO-WIN Server is running @ 3000")
// )
new CronJob('* * * * *', async () => {
    console.log("******************************************************************************************************************************");
    console.log(`Vaccination Slot Details ==> @ ${moment()}`);
    await findVaccineSlot();
    console.log("******************************************************************************************************************************");
}, null, true, 'Asia/Kolkata');