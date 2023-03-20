import { APIGatewayProxyHandler } from "aws-lambda"
import { document } from "../utils/DynamoClient"

interface GenerateCertificateRequest {
  id: string,
  name: string,
  grade: string
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { id, name, grade } = JSON.parse(event.body as string) as GenerateCertificateRequest

  await document.put({
    TableName: "users_certificate",
    Item: {
      id,
      name,
      grade
    }
  }).promise()

  const response = await document.get({
    TableName: "users_certificate",
    Key: { id }
  }).promise()

  return {
    statusCode: 200,
    body: JSON.stringify(response.Item)
  }
}