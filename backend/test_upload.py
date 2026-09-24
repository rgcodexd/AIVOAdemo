import requests

url = "http://127.0.0.1:8000/api/upload-document"
files = {'file': ('sample_deviation.pdf', open('d:/Project/AIVOAdemo/test/sample_deviation.pdf', 'rb'), 'application/pdf')}
response = requests.post(url, files=files)
print(response.status_code)
print(response.json())
