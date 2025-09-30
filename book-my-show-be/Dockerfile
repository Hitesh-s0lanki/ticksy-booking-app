# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom(s) first to maximize caching
COPY pom.xml ./
# If multi-module, copy each module's pom.xml too.
# COPY module-a/pom.xml module-b/pom.xml ./ # (example)

# Pre-download dependencies using BuildKit cache
RUN --mount=type=cache,target=/root/.m2 mvn -q -e -DskipTests dependency:go-offline

# Copy source and build
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -q -e -DskipTests package

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre
ENV TZ=UTC \
    JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseContainerSupport -XX:+ExitOnOutOfMemoryError" \
    SPRING_PROFILES_ACTIVE=prod
WORKDIR /app

# Non-root user
RUN useradd -r -u 10001 spring
USER spring

# Copy fat jar
COPY --from=build /app/target/*.jar /app/app.jar

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
