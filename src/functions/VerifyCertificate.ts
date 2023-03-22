import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../utils/DynamoClient";

export const handler: APIGatewayProxyHandler = async (event) => {
  const {id} = event.pathParameters

  const validateCertificate = await document.get({
    TableName: "users_certificate",
    Key: { id }
  }).promise()

  if(validateCertificate.Item) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        validCertificate: true,
        info: validateCertificate.Item,
        certificateLink: `https://ignite-serverless-bucket.s3.amazonaws.com/${id}.pdf`
      })
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      validCertificate: false,
      message: "Certificate not found"
    })
  }
}