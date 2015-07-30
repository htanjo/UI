(function (angular) {

    var OPT_PATH = ['shakyshane', 'rewrite-rules'];

    angular
        .module("BrowserSync")
        .directive("rewriteRules", function () {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    "options": "=",
                    "pluginOpts": "=",
                    "uiOptions": "="
                },
                templateUrl: "rewrite.directive.html",
                controller: ["$scope", "Socket", rewriteRulesDirective],
                controllerAs: "ctrl"
            };
        });

    /**
     * Rewrite Rules Directive
     * @param $scope
     * @param Socket
     */
    function rewriteRulesDirective($scope, Socket) {

        var ctrl    = this;
        var ns      = OPT_PATH.join(":");

        ctrl.plugin = $scope.options.userPlugins.filter(function (item) {
            return item.name === "Rewrite Rules";
        })[0];

        ctrl.plugin.opts = $scope.uiOptions[OPT_PATH[0]][OPT_PATH[1]];
        ctrl.rules       = ctrl.plugin.opts.rules;

        var config = ctrl.plugin.opts.config;

        ctrl.buttonText = "Add Rewrite Rule";

        ctrl.state = {
            classname: "ready",
            adding: false
        };

        ctrl.inputs = {
            match: {
                type: 'string',
                value: ''
            },
            replace: {
                type: 'string',
                value: ''
            }
        };

        ctrl.showInputs = function () {
            if (!ctrl.state.adding) {
                ctrl.state.adding = true;
                ctrl.buttonText = "Cancel";
            } else {
                ctrl.state.adding = false;
                ctrl.buttonText = "Add Rewrite Rule";
            }
        };

        ctrl.setMatchType = function (type) {
            ctrl.inputs.match.type = type;
        };

        ctrl.setReplaceType = function (type) {
            ctrl.inputs.replace.type = type;
        };

        ctrl.setReplaceType = function (type) {
            ctrl.inputs.replace.type = type;
        };

        ctrl.toggleState = function (rule) {
            rule.active = !rule.active;
        };

        ctrl.resetForm = function () {
            ctrl.buttonText = "Add Rewrite Rule";
            ctrl.showErrors = false;
            ctrl.inputs.match.value   = "";
            ctrl.inputs.replace.value = "";
        };

        ctrl.saveRule = function () {
            var match   = ctrl.inputs.match;
            var replace = ctrl.inputs.replace;

            if (!$scope.rewriteForm.$valid) {
                ctrl.showErrors = true;
                return;
            }

            Socket.uiEvent({
                namespace: ns,
                event: 'addRule',
                data: {
                    match: match,
                    replace: replace
                }
            });

            ctrl.state.classname = 'waiting';
            setTimeout(function () {
                ctrl.state.classname = 'success';
                $scope.$digest();
                setTimeout(function () {
                    ctrl.state.classname = 'ready';
                    ctrl.state.adding = false;
                    ctrl.resetForm();
                    $scope.$digest();
                }, 1000 );
            }, 500);
        };

        ctrl.update = function (data) {
            ctrl.plugin.opts  = data.opts;
            ctrl.rules = data.rules;
            $scope.$digest();
        };

        ctrl.updateRules = function (data) {
            ctrl.rules = data.rules;
            $scope.$digest();
        };

        ctrl.removeRule = function (action, rule) {
            Socket.uiEvent({
                namespace: ns,
                event: 'removeRule',
                data: {
                    rule: rule
                }
            });
        };

        ctrl.pauseRule = function (action, rule) {
            rule.active = !rule.active;
            Socket.uiEvent({
                namespace: ns,
                event: 'pauseRule',
                data: {
                    rule: rule
                }
            });
        };

        Socket.on(config.EVENT_UPDATE, ctrl.updateRules);

        Socket.on("options:update", ctrl.update);

        $scope.$on("$destory", function () {
            Socket.off("options:update", ctrl.update);
        });
    }

})(angular);