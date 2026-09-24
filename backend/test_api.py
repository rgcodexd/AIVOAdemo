import requests

# Test /api/extract-deviation
url_extract = "http://127.0.0.1:8000/api/extract-deviation"
payload = {
    "text": "This is a test deviation from the text box.",
    "current_state": {}
}
response_extract = requests.post(url_extract, json=payload)
print("Extract Deviation Status:", response_extract.status_code)
if response_extract.status_code != 200:
    print(response_extract.text)

# Test /api/upload-document
url_upload = "http://127.0.0.1:8000/api/upload-document"
files = {'file': ('sample_deviation.pdf', open('d:/Project/AIVOAdemo/test/sample_deviation.pdf', 'rb'), 'application/pdf')}
response_upload = requests.post(url_upload, files=files)
print("Upload Document Status:", response_upload.status_code)
if response_upload.status_code != 200:
    print(response_upload.text)
