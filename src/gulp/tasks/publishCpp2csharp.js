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
            var nGWebServicesRoot = cpp.PublishSettings.NGWebServicesRoot;
            nGWebServicesRoot = nGWebServicesRoot.replace(/\$buildType\$/ig, gutil.env.buildType);
            var webBin_Publish = utils.replacePathSeparator(nGWebServicesRoot + binDir);

            if (config.dependencies.cpp != undefined) {
                var backendBinRelease = utils.replacePathSeparator(cpp.ReleaseFolder + '/');
                utils.copyFiles(
                    config.dependencies.cpp,
                    backendBinRelease,
                    webBin_Publish
                );
            }
            if (config.dependencies.external != undefined) {
                var webBin = utils.replacePathSeparator(cpp.NGWebServicesRoot + binDir + '/');
                utils.copyFiles(
                    config.dependencies.external,
                    webBin,
                    webBin_Publish
                );
            }
        }
    }

}