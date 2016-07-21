'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var _ = context._;
    var map = context.map;

    var gulp = context.gulp;
    var plugins = context.plugins;
    var concat = plugins.concat;
    var rename = plugins.rename;
    var sequence = plugins.sequence;

    var paths = context.config.paths;
    var appPath = paths.app;
    var distPath = paths.dist;

    var taskConfig = {
        officialFile: {
            name: 'libs:officialFile',
            include: [
                '/lib/**/**',
                '/lib/**/*.*'
            ],
            ignore: ['/lib/module-*.json'],
            dir: '/lib/'
        },
        jsCollect: {
            name: 'libs:jsCollect',
            modulesSrc: '/lib/**/module-js-*.json',
            modules: []
        },
        cssCollect: {
            name: 'libs:cssCollect',
            modulesSrc: '/lib/**/module-css-*.json',
            modules: []
        },
        createJsTasks: {
            key: 'js',
            name: 'libs:createJsTasks'
        },
        createCssTasks: {
            key: 'css',
            name: 'libs:createCssTasks'
        },
        runJsTasks: {
            name: 'libs:runJsTasks'
        },
        runCssTasks: {
            name: 'libs:runCssTasks'
        }
    };

    var tasks = context.config.tasks;

    return createTaskHandler();

    function createTaskHandler() {
        createOfficialFilesTask();

        createJsCollectTask();
        createCssCollectTask();

        createJsTasks();
        createCssTasks();

        return sequence([
            taskConfig.officialFile.name,
            taskConfig.jsCollect.name,
            taskConfig.cssCollect.name
        ], [
            taskConfig.createJsTasks.name,
            taskConfig.createCssTasks.name
        ], [
            taskConfig.runJsTasks.name,
            taskConfig.runCssTasks.name
        ]);
    }

    function createOfficialFilesTask() {
        var officialFileTaskConfig = taskConfig.officialFile;
        var srcs = context.utils.getSrcs(appPath, officialFileTaskConfig);
        var path = distPath + officialFileTaskConfig.dir;

        gulp.task(taskConfig.officialFile.name, function () {
            return gulp.src(srcs).pipe(gulp.dest(path));
        });
    }

    function createJsCollectTask() {
        createCollectTask(taskConfig.jsCollect);
    }

    function createCssCollectTask() {
        createCollectTask(taskConfig.cssCollect);
    }

    function createCollectTask(config) {
        gulp.task(config.name, function () {
            var modules = config.modules;

            return gulp.src(appPath + config.modulesSrc)
                .pipe(map(function (file, callback) {
                    modules.push(file.path);
                    callback(null, file);
                }));
        }
        );
    }

    function createJsTasks() {
        createCreateTask(taskConfig.createJsTasks.key);
    }

    function createCssTasks() {
        createCreateTask(taskConfig.createCssTasks.key);
    }

    function createCreateTask(key) {
        var captionKey = caption(key);

        var taskName = taskConfig['create' + captionKey + 'Tasks'].name;
        var modules = taskConfig[key + 'Collect'].modules;
        var runTaskName = taskConfig['run' + captionKey + 'Tasks'].name;

        gulp.task(taskName, function () {
            var moduleTasks = [];

            _.each(modules, function (file) {
                addTask(file, moduleTasks, key);
            }
            );

            gulp.task(runTaskName, moduleTasks);
        }
        );
    }

    function addTask(file, moduleTasks, key) {
        var module = require(file);

        if (module[key].length > 0) {
            var taskName = 'libs:' + key + 'module:' + module.name;

            moduleTasks.push(taskName);
            createModuleTask(taskName, module, key);
        }
    }

    function createModuleTask(taskName, module, key) {
        gulp.task(taskName, function () {
            return gulp.src(module[key])
                .pipe(concat(module.name + '.' + key, { newLine: ';\r\n' }))
                .pipe(rename({ suffix: '.min' }))
                .pipe(gulp.dest(distPath + '/' + key + '/'));
        });
    }

    function caption(key) {
        key = (key || '').toString();

        return key.length < 0 ? key : _.first(key).toUpperCase().concat(key.substring(1));
    }

}