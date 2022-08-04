"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const core = __importStar(require("@actions/core"));
try {
    const inputs = parseInputs();
    core.setCommandEcho(true);
    aws_sdk_1.default.config.update({
        accessKeyId: inputs.accessKeyId,
        secretAccessKey: inputs.secretAccessKey,
        region: inputs.region,
    });
    const ssm = new aws_sdk_1.default.SSM();
    if (inputs.mode === 'send') {
        ssm.sendCommand({
            InstanceIds: inputs.instanceIds,
            DocumentName: inputs.documentName,
            Comment: inputs.comment,
            Parameters: {
                workingDirectory: [inputs.workingDirectory],
                commands: [inputs.command],
            },
        }, (err, data) => {
            var _a;
            if (err) {
                throw err;
            }
            console.log(data);
            core.setOutput("command-id", (_a = data.Command) === null || _a === void 0 ? void 0 : _a.CommandId);
        });
    }
    else if (inputs.mode === 'result') {
        for (const instanceId of inputs.instanceIds) {
            let params = {
                CommandId: inputs.commandId,
                InstanceId: instanceId, /* required */
            };
            // @ts-ignore
            ssm.waitFor('commandExecuted', params, function (err, data) {
                if (err) {
                    throw err;
                }
                console.log(data);
            });
        }
    }
}
catch (err) {
    console.error(err, err.stack);
    core.setFailed(err);
}
function parseInputs() {
    // LOCAL
    const _mode = core.getInput("mode", { required: true });
    // AWS
    const _accessKeyId = core.getInput("aws-access-key-id", { required: true });
    const _secretAccessKey = core.getInput("aws-secret-access-key", { required: true });
    const _region = core.getInput("aws-region", { required: true });
    // SSM Send Command
    const _instanceIds = core.getInput("instance-ids", { required: true });
    const _command = core.getInput("command");
    const _workingDirectory = core.getInput("working-directory");
    const _comment = core.getInput("comment");
    const _documentName = "AWS-RunShellScript";
    // SSM Get Result
    const _commandId = core.getInput("command-id");
    return {
        mode: _mode,
        commandId: _commandId,
        accessKeyId: _accessKeyId,
        secretAccessKey: _secretAccessKey,
        region: _region,
        instanceIds: _instanceIds.split(/\n/),
        command: _command,
        documentName: _documentName,
        workingDirectory: _workingDirectory,
        comment: _comment,
    };
}
