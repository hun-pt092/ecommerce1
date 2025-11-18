import requests

username = input("Username: ")
password = input("Password: ")

url = "http://127.0.0.1:8000/api/token/"
data = {
    "username": username,
    "password": password
}

response = requests.post(url, json=data)

print("Status:", response.status_code)
print("Response:", response.json())
