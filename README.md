# Extractor API

## Running locally


Install dependencies and start the server:

```bash
npm install
npm start
```

## Dependencies

This API relies on `mammoth` for `.docx` files. Legacy `.doc` files are first
converted to `.docx` using the `soffice` command from LibreOffice when
available. If the conversion fails, the server falls back to using `textract`,
which in turn requires tools like `antiword` to be installed.

To enable the conversion approach, ensure that LibreOffice is installed and the
`soffice` binary is in your `PATH`. Otherwise you will need `antiword` or a
similar utility for `textract` to process `.doc` files. On Debian-based systems:
```bash
sudo apt-get install libreoffice
# or fallback
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
