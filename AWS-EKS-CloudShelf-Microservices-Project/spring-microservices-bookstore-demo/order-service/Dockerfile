#Dockerfile for order-service
FROM eclipse-temurin:17-jre

# run as non-root
RUN useradd -ms /bin/bash app && mkdir -p /app && chown -R app:app /app
USER app
WORKDIR /app

# CI/local mvn must build: order-service/target/*.jar
COPY target/*.jar /app/app.jar

# honor JAVA_TOOL_OPTIONS (e.g., -Xms, -Xmx, system props)
ENTRYPOINT ["sh","-c","exec java $JAVA_TOOL_OPTIONS -jar /app/app.jar"]

