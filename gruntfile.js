var path = require('path');


/**
 * The latest release.  Links to examples, doc, etc. will be prefixed by this
 * value.
 * @type {String}
 */
var latest = 'v' + require('./package.json').version;


/** @param {Object} grunt Grunt. */
module.exports = function(grunt) {

  var treeish = grunt.option('treeish') ||
      process.env.treeish || 'origin/master';

  var branch = treeish.split('/').pop(); // may not always be a local branch

  // file patterns (these take / on win and *nix)
  var build = '.grunt/openlayers-website';
  var dist = build + '/dist';
  var two = dist + '/two';
  var api = dist + '/api';
  var assets = dist + '/assets';
  var repo = build + '/repo';

  grunt.initConfig({
    checkout: {
      options: {
        repo: 'git://github.com/openlayers/ol3.git',
        treeish: treeish,
        dir: repo
      }
    },
    install: {
      options: {
        dir: repo
      }
    },
    make: {
      options: {cwd: repo},
      apidoc: {
        args: ['apidoc']
      },
      examples: {
        args: ['host-examples']
      }
    },
    clean: {
      dist: dist,
      repo: repo,
      all: build
    },
    move: {
      apidoc: {
        src: repo + '/build/hosted/HEAD/apidoc',
        dest: dist + '/en/' + branch + '/apidoc'
      },
      build: {
        src: repo + '/build/hosted/HEAD/build',
        dest: dist + '/en/' + branch + '/build'
      },
      closure: {
        src: repo + '/build/hosted/HEAD/closure-library',
        dest: dist + '/en/' + branch + '/closure-library'
      },
      ol: {
        src: repo + '/build/hosted/HEAD/ol',
        dest: dist + '/en/' + branch + '/ol'
      },
      'ol.ext': {
        src: repo + '/build/hosted/HEAD/ol.ext',
        dest: dist + '/en/' + branch + '/ol.ext'
      },
      examples: {
        src: repo + '/build/hosted/HEAD/examples',
        dest: dist + '/en/' + branch + '/examples'
      },
      css: {
        src: repo + '/build/hosted/HEAD/css',
        dest: dist + '/en/' + branch + '/css'
      }
    },
    less: {
      all: {
        options: {
          compress: true
        },
        files: [{
          expand: true,
          cwd: 'src',
          src: 'theme/**/*.less',
          dest: assets,
          ext: '.css'
        }]
      }
    },
    copy: {
      all: {
        files: [{
          expand: true,
          cwd: 'src',
          src: 'theme/img/**/*.*',
          dest: assets
        }, {
          expand: true,
          cwd: 'src/two',
          src: '**/*.*',
          dest: dist + '/two/'
        }, {
          expand: true,
          cwd: 'src/api',
          src: '**/*.*',
          dest: dist + '/api/'
        }, {
          expand: true,
          cwd: 'src/images',
          src: '**/*.*',
          dest: dist + '/images/'
        }, {
          src: 'src/builder/builder.js',
          dest: dist + '/en/' + branch + '/builder/builder.js'
        }]
      },
      doc: {
        files: [{
          expand: true,
          cwd: repo,
          src: [
            'doc/**/*.*',
            '!doc/**/*.hbs',
            '!doc/**/*.md',
          ],
          dest: dist + '/en/' + branch
        }]
      }
    },
    assemble: {
      options: {
        layoutdir: 'src/layouts',
        assets: assets,
        latest: latest
      },
      robots: {
        options: {
          ext: '.txt'
        },
        files: [{
          expand: true,
          cwd: 'src',
          src: 'robots.hbs',
          dest: dist
        }]
      },
      pages: {
        files: [{
          expand: true,
          cwd: 'src/pages',
          src: '**/*.*',
          dest: dist
        }]
      },
      builder: {
        options: {
          data: repo + '/build/info.json',
          partials: 'src/builder/**/*.partial.hbs',
          helpers: ['src/builder/*.hlpr.js']
        },
        src: 'src/builder/index.hbs',
        dest: dist + '/en/' + branch + '/builder/index.html'
      },
      doc: {
        files: [{
          expand: true,
          cwd: repo,
          src: ['doc/**/*.hbs', 'doc/**/*.md'],
          dest: dist + '/en/' + branch
        }]
      }
    },
    connect: {
      options: {
        base: dist,
        keepalive: true
      },
      server: {}
    },
    watch: {
      builder: {
        files: 'src/builder/**/*',
        tasks: ['assemble:builder', 'copy:all']
      },
      layouts: {
        files: 'src/layouts/**/*',
        tasks: ['assemble']
      },
      pages: {
        files: 'src/pages/**/*',
        tasks: ['assemble:pages']
      },
      theme: {
        files: 'src/theme/**/*.less',
        tasks: ['less']
      }
    },
    concurrent: {
      options: {
        logConcurrentOutput: true
      },
      target: {
        tasks: ['connect', 'watch']
      }
    },
    'gh-pages': {
      options: {
        branch: 'master',
        base: dist,
        only: 'en/' + branch
      },
      src: ['**/*']
    },
    zip: {
      full: {
        cwd: dist + '/en/',
        src: [
          dist + '/en/' + branch + '/**/*'
        ],
        dest: branch + '.zip',
        compression: 'DEFLATE'
      },
      dist: {
        src: [
          dist + '/en/' + branch + '/build/ol.js',
          dist + '/en/' + branch + '/build/ol-debug.js',
          dist + '/en/' + branch + '/css/ol.css',
        ],
        router: function(filepath) {
          return branch + '-dist/' + path.basename(filepath);
        },
        dest: branch + '-dist.zip',
        compression: 'DEFLATE'
      }
    }
  });

  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-zip');

  grunt.loadTasks('tasks');

  grunt.registerTask('build', 'Build the website', [
    'checkout', 'install', 'make:examples', 'make:apidoc', 'clean:dist',
    'move', 'less', 'copy', 'assemble']);


  grunt.registerTask('deploy', 'Deploy the site', function() {
    grunt.task.run(['build', 'gh-pages']);
  });

  grunt.registerTask('start', 'Start the dev server',
      ['build', 'concurrent']);

  grunt.registerTask('serve', 'Start the dev server without build.py first',
      ['concurrent']);

  grunt.registerTask('archives', 'Create release archives',
      ['build', 'zip']);

  grunt.registerTask('default', 'build');

};
