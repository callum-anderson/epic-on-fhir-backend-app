import nodemailer from 'nodemailer'
import config from './config.js';

const transporter = nodemailer.createTransport({
  host: config.emailService.host,
  port: config.emailService.port,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: config.emailService.username,
    pass: config.emailService.password,
  },
});

const constructHtmlBody = (bulkDataResponse) => {
    let html = `<div><h3>Epic bulk data export completed successfully at: ${(new Date()).toLocaleString()}.</h3>`

    html+='<table border="1" cellpadding="2" cellspacing="2"><tr><th>PATIENT</th><th>NORMAL RESULT COUNT</th><th>ABNORMAL RESULTS</th></tr>'

    Object.keys(bulkDataResponse).forEach(patient => {
        html += `<tr><td rowspan=${bulkDataResponse[patient].abnormalResults ? bulkDataResponse[patient].abnormalResults.length : 1}>${bulkDataResponse[patient].patientResource.name[0].text} <em>(${patient}</em>)&nbsp</td>`
        html += `<td rowspan=${bulkDataResponse[patient].abnormalResults ? bulkDataResponse[patient].abnormalResults.length : 1}>${bulkDataResponse[patient].normalResults ? bulkDataResponse[patient].normalResults.length : 0}</td>`
        if (bulkDataResponse[patient].abnormalResults) {
            bulkDataResponse[patient].abnormalResults.forEach((result, i, arr) => {
                html += `<td>ID: ${result.observationResource.id}<br/>Name: ${result.observationResource.code.coding[0].display}<br/>Reason: ${result.resultComment}</td></tr>${i < arr.length-1 ? '<tr>' : ''}`
            })
        } else {
            html += '<td>-</td></tr>'
        }
    })

    html += '</table></div>'

    return html
}

const sendNotificationEmail = (htmlBody) => {
    transporter.sendMail({
        from: '"Batch Processor" <notify@epic-app.com>',
        to: config.emailService.recipientEmailAddresses.join(','),
        subject: "Bulk lab results export complete.",
        html: htmlBody,
      }).then(info => console.info(info))
}

export const constructAndSendEmail = async (results) => {
    const htmlBody = constructHtmlBody(results)
  
    sendNotificationEmail(htmlBody)
}