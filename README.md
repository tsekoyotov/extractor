# Extractor API

## Running locally


Install dependencies and start the server:

```bash
npm install
npm start
```

## Dependencies

This API relies on `mammoth` and `textract` for parsing `.docx` and `.doc` files. When processing legacy `.doc` files, `textract` requires external utilities such as `antiword` to be available in your system `PATH`.

You may need to install `antiword` or a similar tool separately. On Debian-based systems:
```bash
sudo apt-get install antiword
```

## Example usage

Upload one or more `.doc` or `.docx` files using the field name `file`. An optional `chunk` query parameter splits the returned text into chunks of the given size.

```bash
# Single upload
curl -F "file=@sample.docx" "http://localhost:8000/extract"

# Multiple uploads
curl -F "file=@sample.docx" -F "file=@sample2.doc" "http://localhost:8000/extract?chunk=1000"
```
