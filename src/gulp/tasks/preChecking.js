'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var strip = require('strip-comment');
    var jsdom = require('jsdom').jsdom;

    var _ = context._;
    var map = context.map;
    var gulp = context.gulp;

    var paths = context.config.paths;

    var projectTxt = '';

    return taskHandler;

    function taskHandler() {
        projectTxt = getProjectContent();
        return gulp.src(paths.app + '/modules/**/path.js')
                .pipe(map(function (file, callback) {
                    checkModule(file);
                    callback(null, file);
                }));
    }

    function checkModule(file) {
        var moduleInfo = getModuleInfo(file);
        var files = [].concat(moduleInfo.js, moduleInfo.css);
        _.each(files, function (file) {
            var path = file.replace(/\/\//g, '\\\\');
            path = path.replace(/\//g, '\\\\');
            var reg = new RegExp(path, "gi");
            if (projectTxt.search(reg) == -1) {
                throw new Error(file + ' does not include in the project file!');
            }
        });
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
    function parseModuleResourcePaths(pathFileContent) {
        var htmlFragment = strip.js(pathFileContent, true);
        var document = jsdom(htmlFragment);
        var window = document.defaultView;

        return {
            css: getTagPaths(window, 'link', 'href'),
            js: getTagPaths(window, 'script', 'src')
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
        path = paths.app + path;
        path = path.substring(2, path.length);
        return path;
    }

    function getProjectContent() {
        var fs = require('fs');
        var txt = fs.readFileSync("./NetBrainNG.csproj", 'utf8');
        return txt;
    }
}