'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var strip = require('strip-comment');
    var jsdom = require('jsdom').jsdom;

    var _ = context._;
    var map = context.map;
    var gulp = context.gulp;

    var plugins = context.plugins;
    var concat = plugins.concat;
    var stripNgLog = plugins.stripNgLog;
    var stripDebug = plugins.stripDebug;
    var rename = plugins.rename;
    var uglify = plugins.uglify;
    var gutil = plugins.util;
    var replace = plugins.replace;
    var spriter = plugins.sprite2;
    var gulpIf = plugins.if;
    var less = plugins.less;
    var minifyCss = plugins.minifyCss;
    var imagemin = plugins.imagemin;
    var sequence = plugins.sequence;

    var postcss = plugins.postcss;
    var autoprefixer = context.autoprefixer;

    var taskConfig = {
        compileLessTaskName: 'compieLess',
        copyBgimgTaskName: 'bgimg',
        loadModulesTaskName: 'loadModules',
        allModuleTaskName: 'angularModules:all',
        allJsTaskName: 'angularModules:js',
        allCssTaskName: 'angularModules:css',
        allSpiritTaskName: 'angularModules:spirit',
        moduleTasks: {
            js: [],
            css: [],
            spirit: []
        }
    };

    var paths = context.config.paths;
    var jsPath = paths.dist + '/js/';
    var cssPath = paths.dist + '/css/';
    var imgpath = paths.dist + '/img/';

    return createTaskHandler();

    function createTaskHandler() {
        createCopyBgimgTask();
        createCompileLessTask();
        createLoadModulesTask();
        crateAllModuleTasks();

        return sequence([
                taskConfig.copyBgimgTaskName,
                taskConfig.compileLessTaskName,
                taskConfig.loadModulesTaskName
            ],
            taskConfig.allModuleTaskName, [
                taskConfig.allJsTaskName,
                taskConfig.allCssTaskName
            ],
            taskConfig.allSpiritTaskName
        );
    }

    function createCopyBgimgTask() {
        gulp.task(taskConfig.copyBgimgTaskName, function() {
            return gulp.src([paths.app + "/bgimg/**/*.*"]).pipe(gulp.dest(paths.temp + "/bgimg/"));
        });
    }

    function createCompileLessTask() {
        gulp.task(taskConfig.compileLessTaskName, function() {
            return gulp.src(paths.app + "/modules/**/*.less")
                .pipe(less({
                    sm: "on"
                }))
                .pipe(gulp.dest(paths.temp + "/modules/"));
        });
    }

    function crateAllModuleTasks() {
        gulp.task(taskConfig.allModuleTaskName, function functionName(cb) {
            createAllJsTask();
            createAllCssTask();
            createAllSpiritTask();
            cb();
        });
    }

    function createAllJsTask() {
        gulp.task(taskConfig.allJsTaskName, taskConfig.moduleTasks.js);
    }

    function createAllCssTask() {
        gulp.task(taskConfig.allCssTaskName, taskConfig.moduleTasks.css);
    }

    function createAllSpiritTask() {
        gulp.task(taskConfig.allSpiritTaskName, taskConfig.moduleTasks.spirit);
    }

    function createLoadModulesTask() {
        var tasks = taskConfig.moduleTasks;

        gulp.task(taskConfig.loadModulesTaskName, function() {
            return gulp.src(paths.app + '/modules/**/path.js')
                .pipe(map(function(file, callback) {
                    createModuleTask(file);
                    callback(null, file);
                }));
        });

        return void(0);

        function createModuleTask(file) {
            var moduleInfo = getModuleInfo(file);
            addJsTask(moduleInfo);
            addCssTask(moduleInfo);
        }

        /*
         * js task
         */
        function addJsTask(moduleInfo) {
            if(moduleInfo.js.length > 0) {
                var taskName = 'js:module:' + moduleInfo.name;
                crateJsTask(taskName, moduleInfo);
                tasks.js.push(taskName);
            }
        }

        function crateJsTask(taskName, moduleInfo) {
            gulp.task(taskName, function() {
                return gulp.src(moduleInfo.js)
                    .pipe(getConcat(moduleInfo.name + '.js', ';\r\n'))
                    .pipe(gulp.dest(jsPath))
                    // .pipe(stripNgLog())
                    .pipe(stripDebug())
                    .pipe(renameMin())
                    .pipe(jsUglify())
                    .pipe(gulp.dest(jsPath));
            });
        }

        function getConcat(concatFileName, newLine) {
            return concat(concatFileName, {
                newLine: newLine
            });
        }

        function renameMin() {
            return rename({
                suffix: '.min'
            });
        }

        function jsUglify() {
            return uglify({
                mangle: false,
                sequences: false,
                join_vars: false
            }).on('error', gutil.log);
        }

        function getModuleInfo(file) {
            var pathFileContent = getFileContent(file);
            var moduleFiles = parseModuleResourcePaths(pathFileContent);

            var moduleName = generateModuleName(file.path);

            return {
                name: moduleName,
                js: moduleFiles.js,
                css: moduleFiles.css
            };
        }

        function generateModuleName(modulePath) {
            var ps = modulePath.split('\\');
            var moduleDir = ps[ps.length - 2];
            return 'nb.' + moduleDir.replace(/^nb\.?/i, '').toLowerCase();
        }

        function getFileContent(file) {
            return file.contents.toString();
        }

        function parseModuleResourcePaths(pathFileContent) {
            var htmlFragment = strip.js(pathFileContent, true);
            var document = jsdom(htmlFragment);
            var window = document.defaultView;

            return {
                css: getTagPaths(window, 'link', 'href'),
                js: getTagPaths(window, 'script', 'src')
            };
        }

        function getTagPaths(window, tagName, property) {
            return getPaths(
                getTags(window, tagName),
                property
            );
        }

        function getTags(window, tagName) {
            return window.document.getElementsByTagName(tagName);
        }

        function getPaths(tags, property) {
            return _(tags)
                .pluck(property)
                .map(convertPath)
                .value();
        }

        function convertPath(path) {
            if(path.toLowerCase().endsWith(".less")) {
                path = paths.temp + path;
                path = path.substring(0, path.length - 4) + 'css';
            } else {
                path = paths.app + path;
            }
            return path;
        }


        /*
         * css task
         */
        function addCssTask(moduleInfo) {
            if(moduleInfo.css.length > 0) {
                var taskName = 'css:module:' + moduleInfo.name;
                moduleInfo.spitits = imgpath + '/spirits_' + moduleInfo.name + '.png';
                createCssTask(taskName, moduleInfo);
                tasks.css.push(taskName);

                addSpiritTask(moduleInfo);
            }
        }

        function createCssTask(taskName, moduleInfo) {
            gulp.task(taskName, function() {
                return gulp.src(moduleInfo.css)
                    // .pipe(converLessToCss())
                    .pipe(getSpriter(moduleInfo))
                    .pipe(getConcat(moduleInfo.name + '.css', '\r\n'))
                    .pipe(replaceBackgroundImagePath())
                    .pipe(postcss([
                        autoprefixer({
                            browser: ['last 2 version']
                        })
                    ]))
                    .pipe(gulp.dest(cssPath))
                    .pipe(renameMin())
                    .pipe(minCss())
                    .pipe(gulp.dest(cssPath));
            });
        }

        // function converLessToCss() {
        //     return gulpIf(isLess, less({
        //         sm: 'on'
        //     }));
        // }
        //
        // function isLess(file) {
        //     return file.path
        //         .toLowerCase()
        //         .endsWith('.less');
        // }

        function getSpriter(moduleInfo) {
            return spriter({
                    spriteSheet: moduleInfo.spitits,
                    pathToSpriteSheetFromCSS: '../img/spirits_' + moduleInfo.name + '.png',
                    spritesmithOptions: {
                        padding: 5
                    },
                    ignore: [
                        paths.app + '/img/**/*.*',
                        '**/img/**/*.*',
                        '**/*.gif'
                    ]
                })
                .on('log', function(message) {
                    console.log(message);
                });
        }

        function replaceBackgroundImagePath() {
            return replace(/(\.\.\/){2,}/gi, '../');
        }

        function minCss() {
            return minifyCss({
                restructuring: false,
                advanced: false,
                compatibility: '*',
                keepBreaks: false
            });
        }


        /*
         * spirit task
         */
        function addSpiritTask(moduleInfo) {
            var taskName = 'css:module:spirit:' + moduleInfo.name;
            createSpiriteTask(taskName, moduleInfo);
            tasks.spirit.push(taskName);
        }

        function createSpiriteTask(taskName, moduleInfo) {
            gulp.task(taskName, function() {
                return gulp.src(moduleInfo.spitits)
                    .pipe(imagemin())
                    .pipe(gulp.dest(imgpath));
            });
        }
    }
}
