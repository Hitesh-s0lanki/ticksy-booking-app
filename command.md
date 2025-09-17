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

docker exec -i ticksy-booking-app-postgres-1 \
 psql -U postgres -d mydb \
 -c "SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'events' ORDER BY ordinal_position;"

docker exec -i ticksy-booking-app-postgres-1 \
 psql -U postgres -d mydb \
 -c "ALTER TABLE events DROP COLUMN IF EXISTS movie_id;"

docker exec -i 4afcac8fef55 \
 psql -U postgres -d mydb \
 -c "DROP TABLE bookings;"

docker exec -i 4afcac8fef55 \
 psql -U postgres -d mydb \
 -c 'DROP TABLE IF EXISTS bookings CASCADE;'

chmod +x ./src/resources/tools/\*.sh
