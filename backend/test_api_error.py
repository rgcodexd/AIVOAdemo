import requests
import json

url_upload = "http://127.0.0.1:8000/api/upload-document"
files = {'file': ('sample_deviation.pdf', open('d:/Project/AIVOAdemo/test/sample_deviation.pdf', 'rb'), 'application/pdf')}
response_upload = requests.post(url_upload, files=files)
with open("upload_error.json", "w", encoding="utf-8") as f:
    f.write(response_upload.text)
