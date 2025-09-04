## Run Docker Compose File

docker-compose up
docker ps
docker exec -it postgres_db bash

## Run Project

mvn spring-boot:run

## PSQL commands

--psql "postgresql://postgres:postgres@localhost:5432/mydb" -f movies_seed.sql
-- cat movies_seed.sql | docker exec -i ticksy-booking-app-postgres-1 psql -U postgres -d mydb

docker exec -i ticksy-booking-app-postgres-1 \
 psql -U postgres -d mydb \
 -c 'TRUNCATE TABLE "movies" RESTART IDENTITY CASCADE;'
