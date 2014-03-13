express-seed
============

An empty website using nodejs + express + handlerbars + sass + bower + grunt + mysql.


## Development environment setup
#### Prerequisites

* [Nodejs](http://www.nodejs.org/)
* [Node Package Manager](https://npmjs.org/) (NPM)
* [Git](http://git-scm.com/)
* [Ruby](http://www.ruby-lang.org/en/downloads/) (Sass runtime environment)

#### Dependencies

* [Grunt](http://gruntjs.com/) (task automation)
* [Bower](http://bower.io/) (package management)
* [Sass](http://sass-lang.com/) (css tool)

#### Installation
Run the commands below in the project root directory.

#####1. Install Sass
    $ gem install sass


#####2. Install Grunt and Bower

    $ sudo npm install -g grunt-cli bower
    
#####3. Install project dependencies

    $ npm install
    $ bower install

## Useful commands

####Running web site

To start the web server, run:

    $ grunt dev

To access the local server, enter the following URL into your web browser:

    http://localhost:3000/


## Directory Layout

    client/                 --> all of the client files
      app/                  --> javascript files, it will be concated
      assets/               --> public asset files
        css/                --> css files
        img/                --> image files
        font/               --> font files
      sass/                 --> sass files, build css files
      schema/               --> db schema
    server/                 --> all of the server files
      config/               --> server config
      controllers/          --> application controllers
      data_providers/       --> provide data from db or others
      helpers/              --> helpers for views
      middleware/           --> middleware for express
      models/               --> data models
      routes/               --> routes
      views/                --> view files
      app.js                --> application
      errorHandling.js      --> error handling
      logger.js             --> help to log
      utils.js              --> util library
    shared/                 --> client and server common files
    bower.json              --> config file for bower
    config.development.js   --> config file for development
    config.js               --> default config file. merge `config.*environment*.js` file
    Gruntfile.js            --> grunt file

    
