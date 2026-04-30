FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine
RUN addgroup -S runner && adduser -S runner -G runner
USER runner
WORKDIR /app