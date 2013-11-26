/*jshint camelcase: false */
/*global module:false */
module.exports = function(grunt) {
  var neuterOptions = {
    template: '{%= src %}',
    includeSourceURL: true,
    basePath: 'src/javascripts/'
  };

  grunt.initConfig({
    neuter: {
      application: {
        options: neuterOptions,
        src: 'src/javascripts/edsa.js',
        dest: 'src/dev/javascripts/edsa.js'
      },
      dist: {
        options: neuterOptions,
        src: 'src/javascripts/edsa.js',
        dest: 'dist/javascripts/edsa.js'
      }
    },
    sass: {
      application: { files: { 'src/dev/stylesheets/edsa.css': 'src/stylesheets/edsa.scss' } },
      dist: { files: { 'dist/stylesheets/edsa.css': 'src/stylesheets/edsa.scss' } }
    },
    // Source only development tasks
    connect: {
      application: {
        options: {
          base: 'src/dev',
          port: 9002,
          hostname: '*'
        }
      }
    },
    watch: {
      neuter: {
        files: ['src/javascripts/**/*.js'],
        tasks: ['neuter:application']
      },
      sass: {
        files: ['src/stylesheets/*.scss'],
        tasks: ['sass:application']
      }
    },
    // Dist only tasks
    uglify: {
      'dist/javascripts/edsa.min.js': 'dist/javascripts/edsa.js'
    },
  });

  grunt.registerTask('default', [
    'connect',
    'neuter:application',
    'sass:application',
    'watch',
  ]);

  grunt.registerTask('dist', [
    'neuter:dist',
    'sass:dist',
    'uglify'
  ])
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};