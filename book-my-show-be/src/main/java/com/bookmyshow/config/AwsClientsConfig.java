package com.bookmyshow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class AwsClientsConfig {

    @Value("${app.aws.region}")
    private String region;

    @Value("${app.aws.access-key-id:}")
    private String accessKeyId;

    @Value("${app.aws.secret-access-key:}")
    private String secretAccessKey;

    @Value("${app.aws.session-token:}")
    private String sessionToken;

    private AwsCredentialsProvider credentialsProvider() {
        // If keys provided via properties/env, use them; otherwise fall back to the
        // default chain:
        // Env -> System props -> Shared ~/.aws/credentials -> Container/IMDS role, etc.
        if (accessKeyId != null && !accessKeyId.isBlank()
                && secretAccessKey != null && !secretAccessKey.isBlank()) {
            if (sessionToken != null && !sessionToken.isBlank()) {
                return StaticCredentialsProvider.create(
                        AwsSessionCredentials.create(accessKeyId, secretAccessKey, sessionToken));
            }
            return StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKeyId, secretAccessKey));
        }
        return DefaultCredentialsProvider.create();
    }

    @Bean
    public S3Client s3Client() {
        S3ClientBuilder b = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider());
        return b.build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider())
                .build();
    }
}