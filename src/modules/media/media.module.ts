import { S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";
import { AWSConfig } from "../../types";
import { uploadToS3 } from "../../lib/s3.client";
import { MediaUploadOptions, MediaUploadResponse } from "./media.types";

export class MediaModule {
    private s3Client: S3Client;
    private awsConfig: AWSConfig;

    constructor(s3Client: S3Client, awsConfig: AWSConfig) {
        this.s3Client = s3Client;
        this.awsConfig = awsConfig;
    }

    /**
     * Fetch an image from a live URL and upload it to S3.
     */
    async uploadFromUrl(
        url: string,
        options: MediaUploadOptions = {},
    ): Promise<MediaUploadResponse> {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Failed to fetch image from URL: ${response.status} ${response.statusText}`,
            );
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType =
            options.contentType ||
            response.headers.get("content-type") ||
            "application/octet-stream";

        const key = options.key || this.generateKey(options.folder, url, contentType);

        await uploadToS3(this.s3Client, this.awsConfig.bucket, buffer, key, contentType);

        return {
            key,
            url: this.buildS3Url(key),
            bucket: this.awsConfig.bucket,
            contentType,
            size: buffer.length,
        };
    }

    /**
     * Upload a buffer (e.g. from multer file upload) directly to S3.
     */
    async uploadBuffer(
        buffer: Buffer,
        options: MediaUploadOptions = {},
    ): Promise<MediaUploadResponse> {
        const contentType = options.contentType || "application/octet-stream";
        const key = options.key || this.generateKey(options.folder, undefined, contentType);

        await uploadToS3(this.s3Client, this.awsConfig.bucket, buffer, key, contentType);

        return {
            key,
            url: this.buildS3Url(key),
            bucket: this.awsConfig.bucket,
            contentType,
            size: buffer.length,
        };
    }

    private generateKey(folder?: string, sourceUrl?: string, contentType?: string): string {
        const uuid = crypto.randomUUID();
        const ext = this.resolveExtension(sourceUrl, contentType);
        const filename = `${uuid}${ext}`;
        return folder ? `${folder}/${filename}` : filename;
    }

    private resolveExtension(sourceUrl?: string, contentType?: string): string {
        // Try to get extension from the source URL
        if (sourceUrl) {
            try {
                const pathname = new URL(sourceUrl).pathname;
                const ext = path.extname(pathname);
                if (ext) return ext;
            } catch {
                // invalid URL, fall through
            }
        }

        // Fall back to content type
        const mimeToExt: Record<string, string> = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/gif": ".gif",
            "image/webp": ".webp",
            "image/svg+xml": ".svg",
            "image/bmp": ".bmp",
            "image/tiff": ".tiff",
        };

        if (contentType && mimeToExt[contentType]) {
            return mimeToExt[contentType];
        }

        return "";
    }

    private buildS3Url(key: string): string {
        return `https://${this.awsConfig.bucket}.s3.${this.awsConfig.region}.amazonaws.com/${key}`;
    }
}
