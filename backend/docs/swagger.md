---
title: Go-Shisha API v1.0
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
highlight_theme: darkula
headingLevel: 2

---

<!-- Generator: Widdershins v4.0.1 -->

<h1 id="go-shisha-api">Go-Shisha API v1.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

シーシャSNSアプリケーションのバックエンドAPI
このAPIはシーシャの投稿、ユーザー管理を行います

Base URLs:

* <a href="http://localhost:8080/api/v1">http://localhost:8080/api/v1</a>

Web: <a href="https://github.com/illionillion/go-shisha">API Support</a> 

# Authentication

* API Key (BearerAuth)
    - Parameter Name: **Authorization**, in: header. 

<h1 id="go-shisha-api-auth">auth</h1>

## post__auth_login

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST http://localhost:8080/api/v1/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "email": "string",
  "password": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:8080/api/v1/auth/login',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post 'http://localhost:8080/api/v1/auth/login',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('http://localhost:8080/api/v1/auth/login', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:8080/api/v1/auth/login', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/auth/login");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:8080/api/v1/auth/login", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /auth/login`

*ログイン*

メールアドレスとパスワードでログインし、JWT（Cookie）を発行する

> Body parameter

```json
{
  "email": "string",
  "password": "string"
}
```

<h3 id="post__auth_login-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[go-shisha-backend_internal_models.LoginInput](#schemago-shisha-backend_internal_models.logininput)|true|ログイン情報|

> Example responses

> 200 Response

```json
{
  "user": {
    "description": "string",
    "display_name": "string",
    "email": "string",
    "external_url": "string",
    "icon_url": "string",
    "id": 0
  }
}
```

<h3 id="post__auth_login-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ログイン成功|[go-shisha-backend_internal_models.AuthResponse](#schemago-shisha-backend_internal_models.authresponse)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|バリデーションエラー|[go-shisha-backend_internal_models.ValidationError](#schemago-shisha-backend_internal_models.validationerror)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|認証失敗|[go-shisha-backend_internal_models.UnauthorizedError](#schemago-shisha-backend_internal_models.unauthorizederror)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|サーバーエラー|[go-shisha-backend_internal_models.ServerError](#schemago-shisha-backend_internal_models.servererror)|

<aside class="success">
This operation does not require authentication
</aside>

## post__auth_logout

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H 'Accept: application/json' \
  -H 'Authorization: API_KEY'

```

```http
POST http://localhost:8080/api/v1/auth/logout HTTP/1.1
Host: localhost:8080
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('http://localhost:8080/api/v1/auth/logout',
{
  method: 'POST',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'API_KEY'
}

result = RestClient.post 'http://localhost:8080/api/v1/auth/logout',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'API_KEY'
}

r = requests.post('http://localhost:8080/api/v1/auth/logout', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'API_KEY',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:8080/api/v1/auth/logout', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/auth/logout");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"API_KEY"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:8080/api/v1/auth/logout", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /auth/logout`

*ログアウト*

Cookieを削除し、Refresh Tokenを無効化する

> Example responses

> 200 Response

```json
{
  "property1": "string",
  "property2": "string"
}
```

<h3 id="post__auth_logout-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ログアウト成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|認証失敗|[go-shisha-backend_internal_models.UnauthorizedError](#schemago-shisha-backend_internal_models.unauthorizederror)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|サーバーエラー|[go-shisha-backend_internal_models.ServerError](#schemago-shisha-backend_internal_models.servererror)|

<h3 id="post__auth_logout-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» **additionalProperties**|string|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
BearerAuth
</aside>

## get__auth_me

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H 'Accept: application/json' \
  -H 'Authorization: API_KEY'

```

```http
GET http://localhost:8080/api/v1/auth/me HTTP/1.1
Host: localhost:8080
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('http://localhost:8080/api/v1/auth/me',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'API_KEY'
}

result = RestClient.get 'http://localhost:8080/api/v1/auth/me',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'API_KEY'
}

r = requests.get('http://localhost:8080/api/v1/auth/me', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'API_KEY',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:8080/api/v1/auth/me', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/auth/me");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"API_KEY"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:8080/api/v1/auth/me", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /auth/me`

*現在のユーザー情報取得*

認証されたユーザーの情報を取得する

> Example responses

> 200 Response

```json
{
  "user": {
    "description": "string",
    "display_name": "string",
    "email": "string",
    "external_url": "string",
    "icon_url": "string",
    "id": 0
  }
}
```

<h3 id="get__auth_me-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ユーザー情報|[go-shisha-backend_internal_models.AuthResponse](#schemago-shisha-backend_internal_models.authresponse)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|認証失敗|[go-shisha-backend_internal_models.UnauthorizedError](#schemago-shisha-backend_internal_models.unauthorizederror)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|サーバーエラー|[go-shisha-backend_internal_models.ServerError](#schemago-shisha-backend_internal_models.servererror)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
BearerAuth
</aside>

## post__auth_refresh

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H 'Accept: application/json'

```

```http
POST http://localhost:8080/api/v1/auth/refresh HTTP/1.1
Host: localhost:8080
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('http://localhost:8080/api/v1/auth/refresh',
{
  method: 'POST',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.post 'http://localhost:8080/api/v1/auth/refresh',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.post('http://localhost:8080/api/v1/auth/refresh', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:8080/api/v1/auth/refresh', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/auth/refresh");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:8080/api/v1/auth/refresh", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /auth/refresh`

*アクセストークンのリフレッシュ*

Refresh Tokenを使って新しいAccess Tokenを発行する

> Example responses

> 200 Response

```json
{
  "property1": "string",
  "property2": "string"
}
```

<h3 id="post__auth_refresh-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|リフレッシュ成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|認証失敗|[go-shisha-backend_internal_models.UnauthorizedError](#schemago-shisha-backend_internal_models.unauthorizederror)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|サーバーエラー|[go-shisha-backend_internal_models.ServerError](#schemago-shisha-backend_internal_models.servererror)|

<h3 id="post__auth_refresh-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» **additionalProperties**|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## post__auth_register

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST http://localhost:8080/api/v1/auth/register HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "display_name": "string",
  "email": "string",
  "password": "stringstring"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:8080/api/v1/auth/register',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post 'http://localhost:8080/api/v1/auth/register',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('http://localhost:8080/api/v1/auth/register', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:8080/api/v1/auth/register', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/auth/register");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:8080/api/v1/auth/register", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /auth/register`

*ユーザー登録*

新しいユーザーを登録する

> Body parameter

```json
{
  "display_name": "string",
  "email": "string",
  "password": "stringstring"
}
```

<h3 id="post__auth_register-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[go-shisha-backend_internal_models.CreateUserInput](#schemago-shisha-backend_internal_models.createuserinput)|true|ユーザー登録情報|

> Example responses

> 201 Response

```json
{
  "user": {
    "description": "string",
    "display_name": "string",
    "email": "string",
    "external_url": "string",
    "icon_url": "string",
    "id": 0
  }
}
```

<h3 id="post__auth_register-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|登録成功|[go-shisha-backend_internal_models.AuthResponse](#schemago-shisha-backend_internal_models.authresponse)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|バリデーションエラー|[go-shisha-backend_internal_models.ValidationError](#schemago-shisha-backend_internal_models.validationerror)|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|メールアドレス重複|[go-shisha-backend_internal_models.ConflictError](#schemago-shisha-backend_internal_models.conflicterror)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|サーバーエラー|[go-shisha-backend_internal_models.ServerError](#schemago-shisha-backend_internal_models.servererror)|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="go-shisha-api-flavors">flavors</h1>

## get__flavors

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:8080/api/v1/flavors \
  -H 'Accept: application/json'

```

```http
GET http://localhost:8080/api/v1/flavors HTTP/1.1
Host: localhost:8080
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('http://localhost:8080/api/v1/flavors',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get 'http://localhost:8080/api/v1/flavors',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('http://localhost:8080/api/v1/flavors', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:8080/api/v1/flavors', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/flavors");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:8080/api/v1/flavors", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /flavors`

*フレーバー一覧取得*

全てのフレーバーの一覧を取得します

> Example responses

> 200 Response

```json
[
  {
    "color": "string",
    "id": 0,
    "name": "string"
  }
]
```

<h3 id="get__flavors-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|フレーバー一覧|Inline|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|サーバーエラー|Inline|

<h3 id="get__flavors-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|*anonymous*|[[go-shisha-backend_internal_models.Flavor](#schemago-shisha-backend_internal_models.flavor)]|false|none|none|
|» color|string|false|none|none|
|» id|integer|false|none|none|
|» name|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="go-shisha-api-posts">posts</h1>

## get__posts

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:8080/api/v1/posts \
  -H 'Accept: application/json'

```

```http
GET http://localhost:8080/api/v1/posts HTTP/1.1
Host: localhost:8080
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('http://localhost:8080/api/v1/posts',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get 'http://localhost:8080/api/v1/posts',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('http://localhost:8080/api/v1/posts', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:8080/api/v1/posts', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/posts");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:8080/api/v1/posts", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /posts`

*投稿一覧取得*

全ての投稿の一覧を取得します（総数付き）。認証済みの場合、各投稿のいいね状態（is_liked）を含みます

> Example responses

> 200 Response

```json
{
  "posts": [
    {
      "created_at": "string",
      "id": 0,
      "is_liked": true,
      "likes": 0,
      "slides": [
        {
          "flavor": {
            "color": "string",
            "id": 0,
            "name": "string"
          },
          "image_url": "string",
          "text": "string"
        }
      ],
      "user": {
        "description": "string",
        "display_name": "string",
        "email": "string",
        "external_url": "string",
        "icon_url": "string",
        "id": 0
      },
      "user_id": 0
    }
  ],
  "total": 0
}
```

<h3 id="get__posts-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|投稿一覧と総数|[go-shisha-backend_internal_models.PostsResponse](#schemago-shisha-backend_internal_models.postsresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|サーバーエラー|[go-shisha-backend_internal_models.ServerError](#schemago-shisha-backend_internal_models.servererror)|

<aside class="success">
This operation does not require authentication
</aside>

## post__posts

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:8080/api/v1/posts \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: API_KEY'

```

```http
POST http://localhost:8080/api/v1/posts HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "slides": [
    {
      "flavor_id": 0,
      "image_url": "string",
      "text": "string"
    }
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('http://localhost:8080/api/v1/posts',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'API_KEY'
}

result = RestClient.post 'http://localhost:8080/api/v1/posts',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'API_KEY'
}

r = requests.post('http://localhost:8080/api/v1/posts', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'API_KEY',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:8080/api/v1/posts', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/posts");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"API_KEY"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:8080/api/v1/posts", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /posts`

*投稿作成*

新しい投稿を作成します（認証必須）。注意: slides内のflavor_idが無効な場合、そのスライドはFlavorなしで作成されます（エラーにはなりません）

> Body parameter

```json
{
  "slides": [
    {
      "flavor_id": 0,
      "image_url": "string",
      "text": "string"
    }
  ]
}
```

<h3 id="post__posts-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[go-shisha-backend_internal_models.CreatePostInput](#schemago-shisha-backend_internal_models.createpostinput)|true|投稿情報|

> Example responses

> 201 Response

```json
{
  "created_at": "string",
  "id": 0,
  "is_liked": true,
  "likes": 0,
  "slides": [
    {
      "flavor": {
        "color": "string",
        "id": 0,
        "name": "string"
      },
      "image_url": "string",
      "text": "string"
    }
  ],
  "user": {
    "description": "string",
    "display_name": "string",
    "email": "string",
    "external_url": "string",
    "icon_url": "string",
    "id": 0
  },
  "user_id": 0
}
```

<h3 id="post__posts-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|作成された投稿|[go-shisha-backend_internal_models.Post](#schemago-shisha-backend_internal_models.post)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|バリデーションエラー|[go-shisha-backend_internal_models.ValidationError](#schemago-shisha-backend_internal_models.validationerror)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|認証エラー|[go-shisha-backend_internal_models.UnauthorizedError](#schemago-shisha-backend_internal_models.unauthorizederror)|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|権限エラー|[go-shisha-backend_internal_models.ForbiddenError](#schemago-shisha-backend_internal_models.forbiddenerror)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|リソースが見つからない|[go-shisha-backend_internal_models.NotFoundError](#schemago-shisha-backend_internal_models.notfounderror)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|サーバーエラー|[go-shisha-backend_internal_models.ServerError](#schemago-shisha-backend_internal_models.servererror)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
BearerAuth
</aside>

## get__posts_{id}

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:8080/api/v1/posts/{id} \
  -H 'Accept: application/json'

```

```http
GET http://localhost:8080/api/v1/posts/{id} HTTP/1.1
Host: localhost:8080
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('http://localhost:8080/api/v1/posts/{id}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get 'http://localhost:8080/api/v1/posts/{id}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('http://localhost:8080/api/v1/posts/{id}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:8080/api/v1/posts/{id}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/posts/{id}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:8080/api/v1/posts/{id}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /posts/{id}`

*投稿詳細取得*

指定されたIDの投稿情報を取得します。認証済みの場合、いいね状態（is_liked）を含みます

<h3 id="get__posts_{id}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|投稿ID|

> Example responses

> 200 Response

```json
{
  "created_at": "string",
  "id": 0,
  "is_liked": true,
  "likes": 0,
  "slides": [
    {
      "flavor": {
        "color": "string",
        "id": 0,
        "name": "string"
      },
      "image_url": "string",
      "text": "string"
    }
  ],
  "user": {
    "description": "string",
    "display_name": "string",
    "email": "string",
    "external_url": "string",
    "icon_url": "string",
    "id": 0
  },
  "user_id": 0
}
```

<h3 id="get__posts_{id}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|投稿情報|[go-shisha-backend_internal_models.Post](#schemago-shisha-backend_internal_models.post)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|無効な投稿ID|[go-shisha-backend_internal_models.ValidationError](#schemago-shisha-backend_internal_models.validationerror)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|投稿が見つかりません|[go-shisha-backend_internal_models.NotFoundError](#schemago-shisha-backend_internal_models.notfounderror)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|サーバーエラー|[go-shisha-backend_internal_models.ServerError](#schemago-shisha-backend_internal_models.servererror)|

<aside class="success">
This operation does not require authentication
</aside>

## post__posts_{id}_like

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:8080/api/v1/posts/{id}/like \
  -H 'Accept: application/json' \
  -H 'Authorization: API_KEY'

```

```http
POST http://localhost:8080/api/v1/posts/{id}/like HTTP/1.1
Host: localhost:8080
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('http://localhost:8080/api/v1/posts/{id}/like',
{
  method: 'POST',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'API_KEY'
}

result = RestClient.post 'http://localhost:8080/api/v1/posts/{id}/like',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'API_KEY'
}

r = requests.post('http://localhost:8080/api/v1/posts/{id}/like', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'API_KEY',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:8080/api/v1/posts/{id}/like', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/posts/{id}/like");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"API_KEY"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:8080/api/v1/posts/{id}/like", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /posts/{id}/like`

*投稿にいいね*

指定された投稿にいいねを追加します（認証必須）

<h3 id="post__posts_{id}_like-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|投稿ID|

> Example responses

> 200 Response

```json
{
  "created_at": "string",
  "id": 0,
  "is_liked": true,
  "likes": 0,
  "slides": [
    {
      "flavor": {
        "color": "string",
        "id": 0,
        "name": "string"
      },
      "image_url": "string",
      "text": "string"
    }
  ],
  "user": {
    "description": "string",
    "display_name": "string",
    "email": "string",
    "external_url": "string",
    "icon_url": "string",
    "id": 0
  },
  "user_id": 0
}
```

<h3 id="post__posts_{id}_like-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|いいねが追加された投稿|[go-shisha-backend_internal_models.Post](#schemago-shisha-backend_internal_models.post)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|無効な投稿ID|[go-shisha-backend_internal_models.ValidationError](#schemago-shisha-backend_internal_models.validationerror)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|認証エラー|[go-shisha-backend_internal_models.UnauthorizedError](#schemago-shisha-backend_internal_models.unauthorizederror)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|投稿が見つかりません|[go-shisha-backend_internal_models.NotFoundError](#schemago-shisha-backend_internal_models.notfounderror)|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|既にいいね済み|[go-shisha-backend_internal_models.ConflictError](#schemago-shisha-backend_internal_models.conflicterror)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|サーバーエラー|[go-shisha-backend_internal_models.ServerError](#schemago-shisha-backend_internal_models.servererror)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
BearerAuth
</aside>

## post__posts_{id}_unlike

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:8080/api/v1/posts/{id}/unlike \
  -H 'Accept: application/json' \
  -H 'Authorization: API_KEY'

```

```http
POST http://localhost:8080/api/v1/posts/{id}/unlike HTTP/1.1
Host: localhost:8080
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('http://localhost:8080/api/v1/posts/{id}/unlike',
{
  method: 'POST',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'API_KEY'
}

result = RestClient.post 'http://localhost:8080/api/v1/posts/{id}/unlike',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'API_KEY'
}

r = requests.post('http://localhost:8080/api/v1/posts/{id}/unlike', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'API_KEY',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:8080/api/v1/posts/{id}/unlike', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/posts/{id}/unlike");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"API_KEY"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:8080/api/v1/posts/{id}/unlike", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /posts/{id}/unlike`

*投稿のいいねを取り消す*

指定された投稿のいいねを取り消します（認証必須）

<h3 id="post__posts_{id}_unlike-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|投稿ID|

> Example responses

> 200 Response

```json
{
  "created_at": "string",
  "id": 0,
  "is_liked": true,
  "likes": 0,
  "slides": [
    {
      "flavor": {
        "color": "string",
        "id": 0,
        "name": "string"
      },
      "image_url": "string",
      "text": "string"
    }
  ],
  "user": {
    "description": "string",
    "display_name": "string",
    "email": "string",
    "external_url": "string",
    "icon_url": "string",
    "id": 0
  },
  "user_id": 0
}
```

<h3 id="post__posts_{id}_unlike-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|いいねが取り消された投稿|[go-shisha-backend_internal_models.Post](#schemago-shisha-backend_internal_models.post)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|無効な投稿ID|[go-shisha-backend_internal_models.ValidationError](#schemago-shisha-backend_internal_models.validationerror)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|認証エラー|[go-shisha-backend_internal_models.UnauthorizedError](#schemago-shisha-backend_internal_models.unauthorizederror)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|投稿が見つかりません|[go-shisha-backend_internal_models.NotFoundError](#schemago-shisha-backend_internal_models.notfounderror)|
|409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|いいねしていない投稿|[go-shisha-backend_internal_models.ConflictError](#schemago-shisha-backend_internal_models.conflicterror)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|サーバーエラー|[go-shisha-backend_internal_models.ServerError](#schemago-shisha-backend_internal_models.servererror)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
BearerAuth
</aside>

<h1 id="go-shisha-api-uploads">uploads</h1>

## post__uploads_images

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:8080/api/v1/uploads/images \
  -H 'Content-Type: multipart/form-data' \
  -H 'Accept: application/json' \
  -H 'Authorization: API_KEY'

```

```http
POST http://localhost:8080/api/v1/uploads/images HTTP/1.1
Host: localhost:8080
Content-Type: multipart/form-data
Accept: application/json

```

```javascript
const inputBody = '{
  "images": "string"
}';
const headers = {
  'Content-Type':'multipart/form-data',
  'Accept':'application/json',
  'Authorization':'API_KEY'
};

fetch('http://localhost:8080/api/v1/uploads/images',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'multipart/form-data',
  'Accept' => 'application/json',
  'Authorization' => 'API_KEY'
}

result = RestClient.post 'http://localhost:8080/api/v1/uploads/images',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'multipart/form-data',
  'Accept': 'application/json',
  'Authorization': 'API_KEY'
}

r = requests.post('http://localhost:8080/api/v1/uploads/images', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'multipart/form-data',
    'Accept' => 'application/json',
    'Authorization' => 'API_KEY',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:8080/api/v1/uploads/images', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/uploads/images");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"multipart/form-data"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"API_KEY"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:8080/api/v1/uploads/images", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /uploads/images`

*画像アップロード*

複数の画像を一括アップロードし、保存されたURLの配列を返却します

> Body parameter

```yaml
images: string

```

<h3 id="post__uploads_images-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» images|body|string(binary)|true|アップロードする画像（複数可）|

> Example responses

> 200 Response

```json
{
  "urls": [
    "string"
  ]
}
```

<h3 id="post__uploads_images-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[go-shisha-backend_internal_models.UploadImagesResponse](#schemago-shisha-backend_internal_models.uploadimagesresponse)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|バリデーションエラー|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|認証エラー|Inline|
|413|[Payload Too Large](https://tools.ietf.org/html/rfc7231#section-6.5.11)|ファイルサイズ超過|Inline|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|サーバーエラー|Inline|

<h3 id="post__uploads_images-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
BearerAuth
</aside>

<h1 id="go-shisha-api-users">users</h1>

## get__users

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:8080/api/v1/users \
  -H 'Accept: application/json'

```

```http
GET http://localhost:8080/api/v1/users HTTP/1.1
Host: localhost:8080
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('http://localhost:8080/api/v1/users',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get 'http://localhost:8080/api/v1/users',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('http://localhost:8080/api/v1/users', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:8080/api/v1/users', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/users");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:8080/api/v1/users", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /users`

*ユーザー一覧取得*

全てのユーザーの一覧を取得します（総数付き）

> Example responses

> 200 Response

```json
{
  "total": 0,
  "users": [
    {
      "description": "string",
      "display_name": "string",
      "email": "string",
      "external_url": "string",
      "icon_url": "string",
      "id": 0
    }
  ]
}
```

<h3 id="get__users-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ユーザー一覧と総数|[go-shisha-backend_internal_models.UsersResponse](#schemago-shisha-backend_internal_models.usersresponse)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|サーバーエラー|Inline|

<h3 id="get__users-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## get__users_{id}

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:8080/api/v1/users/{id} \
  -H 'Accept: application/json'

```

```http
GET http://localhost:8080/api/v1/users/{id} HTTP/1.1
Host: localhost:8080
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('http://localhost:8080/api/v1/users/{id}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get 'http://localhost:8080/api/v1/users/{id}',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('http://localhost:8080/api/v1/users/{id}', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:8080/api/v1/users/{id}', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/users/{id}");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:8080/api/v1/users/{id}", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /users/{id}`

*ユーザー詳細取得*

指定されたIDのユーザー情報を取得します

<h3 id="get__users_{id}-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|ユーザーID|

> Example responses

> 200 Response

```json
{
  "description": "string",
  "display_name": "string",
  "email": "string",
  "external_url": "string",
  "icon_url": "string",
  "id": 0
}
```

<h3 id="get__users_{id}-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|ユーザー情報|[go-shisha-backend_internal_models.User](#schemago-shisha-backend_internal_models.user)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|無効なユーザーID|Inline|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|ユーザーが見つかりません|Inline|

<h3 id="get__users_{id}-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## get__users_{id}_posts

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:8080/api/v1/users/{id}/posts \
  -H 'Accept: application/json'

```

```http
GET http://localhost:8080/api/v1/users/{id}/posts HTTP/1.1
Host: localhost:8080
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('http://localhost:8080/api/v1/users/{id}/posts',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get 'http://localhost:8080/api/v1/users/{id}/posts',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('http://localhost:8080/api/v1/users/{id}/posts', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:8080/api/v1/users/{id}/posts', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:8080/api/v1/users/{id}/posts");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:8080/api/v1/users/{id}/posts", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /users/{id}/posts`

*ユーザーの投稿一覧取得*

指定されたユーザーの全ての投稿を取得します（総数付き）

<h3 id="get__users_{id}_posts-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer|true|ユーザーID|

> Example responses

> 200 Response

```json
{
  "posts": [
    {
      "created_at": "string",
      "id": 0,
      "is_liked": true,
      "likes": 0,
      "slides": [
        {
          "flavor": {
            "color": "string",
            "id": 0,
            "name": "string"
          },
          "image_url": "string",
          "text": "string"
        }
      ],
      "user": {
        "description": "string",
        "display_name": "string",
        "email": "string",
        "external_url": "string",
        "icon_url": "string",
        "id": 0
      },
      "user_id": 0
    }
  ],
  "total": 0
}
```

<h3 id="get__users_{id}_posts-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|投稿一覧と総数|[go-shisha-backend_internal_models.PostsResponse](#schemago-shisha-backend_internal_models.postsresponse)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|無効なユーザーID|Inline|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|ユーザーが見つかりません|Inline|

<h3 id="get__users_{id}_posts-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

# Schemas

<h2 id="tocS_go-shisha-backend_internal_models.AuthResponse">go-shisha-backend_internal_models.AuthResponse</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.authresponse"></a>
<a id="schema_go-shisha-backend_internal_models.AuthResponse"></a>
<a id="tocSgo-shisha-backend_internal_models.authresponse"></a>
<a id="tocsgo-shisha-backend_internal_models.authresponse"></a>

```json
{
  "user": {
    "description": "string",
    "display_name": "string",
    "email": "string",
    "external_url": "string",
    "icon_url": "string",
    "id": 0
  }
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|user|[go-shisha-backend_internal_models.User](#schemago-shisha-backend_internal_models.user)|false|none|none|

<h2 id="tocS_go-shisha-backend_internal_models.ConflictError">go-shisha-backend_internal_models.ConflictError</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.conflicterror"></a>
<a id="schema_go-shisha-backend_internal_models.ConflictError"></a>
<a id="tocSgo-shisha-backend_internal_models.conflicterror"></a>
<a id="tocsgo-shisha-backend_internal_models.conflicterror"></a>

```json
{
  "error": "already_liked"
}

```

リソース競合エラーレスポンス（メール重複・いいね重複・いいね未実施など）

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|error|string|true|none|エラー種別の識別子|

#### Enumerated Values

|Property|Value|
|---|---|
|error|email_already_exists|
|error|already_liked|
|error|not_liked|

<h2 id="tocS_go-shisha-backend_internal_models.CreatePostInput">go-shisha-backend_internal_models.CreatePostInput</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.createpostinput"></a>
<a id="schema_go-shisha-backend_internal_models.CreatePostInput"></a>
<a id="tocSgo-shisha-backend_internal_models.createpostinput"></a>
<a id="tocsgo-shisha-backend_internal_models.createpostinput"></a>

```json
{
  "slides": [
    {
      "flavor_id": 0,
      "image_url": "string",
      "text": "string"
    }
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|slides|[[go-shisha-backend_internal_models.SlideInput](#schemago-shisha-backend_internal_models.slideinput)]|true|none|none|

<h2 id="tocS_go-shisha-backend_internal_models.CreateUserInput">go-shisha-backend_internal_models.CreateUserInput</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.createuserinput"></a>
<a id="schema_go-shisha-backend_internal_models.CreateUserInput"></a>
<a id="tocSgo-shisha-backend_internal_models.createuserinput"></a>
<a id="tocsgo-shisha-backend_internal_models.createuserinput"></a>

```json
{
  "display_name": "string",
  "email": "string",
  "password": "stringstring"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|display_name|string|false|none|none|
|email|string|true|none|none|
|password|string|true|none|none|

<h2 id="tocS_go-shisha-backend_internal_models.Flavor">go-shisha-backend_internal_models.Flavor</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.flavor"></a>
<a id="schema_go-shisha-backend_internal_models.Flavor"></a>
<a id="tocSgo-shisha-backend_internal_models.flavor"></a>
<a id="tocsgo-shisha-backend_internal_models.flavor"></a>

```json
{
  "color": "string",
  "id": 0,
  "name": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|color|string|false|none|none|
|id|integer|false|none|none|
|name|string|false|none|none|

<h2 id="tocS_go-shisha-backend_internal_models.ForbiddenError">go-shisha-backend_internal_models.ForbiddenError</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.forbiddenerror"></a>
<a id="schema_go-shisha-backend_internal_models.ForbiddenError"></a>
<a id="tocSgo-shisha-backend_internal_models.forbiddenerror"></a>
<a id="tocsgo-shisha-backend_internal_models.forbiddenerror"></a>

```json
{
  "error": "forbidden"
}

```

権限がない操作を実行した場合のエラーレスポンス

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|error|string|true|none|エラー種別の識別子|

#### Enumerated Values

|Property|Value|
|---|---|
|error|forbidden|

<h2 id="tocS_go-shisha-backend_internal_models.LoginInput">go-shisha-backend_internal_models.LoginInput</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.logininput"></a>
<a id="schema_go-shisha-backend_internal_models.LoginInput"></a>
<a id="tocSgo-shisha-backend_internal_models.logininput"></a>
<a id="tocsgo-shisha-backend_internal_models.logininput"></a>

```json
{
  "email": "string",
  "password": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|email|string|true|none|none|
|password|string|true|none|none|

<h2 id="tocS_go-shisha-backend_internal_models.NotFoundError">go-shisha-backend_internal_models.NotFoundError</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.notfounderror"></a>
<a id="schema_go-shisha-backend_internal_models.NotFoundError"></a>
<a id="tocSgo-shisha-backend_internal_models.notfounderror"></a>
<a id="tocsgo-shisha-backend_internal_models.notfounderror"></a>

```json
{
  "error": "not_found"
}

```

リソースが見つからない場合のエラーレスポンス

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|error|string|true|none|エラー種別の識別子|

#### Enumerated Values

|Property|Value|
|---|---|
|error|not_found|

<h2 id="tocS_go-shisha-backend_internal_models.Post">go-shisha-backend_internal_models.Post</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.post"></a>
<a id="schema_go-shisha-backend_internal_models.Post"></a>
<a id="tocSgo-shisha-backend_internal_models.post"></a>
<a id="tocsgo-shisha-backend_internal_models.post"></a>

```json
{
  "created_at": "string",
  "id": 0,
  "is_liked": true,
  "likes": 0,
  "slides": [
    {
      "flavor": {
        "color": "string",
        "id": 0,
        "name": "string"
      },
      "image_url": "string",
      "text": "string"
    }
  ],
  "user": {
    "description": "string",
    "display_name": "string",
    "email": "string",
    "external_url": "string",
    "icon_url": "string",
    "id": 0
  },
  "user_id": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|created_at|string|false|none|none|
|id|integer|false|none|none|
|is_liked|boolean|false|none|none|
|likes|integer|false|none|none|
|slides|[[go-shisha-backend_internal_models.Slide](#schemago-shisha-backend_internal_models.slide)]|false|none|none|
|user|[go-shisha-backend_internal_models.User](#schemago-shisha-backend_internal_models.user)|false|none|none|
|user_id|integer|false|none|none|

<h2 id="tocS_go-shisha-backend_internal_models.PostsResponse">go-shisha-backend_internal_models.PostsResponse</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.postsresponse"></a>
<a id="schema_go-shisha-backend_internal_models.PostsResponse"></a>
<a id="tocSgo-shisha-backend_internal_models.postsresponse"></a>
<a id="tocsgo-shisha-backend_internal_models.postsresponse"></a>

```json
{
  "posts": [
    {
      "created_at": "string",
      "id": 0,
      "is_liked": true,
      "likes": 0,
      "slides": [
        {
          "flavor": {
            "color": "string",
            "id": 0,
            "name": "string"
          },
          "image_url": "string",
          "text": "string"
        }
      ],
      "user": {
        "description": "string",
        "display_name": "string",
        "email": "string",
        "external_url": "string",
        "icon_url": "string",
        "id": 0
      },
      "user_id": 0
    }
  ],
  "total": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|posts|[[go-shisha-backend_internal_models.Post](#schemago-shisha-backend_internal_models.post)]|false|none|none|
|total|integer|false|none|none|

<h2 id="tocS_go-shisha-backend_internal_models.ServerError">go-shisha-backend_internal_models.ServerError</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.servererror"></a>
<a id="schema_go-shisha-backend_internal_models.ServerError"></a>
<a id="tocSgo-shisha-backend_internal_models.servererror"></a>
<a id="tocsgo-shisha-backend_internal_models.servererror"></a>

```json
{
  "error": "internal_server_error"
}

```

サーバー内部でエラーが発生した場合のエラーレスポンス

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|error|string|true|none|エラー種別の識別子|

#### Enumerated Values

|Property|Value|
|---|---|
|error|internal_server_error|

<h2 id="tocS_go-shisha-backend_internal_models.Slide">go-shisha-backend_internal_models.Slide</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.slide"></a>
<a id="schema_go-shisha-backend_internal_models.Slide"></a>
<a id="tocSgo-shisha-backend_internal_models.slide"></a>
<a id="tocsgo-shisha-backend_internal_models.slide"></a>

```json
{
  "flavor": {
    "color": "string",
    "id": 0,
    "name": "string"
  },
  "image_url": "string",
  "text": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|flavor|[go-shisha-backend_internal_models.Flavor](#schemago-shisha-backend_internal_models.flavor)|false|none|none|
|image_url|string|true|none|none|
|text|string|false|none|none|

<h2 id="tocS_go-shisha-backend_internal_models.SlideInput">go-shisha-backend_internal_models.SlideInput</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.slideinput"></a>
<a id="schema_go-shisha-backend_internal_models.SlideInput"></a>
<a id="tocSgo-shisha-backend_internal_models.slideinput"></a>
<a id="tocsgo-shisha-backend_internal_models.slideinput"></a>

```json
{
  "flavor_id": 0,
  "image_url": "string",
  "text": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|flavor_id|integer|false|none|none|
|image_url|string|true|none|none|
|text|string|false|none|none|

<h2 id="tocS_go-shisha-backend_internal_models.UnauthorizedError">go-shisha-backend_internal_models.UnauthorizedError</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.unauthorizederror"></a>
<a id="schema_go-shisha-backend_internal_models.UnauthorizedError"></a>
<a id="tocSgo-shisha-backend_internal_models.unauthorizederror"></a>
<a id="tocsgo-shisha-backend_internal_models.unauthorizederror"></a>

```json
{
  "error": "unauthorized"
}

```

認証に失敗した場合のエラーレスポンス

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|error|string|true|none|エラー種別の識別子|

#### Enumerated Values

|Property|Value|
|---|---|
|error|unauthorized|

<h2 id="tocS_go-shisha-backend_internal_models.UploadImagesResponse">go-shisha-backend_internal_models.UploadImagesResponse</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.uploadimagesresponse"></a>
<a id="schema_go-shisha-backend_internal_models.UploadImagesResponse"></a>
<a id="tocSgo-shisha-backend_internal_models.uploadimagesresponse"></a>
<a id="tocsgo-shisha-backend_internal_models.uploadimagesresponse"></a>

```json
{
  "urls": [
    "string"
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|urls|[string]|false|none|none|

<h2 id="tocS_go-shisha-backend_internal_models.User">go-shisha-backend_internal_models.User</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.user"></a>
<a id="schema_go-shisha-backend_internal_models.User"></a>
<a id="tocSgo-shisha-backend_internal_models.user"></a>
<a id="tocsgo-shisha-backend_internal_models.user"></a>

```json
{
  "description": "string",
  "display_name": "string",
  "email": "string",
  "external_url": "string",
  "icon_url": "string",
  "id": 0
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|description|string|false|none|none|
|display_name|string|false|none|none|
|email|string|false|none|none|
|external_url|string|false|none|none|
|icon_url|string|false|none|none|
|id|integer|false|none|none|

<h2 id="tocS_go-shisha-backend_internal_models.UsersResponse">go-shisha-backend_internal_models.UsersResponse</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.usersresponse"></a>
<a id="schema_go-shisha-backend_internal_models.UsersResponse"></a>
<a id="tocSgo-shisha-backend_internal_models.usersresponse"></a>
<a id="tocsgo-shisha-backend_internal_models.usersresponse"></a>

```json
{
  "total": 0,
  "users": [
    {
      "description": "string",
      "display_name": "string",
      "email": "string",
      "external_url": "string",
      "icon_url": "string",
      "id": 0
    }
  ]
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|total|integer|false|none|none|
|users|[[go-shisha-backend_internal_models.User](#schemago-shisha-backend_internal_models.user)]|false|none|none|

<h2 id="tocS_go-shisha-backend_internal_models.ValidationError">go-shisha-backend_internal_models.ValidationError</h2>
<!-- backwards compatibility -->
<a id="schemago-shisha-backend_internal_models.validationerror"></a>
<a id="schema_go-shisha-backend_internal_models.ValidationError"></a>
<a id="tocSgo-shisha-backend_internal_models.validationerror"></a>
<a id="tocsgo-shisha-backend_internal_models.validationerror"></a>

```json
{
  "error": "validation_failed"
}

```

入力値のバリデーションに失敗した場合のエラーレスポンス

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|error|string|true|none|エラー種別の識別子|

#### Enumerated Values

|Property|Value|
|---|---|
|error|validation_failed|

