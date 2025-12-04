#Dockerfile for API Gateway microservice
FROM eclipse-temurin:17-jre

# Run as non-root
RUN useradd -ms /bin/bash appuser && mkdir -p /app && chown -R appuser:appuser /app
USER appuser
WORKDIR /app

# CI places the built JAR at spring-microservices-bookstore-demo/api-gateway/target/*.jar
COPY target/*.jar /app/app.jar

# Optional port/env (matches your current flags)
ENV SERVER_PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh","-c","java $JAVA_TOOL_OPTIONS -Dserver.port=${SERVER_PORT} -jar /app/app.jar"]
