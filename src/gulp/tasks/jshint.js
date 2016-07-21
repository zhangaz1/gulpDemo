'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var path = context.path;
    var gulp = context.gulp;

    var plugins = context.plugins;
    var jshint = plugins.jshint;
    var gutil = plugins.util;

    var appPath = context.config.paths.app;

    var taskConfig = {
        hintOption: {
            "predef": [
                "_",
                "$",
                "angular",
                "NetBrain"
            ]
        },
        jenkinsReporterOption: {
            defaultFileName: '/jshint-checkstyle.xml',
            filename: '',
            level: 'ewi',
            sourceDir: ''
        },
        fileGlob: '/modules/**/*.js'
    };

    return createTaskHandler();

    function createTaskHandler() {
        createLocalJshintTask();

        return createJsHintTaskHandler(appPath + taskConfig.fileGlob, getJenkinsReporter());
    }

    function createLocalJshintTask() {
        gulp.task('localJshint', createJsHintTaskHandler(process.env.INIT_CWD + taskConfig.fileGlob, getLocalReporter()));
    }

    function createJsHintTaskHandler(glob, reporter) {
        return function () {
            var outputDir = gutil.env.checkResultDir;
            if (outputDir) {
                var jenkinsReporterOption = taskConfig.jenkinsReporterOption;
                jenkinsReporterOption.filename = outputDir + jenkinsReporterOption.defaultFileName; // path.join? / -> \\
            }

            return gulp.src(glob)
                .pipe(jshint(taskConfig.hintOption))
                .pipe(reporter);
        }
    }

    function getJenkinsReporter() {
        return jshint.reporter('gulp-jshint-jenkins-reporter', taskConfig.jenkinsReporterOption);
    }

    function getLocalReporter() {
        return jshint.reporter('jshint-stylish');
    }
}