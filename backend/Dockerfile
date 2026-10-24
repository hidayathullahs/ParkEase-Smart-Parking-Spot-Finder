# Build Stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Add curl for Render health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -S parkease && adduser -S parkease -G parkease
USER parkease:parkease

# Copy generated JAR (wildcard ensures version updates don't break the build)
COPY --from=build /app/target/*.jar app.jar

ENV PORT=5002
EXPOSE 5002

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -Dserver.address=0.0.0.0 -jar app.jar"]
