# Extractor API

## Running locally

Install dependencies and start the server:

```bash
npm install
npm start
```

Run tests with coverage using:

```bash
npm test
```

### Required packages

The server relies on the following npm packages:

```
- express
- multer
- morgan
- cors
- mammoth
- libreoffice-convert
```

In addition, the `libreoffice-convert` package requires a local installation of
LibreOffice to perform the `.doc` to `.docx` conversion.

### LibreOffice on Linux

Install LibreOffice from your package manager. On Debian/Ubuntu run:

```bash
sudo apt-get update && sudo apt-get install libreoffice
```

Ensure the `soffice` binary is available in your `PATH` so that
`libreoffice-convert` can invoke it.

When deploying with [Nixpacks](https://nixpacks.com), the provided
`nixpacks.toml` installs LibreOffice automatically.

### Windows

Windows users can download LibreOffice from the
[official installer](https://www.libreoffice.org/download/download/).
After installation, add the directory containing the `soffice` binary to your
`PATH` environment variable so that `libreoffice-convert` can locate it.


## Example usage

Upload one or more `.doc` or `.docx` files using the field name `file`. An optional `chunk` query parameter splits the returned text into chunks of the given size.

```bash
# Single upload
curl -F "file=@sample.docx" "http://localhost:8000/extract"

# Multiple uploads
curl -F "file=@sample.docx" -F "file=@sample2.doc" "http://localhost:8000/extract?chunk=1000"
```

## Environment variables

`MAX_CONCURRENT_UPLOADS` sets the number of simultaneous uploads the server will process at once. It defaults to `5` if unspecified.
