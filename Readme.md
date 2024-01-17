# Video + Tweet based app backend.

## description: 

this is project is based on "Node.js" which utilizes "express.js" to handle routing and the "mongoDB databas"e is manipulated using "mongoose".

the project is complex yet follows a very simple structure.

the backend allows us to create and authenticate users, publish videos, tweets and comments etc. which are collections in itself and holds multiple mongodb docs for the same.

## Structure:

### database connection: 

 databse connection is defined inside the db/index.js

### middlewares:

#### auth middleware to handle authentication.

#### multer middleware to handle file upload.

### controllers:

here we define the actual backend processes like how things gonna be returned and input to be taken for the same.

#### current status of controllers are follows:

- user controller
- video controller
- tweet controller
- comment controller
- playlist controller
- like controller
- subscription controller
- healthcheck controller
- dashboard controller

### models: 

here we create the schema for models to be based on upon and the models will define the structure of the each document.

#### current status of models are follows:

- user model
- video model
- comment model
- tweet model
- like model
- playlist model
- subscription model

### routes: 

here we define the routes for each controller.

#### current status of the routes are follows:

- comment routes
- dashboard routes
- healthcheck routes
- like routes
- playlist routes
- subscription routes
- tweet routes
- user routes
- video routes
