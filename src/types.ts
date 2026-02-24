export interface AWSConfig {
    region: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
}

export interface S3MediaConfig {
    aws: AWSConfig;
}
