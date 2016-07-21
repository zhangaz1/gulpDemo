'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var gulp = context.gulp;

    var plugins = context.plugins;
    var less = plugins.less;
    var sourcemaps = plugins.sourcemaps;
    var rename = plugins.rename;
    var minifyCss = plugins.minifyCss;
    var sequence = plugins.sequence;

    var postcss = plugins.postcss;
    var autoprefixer = context.autoprefixer;

    var appPath = context.config.paths.app;

    return createTaskHandler();

    function createTaskHandler() {
        var lessPath = appPath + '/css/less/global.less';
        var cssPath = appPath + '/css/';

        gulp.task('global-less', function() {
            return gulp.src(lessPath)
                .pipe(sourcemaps.init())
                .pipe(less({
                    sm: 'on'
                }))
                .pipe(postcss([
                    autoprefixer({
                        browser: ['last 2 version']
                    })
                ]))
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(cssPath));
        });

        gulp.task('global-min', function() {
            return gulp.src(cssPath + 'global.css')
                .pipe(rename({
                    suffix: '.min'
                }))
                .pipe(minifyCss({
                    restructuring: false,
                    advanced: false,
                    compatibility: '*',
                    keepBreaks: false
                }))
                .pipe(gulp.dest(cssPath))
        });

        return sequence('global-less', 'global-min');
    }
}
