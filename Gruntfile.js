/*jshint camelcase: false */
/*global module:false */
module.exports = function(grunt) {
  grunt.initConfig({
    connect: {
      dev: {
        options: {
          base: 'dist',
          port: 9002,
          hostname: '*'
        }
      }
    },
    neuter: {
      options: {
        template: '{%= src %}',
        includeSourceURL: true,
        basePath: 'src/javascripts/'
      },
      'dist/javascripts/edsa.js': 'src/javascripts/edsa.js'
    },
    watch: {
      application_code: {
        files: ['src/javascripts/**/*.js'],
        tasks: ['neuter', 'uglify']
      },
      sass: {
        files: ['src/stylesheets/*.scss'],
        tasks: ['sass']
      }
    },
    uglify: {
      'dist/javascripts/edsa.min.js': 'dist/javascripts/edsa.js'
    },
    sass: {
      dist: {
        files: {
          'dist/stylesheets/edsa.css': 'src/stylesheets/edsa.scss',
        }
      }
    }
  });

  grunt.registerTask('default', [
    'connect',
    'neuter',
    'sass',
    'uglify',
    'watch',
  ]);

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};