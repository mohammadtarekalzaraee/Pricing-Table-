import * as Joi from '@hapi/joi'
// var fs = require('fs');
const fs = require('fs')

// This is the JOI validation schema, you define
// all the validation logic in here, then run
// the validation during the request lifecycle.
// If you prefer to use your own way of validating the 
// incoming data, you can use it.
const schema = Joi.object<import('../../types').Matrix>({})

export default async (req: import('next').NextApiRequest, res: import('next').NextApiResponse) => {
  try {
    // This will throw when the validation fails
    let matrixData = req.body.data;
    var json = JSON.stringify(matrixData);
    // const data = await schema.validateAsync(req.body.data, {
    //   abortEarly: false
    // }) as import('../../types').Matrix

    // Write the new matrix to public/pricing.json
    await fs.writeFile('./public/pricing.json', json, 'utf8', (res) => {});
    // fs.writeFileSync('../../public/pricing.json', json)

    res.statusCode = 200
    res.json(matrixData)
  } catch(e) {
    console.error(e)
    if(e.isJoi) {
      // Handle the validation error and return a proper response
      res.statusCode = 422
      res.end('Error')
      return
    }
    
    res.statusCode = 500
    res.json({ error: 'Unknown Error' })
  }
}