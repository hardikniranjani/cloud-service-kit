# cloud-service-kit

A modular cloud service toolkit for Node.js. Handles S3 media uploads, with support for more services (email, etc.) coming soon.

## Installation

```bash
npm install cloud-service-kit
```

## Prerequisites

- Node.js >= 18.0.0
- AWS S3 bucket with access credentials

## Quick Start

```typescript
import { S3MediaClient } from "cloud-service-kit";

const s3 = new S3MediaClient({
  aws: {
    region: "us-east-1",
    bucket: "your-bucket-name",
    accessKey: "YOUR_AWS_ACCESS_KEY",
    secretKey: "YOUR_AWS_SECRET_KEY",
  },
});

// Upload image from a live URL
const result = await s3.media.uploadFromUrl("https://example.com/photo.jpg", {
  folder: "uploads",
});

// Upload from buffer (e.g. Express + multer)
const result2 = await s3.media.uploadBuffer(fileBuffer, {
  contentType: "image/jpeg",
  folder: "user-uploads",
});

console.log(result.url); // Full S3 URL
```

## Setup

### Using environment variables (recommended)

```typescript
import { S3MediaClient } from "cloud-service-kit";

const s3 = new S3MediaClient({
  aws: {
    region: process.env.AWS_REGION!,
    bucket: process.env.AWS_BUCKET!,
    accessKey: process.env.AWS_ACCESS_KEY!,
    secretKey: process.env.AWS_SECRET_KEY!,
  },
});
```

> Initialize once at app startup and reuse the instance throughout your application.

---

## Modules

### Media Module

Handles fetching images from URLs or accepting buffers and uploading them to AWS S3.

#### `s3.media.uploadFromUrl(url, options?)`

Fetches an image from a live URL and uploads it to S3.

```typescript
const result = await s3.media.uploadFromUrl("https://example.com/photo.jpg");
```

With options:

```typescript
const result = await s3.media.uploadFromUrl("https://example.com/photo.jpg", {
  folder: "uploads",                // S3 folder prefix
  key: "custom/path/photo.jpg",     // or provide a full custom key
  contentType: "image/jpeg",        // override auto-detected content type
});
```

**Parameters:**

| Parameter             | Type     | Required | Description                                                  |
| --------------------- | -------- | -------- | ------------------------------------------------------------ |
| `url`                 | `string` | Yes      | The live URL to fetch the image from                         |
| `options.key`         | `string` | No       | Custom S3 key. If omitted, a UUID-based key is auto-generated |
| `options.folder`      | `string` | No       | S3 folder prefix (e.g. `"uploads"`). Ignored if `key` is set |
| `options.contentType` | `string` | No       | MIME type override. Auto-detected from response headers      |

---

#### `s3.media.uploadBuffer(buffer, options?)`

Uploads a Buffer directly to S3. Useful for file uploads via multer/express.

```typescript
// Example with Express + multer
app.post("/upload", upload.single("image"), async (req, res) => {
  const result = await s3.media.uploadBuffer(req.file.buffer, {
    contentType: req.file.mimetype,
    folder: "user-uploads",
  });
  res.json(result);
});
```

**Parameters:**

| Parameter             | Type     | Required | Description                                                  |
| --------------------- | -------- | -------- | ------------------------------------------------------------ |
| `buffer`              | `Buffer` | Yes      | The file buffer to upload                                    |
| `options.key`         | `string` | No       | Custom S3 key. If omitted, a UUID-based key is auto-generated |
| `options.folder`      | `string` | No       | S3 folder prefix. Ignored if `key` is set                    |
| `options.contentType` | `string` | No       | MIME type. Defaults to `"application/octet-stream"`          |

---

#### Response Format

Both methods return a `MediaUploadResponse`:

```typescript
{
  key: "uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
  url: "https://your-bucket.s3.us-east-1.amazonaws.com/uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
  bucket: "your-bucket-name",
  contentType: "image/jpeg",
  size: 102400
}
```

| Field         | Type     | Description                          |
| ------------- | -------- | ------------------------------------ |
| `key`         | `string` | The S3 object key                    |
| `url`         | `string` | Full public S3 URL                   |
| `bucket`      | `string` | S3 bucket name                       |
| `contentType` | `string` | MIME content type of the file        |
| `size`        | `number` | File size in bytes                   |

---

## Exports

```typescript
import {
  S3MediaClient,        // Main S3 client class
  S3MediaConfig,        // Configuration interface
  AWSConfig,            // AWS credentials interface
  MediaUploadOptions,   // Upload options
  MediaUploadResponse,  // Upload response
} from "cloud-service-kit";
```

## How It Works

1. **Initialization** — `new S3MediaClient(config)` creates an internal S3 client using your AWS credentials.
2. **Upload from URL** — `uploadFromUrl` uses native `fetch()` to download the image, auto-detects content type from response headers, generates a UUID-based S3 key (or uses your custom key), and uploads the buffer to S3.
3. **Upload from Buffer** — `uploadBuffer` takes a raw Buffer (e.g. from multer) and uploads it directly to S3.
4. **Key generation** — When no custom key is provided, a UUID is generated using `crypto.randomUUID()` and the file extension is resolved from the source URL or content type.

## Upcoming Modules

This toolkit is designed to be extended with more service modules:

- **S3 Media** — Available now
- **Email** — Coming soon
- **More** — Additional cloud services planned

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run structure tests
node test.js
```

## Publishing

```bash
npm login
npm publish
npm info cloud-service-kit
```

## License

MIT
