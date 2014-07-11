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
                dest: 'dist/fast-n-fuzzy.js'
            },
            js_min: {
                src: 'dist/min/**/*.js',
                dest: 'dist/fast-n-fuzzy.min.js'
            }
        },
        env: {
            test: {
                NODE_ENV: 'test'
            }
        },
        clean: {
            dist: 'dist',
            dist_min: 'dist/min'
        }
    });

    //Load NPM tasks
    require('load-grunt-tasks')(grunt);

    //Default task
    grunt.registerTask('default', ['clean:dist', 'jshint', 'uglify', 'concat', 'clean:dist_min']);
};
