'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var gulp = context.gulp;

    var plugins = context.plugins;
    var useref = plugins.useref;
    var minifyHTML = plugins.minifyHtml;

    var tasks = context.config.tasks;
    var distPath = context.config.paths.dist;

    taskHandler.dependencies = [
        tasks.staticFiles.name
    ];

    var taskConfig = {
        htmls: "**/*.html"
    };

    return taskHandler;

    function taskHandler() {
        var opts = {
            conditionals: true,
            spare: true
        };

        return gulp.src(distPath + taskConfig.htmls)
            .pipe(createUserefHandler())
            // .pipe(minifyHTML(opts))
            .pipe(gulp.dest(distPath));
    }

    function createUserefHandler() {
        return useref({ nbjs: nbjsHandler, nbcss: nbcssHandler });
    }

    function nbjsHandler(content, target, options, alternateSearchPath) {
        //console.log("nbjs......" + target);
        return '<script type="text/javascript" src="' + target + '"></script>';
    }

    function nbcssHandler(content, target, options, alternateSearchPath) {
        //console.log("nbcss......" + target);
        return '<link rel="stylesheet" type="text/css" href="' + target + '" />';
    }
}
