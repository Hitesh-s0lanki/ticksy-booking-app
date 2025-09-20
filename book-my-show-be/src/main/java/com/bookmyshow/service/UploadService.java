package com.bookmyshow.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bookmyshow.dto.UploadResult;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    private final S3Client s3;
    private final S3Presigner presigner;

    @Value("${app.aws.s3.bucket}")
    private String bucket;

    @Value("${app.aws.region}")
    private String region;

    @Value("${app.aws.s3.public-reads-enabled:false}")
    private boolean publicReads;

    @Value("${app.aws.s3.presign-expiry-seconds:86400}")
    private long defaultExpirySeconds;

    /**
     * Uploads bytes to S3 and returns key + URL (public URL or a presigned GET).
     */
    public UploadResult uploadBytes(String key, byte[] content, String contentType) {
        PutObjectRequest.Builder put = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType);

        if (publicReads) {
            put.acl(ObjectCannedACL.PUBLIC_READ);
        }

        s3.putObject(put.build(), RequestBody.fromBytes(content));
        log.info("Uploaded to s3://{}/{}", bucket, key);

        String url = publicReads
                ? "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key
                : getSignedGetUrl(key, Duration.ofSeconds(defaultExpirySeconds));

        return new UploadResult(key, url);
    }

    /** Returns a presigned GET URL (for private buckets). */
    public String getSignedGetUrl(String key, Duration expiry) {
        GetObjectRequest get = GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        GetObjectPresignRequest presignReq = GetObjectPresignRequest.builder()
                .signatureDuration(expiry)
                .getObjectRequest(get)
                .build();

        return presigner.presignGetObject(presignReq).url().toString();
    }

    /**
     * Optional: add Content-Disposition so browsers download with a nice filename.
     */
    public String getSignedGetUrl(String key, Duration expiry, String downloadFileName) {
        String disposition = "attachment; filename*=UTF-8''" +
                URLEncoder.encode(downloadFileName, StandardCharsets.UTF_8);
        GetObjectRequest get = GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .responseContentDisposition(disposition)
                .build();

        GetObjectPresignRequest presignReq = GetObjectPresignRequest.builder()
                .signatureDuration(expiry)
                .getObjectRequest(get)
                .build();

        return presigner.presignGetObject(presignReq).url().toString();
    }

    /**
     * Presigned PUT (let frontend upload directly to S3 without passing through
     * your server).
     */
    public String getSignedPutUrl(String key, String contentType, Duration expiry) {
        PutObjectRequest put = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignReq = PutObjectPresignRequest.builder()
                .signatureDuration(expiry)
                .putObjectRequest(put)
                .build();

        return presigner.presignPutObject(presignReq).url().toString();
    }

    /** Helper to create a stable key path. */
    public static String buildKey(String prefix, UUID bookingId, String ext) {
        return "%s/%s/%s.%s".formatted(prefix, LocalDate.now(), bookingId, ext);
    }
}
