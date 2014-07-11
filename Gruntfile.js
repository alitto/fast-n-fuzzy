'use strict';

var paths = {
    js: ['src/**/*.js']
};

module.exports = function(grunt) {

    // Project Configuration
    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        pkg: pkg,
        jshint: {
            all: {
                src: paths.js,
                options: {
                    jshintrc: true
                }
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            js: {
                files: [{
                    expand: true,
                    cwd: '.',
                    src: paths.js,
                    dest: 'dist/min'
                }]
            }
        },
        concat: {
            js: {
                src: paths.js,
                dest: 'dist/fast-n-fuzzy-' + pkg.version + '.js'
            },
            jsmin: {
                src: 'dist/min/**/*.js',
                dest: 'dist/fast-n-fuzzy-' + pkg.version + '.min.js'
            }
        },
        env: {
            test: {
                NODE_ENV: 'test'
            }
        }
    });

    //Load NPM tasks
    require('load-grunt-tasks')(grunt);

    //Default task
    grunt.registerTask('default', ['jshint', 'uglify', 'concat']);
};
