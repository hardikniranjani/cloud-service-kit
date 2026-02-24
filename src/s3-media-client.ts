import { S3Client } from "@aws-sdk/client-s3";
import { S3MediaConfig } from "./types";
import { createS3Client } from "./lib/s3.client";
import { MediaModule } from "./modules/media";

export class S3MediaClient {
    public readonly media: MediaModule;

    private s3Client: S3Client;

    constructor(config: S3MediaConfig) {
        this.s3Client = createS3Client(config.aws);
        this.media = new MediaModule(this.s3Client, config.aws);
    }
}
