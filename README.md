# Extractor API

## Running locally

Install dependencies and start the server:

```bash
npm install
npm start
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

## Example usage

Upload one or more `.doc` or `.docx` files using the field name `file`. An optional `chunk` query parameter splits the returned text into chunks of the given size.

```bash
# Single upload
curl -F "file=@sample.docx" "http://localhost:8000/extract"

# Multiple uploads
curl -F "file=@sample.docx" -F "file=@sample2.doc" "http://localhost:8000/extract?chunk=1000"
```
