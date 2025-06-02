# Extractor API

## Running locally

Install dependencies and start the server:

```bash
npm install
npm start
```

## Example usage

Upload one or more `.doc` or `.docx` files. An optional `chunk` query parameter splits the returned text into chunks of the given size.

```bash
curl -F "files=@sample.docx" -F "files=@sample2.doc" "http://localhost:8000/extract?chunk=1000"
```
