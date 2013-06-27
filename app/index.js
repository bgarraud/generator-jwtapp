'use strict';
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');


var AppGenerator = module.exports = function Appgenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.mainJsFile = '';

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AppGenerator, yeoman.generators.Base);

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  console.log(this.yeoman);
  console.log('Out of the box I include HTML5 Boilerplate, jQuery and Modernizr.');

  var prompts = [
  {
    type: 'confirm',
    name: 'compassSass',
    message: 'Would you like to use Sass / Compass?',
    default: 'y/n',
  },
  {
    type: 'confirm',
    name: 'includeRequireJS',
    message: 'Would you like to include RequireJS (for AMD support)?',
    default: 'y/n',
  },
  {
    type: 'confirm',
    name: 'includeBackbone',
    message: 'Would you like to include Backbone with underscore?',
    default: 'y/n',
  }];

  this.prompt(prompts, function (err, props) {
    if (err) {
      return this.emit('error', err);
    }
    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    
    
    this.compassSass = (/y/i).test(props.compassSass);
    this.includeRequireJS = (/y/i).test(props.includeRequireJS);
	this.includeBackbone = (/y/i).test(props.includeBackbone);
    cb();
  }.bind(this));
};

AppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
};

AppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('_package.json', 'package.json');
};
/*
AppGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};
*/
AppGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.copy('_bower.json', 'bower.json');
};

AppGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

AppGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

AppGenerator.prototype.h5bp = function h5bp() {
  this.copy('htaccess', 'app/.htaccess');
  this.copy('hgignore', '.hgignore');
 
};

/*AppGenerator.prototype.bootstrapImg = function bootstrapImg() {
  
};*/

/*AppGenerator.prototype.bootstrapJs = function bootstrapJs() {
  
  
};*/

AppGenerator.prototype.mainStylesheet = function mainStylesheet() {
  if (this.compassSass) {
    this.copy('main.scss', 'app/styles/main.scss');
    /* elements */ 
    this.copy('base.scss', 'app/styles/partials/base.scss');
    this.copy('color.scss', 'app/styles/partials/color.scss');
    
  } else {
  	
    this.copy('main.css', 'app/styles/main.css');
    /* TODO look into inlineing base sass in main.css */ 
  }
};

AppGenerator.prototype.writeIndex = function writeIndex() {
  // prepare default content text
  var defaults = ['HTML5 Boilerplate'];
  var contentText = [
    '        <div class="container">',
    '            <div class="hero-unit">',
    '                <h1>\'Allo, \'Allo!</h1>',
    '                <p>You now have</p>',
    '                <ul>'
  ];

  if (!this.includeRequireJS) {
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', [
      'bower_components/jquery/jquery.js',
      'scripts/main.js'
    ]);

    this.indexFile = this.appendFiles({
      html: this.indexFile,
      fileType: 'js',
      optimizedPath: 'scripts/coffee.js',
      sourceFileList: ['scripts/hello.js'],
      searchPath: '.tmp'
    });
  }

  if (this.compassSass) {
    defaults.push('Sass');
  }

  /*if (this.compassSass && !this.includeRequireJS) {
    // wire Twitter Bootstrap plugins
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
      'bower_components/sass-bootstrap/js/bootstrap-affix.js',
      'bower_components/sass-bootstrap/js/bootstrap-alert.js',
      'bower_components/sass-bootstrap/js/bootstrap-dropdown.js',
      'bower_components/sass-bootstrap/js/bootstrap-tooltip.js',
      'bower_components/sass-bootstrap/js/bootstrap-modal.js',
      'bower_components/sass-bootstrap/js/bootstrap-transition.js',
      'bower_components/sass-bootstrap/js/bootstrap-button.js',
      'bower_components/sass-bootstrap/js/bootstrap-popover.js',
      'bower_components/sass-bootstrap/js/bootstrap-typeahead.js',
      'bower_components/sass-bootstrap/js/bootstrap-carousel.js',
      'bower_components/sass-bootstrap/js/bootstrap-scrollspy.js',
      'bower_components/sass-bootstrap/js/bootstrap-collapse.js',
      'bower_components/sass-bootstrap/js/bootstrap-tab.js'
    ]);
  }*/

  if (this.includeRequireJS) {
    defaults.push('RequireJS');
  } else {
    this.mainJsFile = 'console.log(\'\\\'Allo \\\'Allo!\');';
  }

  // iterate over defaults and create content string
  defaults.forEach(function (el) {
    contentText.push('                    <li>' + el  +'</li>');
  });

  contentText = contentText.concat([
    '                </ul>',
    '                <p>installed.</p>',
    '                <h3>Enjoy coding! - Yeoman</h3>',
    '            </div>',
    '        </div>',
    ''
  ]);

  // append the default content
  this.indexFile = this.indexFile.replace('<body>', '<body>\n' + contentText.join('\n'));
};

// TODO(mklabs): to be put in a subgenerator like rjs:app
AppGenerator.prototype.requirejs = function requirejs() {
  var requiredScripts =  '[\'app\', \'jquery\']';
 
  if (this.includeRequireJS) {
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', ['bower_components/requirejs/require.js'], {
      'data-main': 'scripts/main'
    });
    
    var bb = '';
	if (this.includeBackbone) {
		var backbone = "'underscore': '../bower_components/underscore-amd/underscore',";
    	backbone +="'backbone': '../bower_components/backbone-amd/backbone',";
	
	}
    // add a basic amd module
    this.write('app/scripts/app.js', [
      '/*global define */',
      'define([], function () {',
      '    \'use strict\';\n',
      '    return \'\\\'Allo \\\'Allo!\';',
      '});'
    ].join('\n'));

    this.mainJsFile = [
      'require.config({',
      '    paths: {',
      '        jquery: \'../bower_components/jquery/jquery\',',
      backbone,
      '    },',
      '    shim: {',
      '        bootstrap: {',
      '            deps: [\'jquery\'],',
      '            exports: \'jquery\'',
      '        }',
      '    }',
      '});',
      '',
      'require(' + requiredScripts + ', function (app, $) {',
      '    \'use strict\';',
      '    // use app here',
      '    console.log(app);',
      '    console.log(\'Running jQuery %s\', $().jquery);',
      '});'
    ].join('\n');
  }
};

AppGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/scripts');
  this.mkdir('app/scripts/components');
  if (this.includeBackbone) {
  	this.mkdir('app/scripts/models');
  	this.mkdir('app/scripts/views');
  	this.mkdir('app/scripts/collections');
  }
  this.mkdir('app/styles');
  this.mkdir('app/styles/components');
  this.mkdir('app/styles/partials');
  this.mkdir('app/images');
  this.mkdir('app/media');
  this.write('app/index.html', this.indexFile);
  this.write('app/scripts/main.js', this.mainJsFile);
};
