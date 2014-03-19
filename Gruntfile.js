var path = require('path'),
  fs = require('fs'),
  buildDirectory = path.resolve(process.cwd(), '.build'),
  distDirectory = path.resolve(process.cwd(), '.dist'),

  // ## Build File Patterns
  // a list of files and paterns to process and exclude when running builds & releases
  buildGlob = [
    '**',
    '!node_modules/**',
    '!test/**',
    '!client/sass/**',
    '!.sass*',
    '!.git*',
    '!*.iml',
    '!config.js',
    '!.travis.yml',
    '!Gemfile*',
    '!*.html'
  ];

module.exports = function(grunt) {

  // load all grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    // Common paths to be used by tasks
    paths: {
      built: './built',
      assets: './client/assets',
      sass: './client/sass',
      clientjs: './client/app',
      views: './server/views',
      build: buildDirectory,
      releaseBuild: path.join(buildDirectory, 'release'),
      dist: distDirectory,
      releaseDist: path.join(distDirectory, 'release')
    },

    pkg: grunt.file.readJSON('package.json'),
    // ### Config for grunt-contrib-watch
    // Watch files and livereload in the browser during development
    watch: {
      sass: {
        files: [
          '<%= paths.sass %>/**/*'
        ],
        tasks: ['sass:dev']
      },
      concat: {
        files: [
          '<%= paths.clientjs %>/**/*.js'
        ],
        tasks: ['concat:dev']
      },
      livereload: {
        files: [
          'gruntfile.js',
          '<%= paths.assets %>/css/*.css',
          '<%= paths.assets %>/img/**/*',
          '<%= paths.views %>/**/*.hbs',
          '<%= paths.built %>/scripts/**/*.js',
        ],
        options: {
          livereload: 19821
        }
      },
      express: {
        // Restart any time client or server js files change
        files: ['server/app.js', 'server/**/*.js'],
        tasks: ['express:dev'],
        options: {
          spawn: false
        }
      }
    },
    // ### Config for grunt-contrib-clean
    // Clean up files as part of other tasks
    clean: {
      release: {
        src: [
          '<%= paths.releaseBuild %>/**',
          'built/**'
        ]
      },
      test: {
        src: ['content/data/test.db']
      }
    },
    // ### Config for grunt-contrib-copy
    // Prepare files for builds / releases
    copy: {
      release: {
        files: [{
          expand: true,
          src: buildGlob,
          dest: '<%= paths.releaseBuild %>/'
        }]
      }
    },
    // ### Config for grunt-contrib-concat
    // concatenate multiple JS files into a single file ready for use
    concat: {
      dev: {
        files: {
          '<%= paths.built %>/scripts/vendor.js': [
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/bootstrap/dist/js/bootstrap.min.js',
          ],
          '<%= paths.built %>/scripts/app.js': [
            '<%= paths.clientjs %>/*.js',
          ],
        }
      },
      prod: {
        files: {
          '<%= paths.built %>/scripts/vendor.js': [
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/bootstrap/dist/js/bootstrap.min.js',
          ],
          '<%= paths.built %>/scripts/app.js': [
            '<%= paths.clientjs %>/*.js',
          ],
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      prod: {
        files: {
          '<%= paths.built %>/scripts/vendor.min.js': '<%= paths.built %>/scripts/vendor.js',
          '<%= paths.built %>/scripts/app.min.js': '<%= paths.built %>/scripts/app.js'
        }
      }
    },
    // ### Config for grunt-contrib-sass
    // Compile all the SASS!
    sass: {
      dev: {
        files: {
          '<%= paths.assets %>/css/screen.css': '<%= paths.sass %>/screen.scss',
        }
      },
      compress: {
        options: {
          style: 'compressed'
        },
        files: {
          '<%= paths.assets %>/css/screen.min.css': '<%= paths.sass %>/screen.scss'
        }
      }
    },
    // ### config for grunt-shell
    // command line tools
    shell: {
      // install bourbon
      bourbon: {
        command: 'bourbon install --path <%= paths.assets("default") %>/sass/modules/'
      },
      // generate coverage report
      coverage: {
        command: function() {
          // will work on windows only if mocha is globally installed
          var cmd = !! process.platform.match(/^win/) ? 'mocha' : './node_modules/mocha/bin/mocha';
          return cmd + ' --timeout 15000 --reporter html-cov > coverage.html ./core/test/blanket_coverage.js';
        },
        execOptions: {
          env: 'NODE_ENV=' + process.env.NODE_ENV
        }
      }
    },
    // ### Config for grunt-express-server
    // Start our server in development
    express: {
      options: {
        script: './server/app.js',
        output: ".+"
      },
      dev: {
        options: {
          port: 3000,
          node_env: 'development'
        }
      },
      test: {
        options: {
          node_env: 'testing'
        }
      }
    },
    // ### Config for grunt-jslint
    // JSLint all the things!
    jslint: {
      server: {
        directives: {
          // node environment
          node: true,
          // browser environment
          browser: false,
          // allow dangling underscores in var names
          nomen: true,
          // allow to do statements
          todo: true,
          // don't require use strict pragma
          sloppy: true
        },
        files: {
          src: [
            '*.js',
            'server/**/*.js'
          ]
        },
        exclude: [
          
        ]
      },
      client: {
        directives: {
          // node environment
          node: false,
          // browser environment
          browser: true,
          // allow dangling underscores in var names
          nomen: true,
          // allow to do statements
          todo: true
        },
        files: {
          src: '<%= paths.clientjs %>/**/*.js'
        },
        exclude: [
          
        ]
      },
      shared: {
        directives: {
          // node environment
          node: true,
          // browser environment
          browser: false,
          // allow dangling underscores in var names
          nomen: true,
          // allow to do statements
          todo: true,
          // allow unused parameters
          unparam: true,
          // don't require use strict pragma
          sloppy: true
        },
        files: {
          src: [
            'shared/**/*.js'
          ]
        },
        exclude: [
          'shared/vendor/**/*.js'
        ]
      }
    },
    bower: {
      install: {
        options: {
          copy: false
        }
      }
    },
    blanket: {
      coverage: {
        src: ['server/'],
        dest: 'coverage/server/'
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: 'coverage/blanket'
        },
        src: ['test/**/*.js']
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          quiet: true,
          captureFile: 'coverage.html'
        },
        src: ['test/**/*.js']
      }
    }
  });


  // Default task(s).
  grunt.registerTask('init', ['shell:bourbon', 'default']);
  grunt.registerTask('default', ['update_submodules', 'bower', 'sass:compress', 'concat']);
  grunt.registerTask('release', ['shell:bourbon', 'bower', 'sass:compress', 'concat', 'uglify', 'clean:release', 'copy:release']);
  grunt.registerTask('dev', ['sass:dev', 'concat:dev', 'express:dev', 'watch']);
};