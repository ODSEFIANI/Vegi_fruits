#!/usr/bin/env python3

import base64

email = "client2@example.com"
password = "clientclient"

# Concatenate email and password with a colon
credentials = f"{email}:{password}"

# Encode the concatenated string to Base64
base64_credentials = base64.b64encode(credentials.encode()).decode()

print(base64_credentials)