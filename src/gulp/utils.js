'use strict';

var toRootDir = './../../';

var _ = require('lodash');
var exec = require('child_process').execSync;

module.exports = {
    getSrcs: getSrcs,
    getRelativePathFromRoot: getRelativePathFromRoot,
    replacePathSeparator: replacePathSeparator,
    copyFiles: copyFiles,
    copyFile: copyFile
};

function getSrcs(parentDir, taskConfig) {
    var includeSrcs = getIncludeSrcs();
    var ignoreSrcs = getIgnoreSrcs();
    return includeSrcs.concat(ignoreSrcs);

    // return;

    function getIncludeSrcs() {
        return _.map(
            taskConfig.include,
            function(src) {
                return parentDir + src;
            }
        );
    }

    function getIgnoreSrcs() {
        return _.map(
            taskConfig.ignore,
            function(src) {
                return '!' + parentDir + src;
            }
        );
    }
}

function getRelativePathFromRoot(path) {
    return toRootDir + path;
}

function replacePathSeparator(path) {
    return path.replace(/\//g, '\\');
}

function copyFiles(files, fromFolder, toFolder) {
    // if (!fromFolder.endWith('\\')) {
    //     fromFolder += '\\';
    // }

    _.each(
        files,
        function(file) {
            var from = fromFolder + file;
            copyFile(from, toFolder);
        }
    );
}

function copyFile(from, toFolder) {
    // try {
    exec('copy /Y "' + from + '" "' + toFolder + '"');
    console.log("File Copy:" + from + " --> " + toFolder);
    // } catch (err) {
    //     console.error("File Copy Error:" + from + " --> " + toFolder);
    // }
}