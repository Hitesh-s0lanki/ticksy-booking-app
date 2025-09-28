# Maven

docker build -t ticksy-java-server:latest -f Dockerfile .
docker run -p 8080:8080 --name ticksy-java-server ticksy-java-server:latest

docker push hiteshs0lanki/ticksy-java-server:latest

docker tag ticksy-java-server:latest hiteshs0lanki/ticksy-java-server:latest

docker push hiteshs0lanki/ticksy-java-server:latest
