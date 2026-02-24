export interface MediaUploadOptions {
    /** Custom S3 key. If omitted, a UUID-based key is auto-generated. */
    key?: string;
    /** S3 folder prefix (e.g. "uploads"). Ignored if `key` is provided. */
    folder?: string;
    /** MIME content type (e.g. "image/jpeg"). Auto-detected for URL uploads. */
    contentType?: string;
}

export interface MediaUploadResponse {
    /** The S3 object key */
    key: string;
    /** Full S3 URL to the uploaded object */
    url: string;
    /** S3 bucket name */
    bucket: string;
    /** MIME content type of the uploaded file */
    contentType: string;
    /** File size in bytes */
    size: number;
}
