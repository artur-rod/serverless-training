import { APIGatewayProxyHandler } from "aws-lambda";
import chromium from "chrome-aws-lambda";
import dayjs from "dayjs";
import { readFileSync } from "fs";
import { compile } from "handlebars";
import { join } from "path";
import { document } from "../utils/DynamoClient";

interface IGenerateCertificateRequest {
  id: string,
  name: string,
  grade: string
}

interface ITemplate {
  id: string;
  name: string;
  grade: string;
  date: string;
  medal: string;
}

function compileTemplate(data: ITemplate) {
  const templatePath = join(process.cwd(), "src", "templates", "certificate.hbs")
  const html = readFileSync(templatePath, "utf-8")

  return compile(html)(data)
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { id, name, grade } = JSON.parse(event.body as string) as IGenerateCertificateRequest

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

  const medalPath = join(process.cwd(), "src", "templates", "selo.png")
  const medal = readFileSync(medalPath, "base64")

  const template = compileTemplate({
    id,
    name,
    grade,
    date: dayjs().format("DD/MM/YYYY"),
    medal
  })

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath
  })

  const page = await browser.newPage()
  await page.setContent(template)

  const pdfPath = process.env.IS_OFFLINE ? "./certificate.pdf" : undefined
  await page.pdf({
    format: "a4",
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
    path: pdfPath
  })

  await browser.close()

  return {
    statusCode: 200,
    body: JSON.stringify(response.Item)
  }
}