FROM alpine:3.19
RUN apk add --no-cache g++
RUN addgroup -S runner && adduser -S runner -G runner
USER runner
WORKDIR /app