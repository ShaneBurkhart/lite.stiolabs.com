FROM shaneburkhart/gmi-utils


FROM node:15.14.0
MAINTAINER Shane Burkhart <shaneburkhart@gmail.com>

WORKDIR /app

COPY --from=0 /app /utils

ADD . /app/

RUN npm install 
RUN npm run build:prod

CMD ["true"]
