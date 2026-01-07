import requests
import json

BASE_URL = "http://localhost:8000/api/auth"

def test_auth():
    # 1. Register
    print("Testing Registration...")
    register_data = {
        "username": "testuser_verif",
        "email": "testuser_verif@example.com",
        "password": "VerifyPassword123!",
        "role": "LOCATAIRE",
        "first_name": "Test",
        "last_name": "User"
    }
    
    # Try register, if exists (400), we proceed to login
    try:
        response = requests.post(f"{BASE_URL}/register/", json=register_data)
        if response.status_code == 201:
            print("Registration Successful:", response.json())
        elif response.status_code == 400 and "username" in response.json():
             print("User already exists, proceeding to login.")
        else:
            print(f"Registration Failed: {response.status_code}", response.text)
            return
    except Exception as e:
        print(f"Registration Error: {e}")
        return

    # 2. Login
    print("\nTesting Login...")
    login_data = {
        "username": "testuser_verif",
        "password": "VerifyPassword123!"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/token/", json=login_data)
        if response.status_code == 200:
            print("Login Successful")
            tokens = response.json()
            access_token = tokens['access']
            print(f"Access Token retrieved (len={len(access_token)})")
        else:
            print(f"Login Failed: {response.status_code}", response.text)
            return
    except Exception as e:
        print(f"Login Error: {e}")
        return

    # 3. Get Profile
    print("\nTesting Get Profile...")
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/profile/", headers=headers)
        if response.status_code == 200:
            print("Profile Retrieved:", response.json())
        else:
            print(f"Get Profile Failed: {response.status_code}", response.text)
            return
    except Exception as e:
        print(f"Profile Error: {e}")
        return

    # 4. Update Profile
    print("\nTesting Update Profile...")
    update_data = {
        "first_name": "UpdatedName"
    }
    
    try:
        response = requests.patch(f"{BASE_URL}/profile/", json=update_data, headers=headers)
        if response.status_code == 200:
            print("Profile Updated:", response.json())
            if response.json()['first_name'] == "UpdatedName":
                print("Verification PASSED!")
            else:
                print("Verification FAILED: Name not updated.")
        else:
            print(f"Update Profile Failed: {response.status_code}", response.text)
    except Exception as e:
        print(f"Update Error: {e}")

if __name__ == "__main__":
    test_auth()
