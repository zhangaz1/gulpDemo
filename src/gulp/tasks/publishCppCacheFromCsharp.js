'use strict';

module.exports = taskFactory;

function taskFactory(context) {
    var _ = context._;
    var exec = context.exec;

    var utils = context.utils;
    var gutil = context.plugins.util;

    var binDir = '/bin';

    return taskHandler;

    function taskHandler() {
        var cpp = require(utils.getRelativePathFromRoot('./cpp.json'));

        var configPath = utils.getRelativePathFromRoot(cpp.NGWebServicesRoot) + '/config.json';
        var config = require(configPath);

        if (config.dependencies != undefined) {
            var cacheFolder = utils.replacePathSeparator(cpp.NGWebServicesRoot + binDir + '/');

            var publishFolder = cpp.PublishSettings.NGWebServicesRoot;
            publishFolder = publishFolder.replace(/\$buildType\$/ig, gutil.env.buildType);
            var webBin_Publish = utils.replacePathSeparator(publishFolder + binDir);

            if (config.dependencies.cpp != undefined) {
                utils.copyFiles(
                    config.dependencies.cpp,
                    cacheFolder,
                    webBin_Publish
                );
            }
            if (config.dependencies.external != undefined) {
                utils.copyFiles(
                    config.dependencies.external,
                    cacheFolder,
                    webBin_Publish
                );
            }
        }
    }

}