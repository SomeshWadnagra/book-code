# Dockerfile for Author Service
FROM eclipse-temurin:17-jre

# run as non-root
RUN useradd -ms /bin/bash app && mkdir -p /app && chown -R app:app /app
USER app
WORKDIR /app

# CI (or local mvn) must build the fat jar first: author-service/target/*.jar
COPY target/*.jar /app/app.jar

# optional: honor JAVA_TOOL_OPTIONS (set in compose)
ENTRYPOINT ["sh","-c","exec java $JAVA_TOOL_OPTIONS -jar /app/app.jar"]

