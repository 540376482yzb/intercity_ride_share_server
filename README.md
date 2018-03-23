## Ride Sharing App Server App
Server API writing in `Node Js` using `Express` .Provides api service for [client app](https://github.com/540376482yzb/intercities_ride_sharing_client)


## How to get stated it
   * Clone or Fork this project to your local machine
   * npm install to download the dependency for this app
   * includes `.evn` file, inside write `JWT=[your_secrete]` for you jwt secrete
   * npm start
   
## Avaliable API end ponits
  #### sign up on `/api/user/sign-up`
  example code for input:
  ```
   {
   "email":"demo22@gmail.com",
   "password":"5408",
   "fistName":"Zhou",
   "lastName":"Yang"
   }
  ```
  example code for output:
  ```
  {
    "email": "demo22@gmail.com",
    "lastName": "Yang",
    "rating": "5",
    "host": false,
    "match": null,
    "sentRequests": [],
    "id": "5ab54df260527017508001cf"
}
  ```
  User registration system utilizes [bcryptJs](https://www.npmjs.com/package/bcryptjs) to protect user information.

 #### log in on `api/auth/log-in`
 example code for input:
 ```
    {
      "email":"demo22@gmail.com",
      "password":"5408"
   }
 ```
 example code for output:
 ```
{
    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InJhdGluZyI6IjUiLCJob3N0IjpmYWxzZSwibWF0Y2giOm51bGwsInNlbnRSZXF1ZXN0cyI6W10sImVtYWlsIjoiZGVtbzIyQGdtYWlsLmNvbSIsImxhc3ROYW1lIjoiWWFuZyIsImlkIjoiNWFiNTRkZjI2MDUyNzAxNzUwODAwMWNmIn0sImlhdCI6MTUyMTgzMTUxMywiZXhwIjoxNTIyNDM2MzEzLCJzdWIiOiJkZW1vMjJAZ21haWwuY29tIn0.a3y1yRFV4mRRC30W6YTzKQJx6Qw2LptGJR-rz0UlorY"
}
 ```

#### refresh jwt token on `api/auth/refresh`

---

### Following end points are protected by jwt Authentication


#### Retrieve un-bias results on (GET) `api/board`

#### Retrieve matched ride on (GET)  `api/board/:id`

#### Host an new trip on (POST) `api/board`

#### Edit existing trip on (PUT) `api/board/:id`

#### Update Pending Requests on (PUT) `api/board/requests/:id`

#### Update Match Ride on (PUT) `api/board/match/:id`

#### Delete an trip on (DELELTE) `api/board/:id`

#### Delete request on (DELELTE) `api/board/requests/:id`






