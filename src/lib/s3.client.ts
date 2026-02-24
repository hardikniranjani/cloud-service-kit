import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { AWSConfig } from "../types";

export function createS3Client(config: AWSConfig): S3Client {
    return new S3Client({
        region: config.region,
        credentials: {
            accessKeyId: config.accessKey,
            secretAccessKey: config.secretKey,
        },
    });
}

export async function uploadToS3(
    client: S3Client,
    bucket: string,
    buffer: Buffer,
    key: string,
    contentType: string,
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });

    await client.send(command);
    return key;
}
