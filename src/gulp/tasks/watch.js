'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var _ = context._;
    var map = context.map;
    var gulp = context.gulp;

    var plugins = context.plugins;
    var less = plugins.less;
    var rename = plugins.rename;

    var tasks = context.config.tasks;
    var appPath = context.config.paths.app;
    var newLine = '\r\n';

    return taskHandler;

    function taskHandler() {
        gulp.watch(appPath + '/modules/**/module.json', moduleChangeHandler);
        gulp.watch(appPath + '/modules/**/*.less', modulesLessChangeHandler);
        gulp.watch(appPath + '/lib/bootstrap/less/**/*.less', bootstrapLessChangeHandler);
        gulp.watch(appPath + '/less/**/*.less', lessChangeHandler);
    }

    function moduleChangeHandler(event) {
        logEvent(event);

        var path = event.path;

        gulp.src(path)
            .pipe(convertJsonToPath(path))
            .pipe(rename("path.js"))
            .pipe(gulp.dest(getDir(path)))
    }

    function convertJsonToPath(path) {
        return map(function (file, callback) {
            var json = require(path);
            var jsFragment = createJsFragment(json);
            file.contents = new Buffer(jsFragment);
            callback(null, file);
        });
    }

    function createJsFragment(json) {
        return createJsFragmentForCss(json.css) + newLine + createJsFragmentForJs(json.js);
    }

    function createJsFragmentForCss(css) {
        var paths = insertEmptyString(css);
        return _(paths).reduce(function (jsFragment, path) {
            return jsFragment + newLine + writeLink(path);
        });
    }

    function createJsFragmentForJs(js) {
        var paths = insertEmptyString(js);
        return _(paths).reduce(function (jsFragment, path) {
            return jsFragment + newLine + writeScript(path);
        });
    }

    function insertEmptyString(arr) {
        return [''].concat(arr);
    }

    function writeLink(path) {
        return "document.write('<link rel=\"stylesheet\" href=\"" + path.substring(4) + "\" />');";
    }

    function writeScript(path) {
        return "document.write('<script type=\"text/javascript\" src=\"" + path.substring(4) + "\"></script>');";
    }

    function modulesLessChangeHandler(event) {
        logEvent(event);

        var path = event.path;
        return gulp.src(path)
            .pipe(less({ sm: "on" }))
            .pipe(gulp.dest(getDir(path)));
    }

    function getDir(path) {
        return path.substring(0, path.lastIndexOf('\\'));
    }

    function logEvent(event) {
        console.log('File ', event.path, ' was ', event.type, ', running tasks...');
    }

    function bootstrapLessChangeHandler(event) {
        return gulp.start(tasks.lessBootstrap.name);
    }

    function lessChangeHandler(event) {
        return gulp.start(tasks.lessGlobal.name);
    }
}