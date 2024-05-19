import fs from 'fs'
import cron from 'node-cron'
import { makeTokenRequest } from './authService.js'
import { initiateBulkRequest, processBulkDataStreams, queryBulkRequestStatus } from './bulkRequestService.js'
import { constructAndSendEmail } from './emailService.js'

const writeResultsToDisk = async (results) => {
  const fileStream = fs.createWriteStream(`results.txt`)
  fileStream.write(JSON.stringify(results, null, '\t'))
}

const initiateBulkRequestJob = async () => {

  const access_token = await makeTokenRequest()

  const bulkRequestContentLocation = await initiateBulkRequest(access_token)
  const bulkRequestId = bulkRequestContentLocation.split('/').pop()

  const bulkDataResponse = await queryBulkRequestStatus(access_token, bulkRequestId)

  const results = await processBulkDataStreams(bulkDataResponse, access_token)

  await writeResultsToDisk(results)

  await constructAndSendEmail(results)
}

const commandLineArg = process.argv[2]

if (commandLineArg && commandLineArg.toLowerCase() === 'now') {
  initiateBulkRequestJob()
} else {
  cron.schedule('0 0 * * *', initiateBulkRequestJob)
}