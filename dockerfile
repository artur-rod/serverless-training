FROM --platform=linux/arm64 node

ARG TARGETPLATFORM
ARG BUILDPLATFORM
RUN echo "I am running on $BUILDPLATFORM, building for $TARGETPLATFORM" > /log

RUN npm install yarn serverless -g --force
RUN apt update
RUN apt install -y chromium

WORKDIR /usr/app

COPY package.json ./
COPY .yarnrc.yml ./

RUN yarn

COPY . .

EXPOSE 3000

CMD [ "sls", "offline" ]