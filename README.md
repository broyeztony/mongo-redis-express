The current project is an Express app exposing 3 endpoints:
 - /login [POST]
    - input: { username: String, password: String }
    - output: { access_token: String /* JWT token */ }  
 - /users/profile/:username [GET]
    - input: a 'username' url parameter
    - output: { name: String, username: String, createdAt: Number }  
 - /users/:username [PATCH]
    - input: a 'username' url parameter + { name: String } payload
    - output: String
 
 
To install the dependencies, run
```
npm install
```

To build the Docker image, run
```
sh deploy.sh
```

To run the Docker image, run
```
sh run.sh
```
 
To run the project with NPM, run 
```
npm start
```
 
To run the tests, run 
```
npm test
``` 

A DRY run should resemble the following:
```
npm test

> yubo2@0.0.0 test /Users/tony/Desktop/yubo2
> mocha --timeout 10000


  Authorization Flow
    POST /login
      ✔ should return a JWT access_token (2529ms)
      ✔ should return a HTTP 401 error (2499ms)
      ✔ should return a HTTP 400 error
      ✔ should return a HTTP 403 error (120ms)

  Read profile, positive flow
    GET /profile
@@ profileRes.data { name: 'James', username: 'jean0', createdAt: 1613591746884 }
      ✔ should return the profile of the specified username, given a valid JWT is provided (2621ms)

  PATCH /user
@@ patchRes.data The user's name was updated to Nikos.
@@ profileRes.data { name: 'Nikos', username: 'jean0', createdAt: 1613591746884 }
    ✔ should update the name of the specified user (2867ms)


  6 passing (11s)
```