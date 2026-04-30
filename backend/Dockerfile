New-Item -Path "backend\docker\python" -ItemType Directory -Force
New-Item -Path "backend\docker\java" -ItemType Directory -Force
New-Item -Path "backend\docker\cpp" -ItemType Directory -Force
New-Item -Path "backend\docker\csharp" -ItemType Directory -Force

@"
FROM python:3.11-alpine
RUN addgroup -S runner && adduser -S runner -G runner
USER runner
WORKDIR /app
"@ | Out-File -FilePath "backend\docker\python\Dockerfile" -Encoding utf8

@"
FROM eclipse-temurin:17-alpine
RUN addgroup -S runner && adduser -S runner -G runner
USER runner
WORKDIR /app
"@ | Out-File -FilePath "backend\docker\java\Dockerfile" -Encoding utf8

@"
FROM alpine:3.19
RUN apk add --no-cache g++
RUN addgroup -S runner && adduser -S runner -G runner
USER runner
WORKDIR /app
"@ | Out-File -FilePath "backend\docker\cpp\Dockerfile" -Encoding utf8

@"
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine
RUN addgroup -S runner && adduser -S runner -G runner
USER runner
WORKDIR /app
"@ | Out-File -FilePath "backend\docker\csharp\Dockerfile" -Encoding utf8