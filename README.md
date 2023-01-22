# DEEL BACKEND TASK

## Personal Notes

Time spent up until commit [a7b5ffe1cbfa51f5ab0f110f5d5e63358ccb6336](https://github.com/Chonne/Deel-BE-Template/tree/a7b5ffe1cbfa51f5ab0f110f5d5e63358ccb6336): 3h30.

What I've done:

- code style: installed eslint based on what I could find in a few public deel repos. Had to adapt the packages installed so it would work, but the rules should remain the same
- provided a postman collection, in [./docs]()
- implemented routes:
  - ***GET*** `/contracts/:id`
  - ***GET*** `/contracts`
  - ***GET*** `/jobs/unpaid`
  - ***POST*** `/jobs/:job_id/pay`
  - ***GET*** `/admin/best-profession?start=<date>&end=<date>`

What still needs to be done:

- ***POST*** `/balances/deposit/:userId`
- ***GET*** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>`
- tests with mocha (according to what's used in your public repos)

What I would've done had I had more time:

- validate query params, mainly for /admin/*, using some express middleware
- install and use something like [cls-hooked](https://github.com/Jeff-Lewis/cls-hooked) to automatically pass transactions to queries: this would avoid forgetting to pass transactions when adding new queries (during future developments)
- /contracts/:id could return a 403 if the contract exists but isn't linked to the profile. I feel it depends on the context and if we want to expose if a contract id does exist to everyone or not
- add jsdoc in the new methods to better describe params and returned values

Personal comments about the test:

- I had to use nodejs v12 as more recent versions failed during the sqlite install/build. I don't know if it's specific to my computer, I haven't taken the time to investigate further
- the readme contains a few typos. Apart from those, the assignment is very clear and to the point
- in "Getting Set Up", it's mentioned there's a React client. This isn't the case. I suppose the `concurrently` package could therefore be removed

---
  

💫 Welcome! 🎉


This backend exercise involves building a Node.js/Express.js app that will serve a REST API. We imagine you should spend around 3 hours at implement this feature.

## Data Models

> **All models are defined in src/model.js**

### Profile
A profile can be either a `client` or a `contractor`. 
clients create contracts with contractors. contractor does jobs for clients and get paid.
Each profile has a balance property.

### Contract
A contract between and client and a contractor.
Contracts have 3 statuses, `new`, `in_progress`, `terminated`. contracts are considered active only when in status `in_progress`
Contracts group jobs within them.

### Job
contractor get paid for jobs by clients under a certain contract.

## Getting Set Up

  
The exercise requires [Node.js](https://nodejs.org/en/) to be installed. We recommend using version 10 or 12.

  

1. Start by cloning this repository.

  

1. In the repo root directory, run `npm install` to gather all dependencies.

  

1. Next, `npm run seed` will seed the local SQLite database. **Warning: This will drop the database if it exists**. The database lives in a local file `database.sqlite3`.

  

1. Then run `npm start` which should start both the server and the React client.

  

❗️ **Make sure you commit all changes to the master branch!**

  
  

## Technical Notes

  

- The server is running with [nodemon](https://nodemon.io/) which will automatically restart for you when you modify and save a file.

- The database provider is SQLite, which will store data in a file local to your repository called `database.sqlite3`. The ORM [Sequelize](http://docs.sequelizejs.com/) is on top of it. You should only have to interact with Sequelize - **please spend some time reading sequelize documentation before starting the exercise.**

- To authenticate users use the `getProfile` middleware that is located under src/middleware/getProfile.js. users are authenticated by passing `profile_id` in the request header. after a user is authenticated his profile will be available under `req.profile`. make sure only users that are on the contract can access their contracts.
- The server is running on port 3001.

  

## APIs To Implement 

  

Below is a list of the required API's for the application.

  


1. ***GET*** `/contracts/:id` - This API is broken 😵! it should return the contract only if it belongs to the profile calling. better fix that!

1. ***GET*** `/contracts` - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.

1. ***GET*** `/jobs/unpaid` -  Get all unpaid jobs for a user (***either*** a client or contractor), for ***active contracts only***.

1. ***POST*** `/jobs/:job_id/pay` - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.

1. ***POST*** `/balances/deposit/:userId` - Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)

1. ***GET*** `/admin/best-profession?start=<date>&end=<date>` - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.

1. ***GET*** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.
```
 [
    {
        "id": 1,
        "fullName": "Reece Moyer",
        "paid" : 100.3
    },
    {
        "id": 200,
        "fullName": "Debora Martin",
        "paid" : 99
    },
    {
        "id": 22,
        "fullName": "Debora Martin",
        "paid" : 21
    }
]
```

  

## Going Above and Beyond the Requirements

Given the time expectations of this exercise, we don't expect anyone to submit anything super fancy, but if you find yourself with extra time, any extra credit item(s) that showcase your unique strengths would be awesome! 🙌

It would be great for example if you'd write some unit test / simple frontend demostrating calls to your fresh APIs.

  

## Submitting the Assignment

When you have finished the assignment, create a github repository and send us the link.

  

Thank you and good luck! 🙏
