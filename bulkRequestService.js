import axios from 'axios'
import hyperquest from 'hyperquest'
import ndjson from 'ndjson'
import config from './config.js'

let results = {}

export const initiateBulkRequest = async (access_token) => {
    let response
  
    try {
      response = await axios.get(
        `${config.fhirEndpoint}/${config.fhirVersion}/Group/${config.bulkGroupId}/$export`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            Accept: 'application/fhir+json',
            Prefer: 'respond-async'
          },
          params: {
            _type: 'Patient,Observation',
            _typeFilter: 'Observation?category=laboratory'
          }
        }
      )
      return response.headers.get('Content-Location')
    } catch (error) {
      throw new Error(`Error initiating bulk request: ${error}`)
    }
}

const checkObservationResource = (resource) => {
    if (!resource.valueQuantity) return "No value quantity found in resource."
    if (!resource.valueQuantity.value) return "No value found in resource."
    if (!resource.referenceRange || !resource.referenceRange[0] || !resource.referenceRange[0].low) return "No reference range for comparison."

    const valueQuantity = resource.valueQuantity
    const lowerReferenceRange = resource.referenceRange[0].low.value
    const higherReferenceRange = resource.referenceRange[0].high.value

    if (valueQuantity.value < lowerReferenceRange || valueQuantity.value > higherReferenceRange)
        return `Value '${valueQuantity.value} ${valueQuantity.unit}' outside of reference range (${lowerReferenceRange}-${higherReferenceRange} ${valueQuantity.unit})`

    return ""
}

const processResource = (resource) => {
  if (resource.resourceType?.toLowerCase() === 'patient') {
    if (!results[resource.id]) results[resource.id] = {}
    results[resource.id]['patientResource'] = resource
  } else if (resource.resourceType?.toLowerCase() === 'observation' && resource.category.some(c => c.text.toLowerCase() === 'laboratory')) {
    const resultCheck = checkObservationResource(resource)
    const resultType = resultCheck.length > 0 ? 'abnormalResults' : 'normalResults'
    
    const patientId = resource.subject.reference.split('/').pop()
    if (!results[patientId]) results[patientId] = {}
    if (results[patientId][resultType]) {
      results[patientId][resultType].push(
        {
          observationResource: resource,
          resultComment: resultCheck
        }
      )
    } else {
      results[patientId][resultType] = [{
        observationResource: resource,
        resultComment: resultCheck
      }]
    }
  }
}

export const processBulkDataStreams = async (bulkDataResponse, access_token) => {
    const bulkDataPromises = []
  
    bulkDataResponse.output.forEach(bulkDataResponse => {
  
      bulkDataPromises.push(
        new Promise((resolve) => {
          const stream = hyperquest(bulkDataResponse.url,
            {
              headers: {
                Authorization: `Bearer ${access_token}`
              }
            }
          ).pipe(ndjson.parse())
          stream.on('data', (data) => processResource(data))
          stream.on('error', (err) => { console.error(err); resolve() })
          stream.on('end', () => { resolve() })
        })
      )
    })
    
    await Promise.all(bulkDataPromises)

    return results
}

export const queryBulkRequestStatus = async (access_token, bulkRequestId) => {
    let response
  
    try {
      response = await axios.get(
        `${config.fhirEndpoint}/BulkRequest/${bulkRequestId}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            Accept: '*/*'
          }
        }
      )
      if (response.status === 202) {
        console.info(`Progress: ${response.headers.get('X-Progress')}. Waiting 1 minute before retry...`)
        await new Promise(resolve => setTimeout(() => resolve(), 60000))
        return await queryBulkRequestStatus(access_token, bulkRequestId)
      } else if (response.status === 200) {
        return response.data
      }
    } catch (error) {
      throw new Error(`Error initiating bulk request: ${error}`)
    }
  }