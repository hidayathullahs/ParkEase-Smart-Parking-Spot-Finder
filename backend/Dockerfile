# Build Stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user and ensure /app permissions
RUN addgroup -S parkease && adduser -S parkease -G parkease && chown -R parkease:parkease /app

# Copy generated JAR with proper ownership
COPY --chown=parkease:parkease --from=build /app/target/*.jar app.jar

USER parkease:parkease

ENV PORT=10000
EXPOSE 10000

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-10000} -Dserver.address=0.0.0.0 -Djava.net.preferIPv4Stack=true -jar app.jar"]
