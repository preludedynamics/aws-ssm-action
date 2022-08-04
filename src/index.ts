import AWS, {AWSError} from "aws-sdk";
import * as core from "@actions/core";
import {SendCommandResult} from "aws-sdk/clients/ssm";

try {
    const inputs = parseInputs();
    core.setCommandEcho(true)

    AWS.config.update({
        accessKeyId: inputs.accessKeyId,
        secretAccessKey: inputs.secretAccessKey,
        region: inputs.region,
    });

    const ssm = new AWS.SSM();
    if (inputs.mode === 'send') {
        ssm.sendCommand(
            {
                InstanceIds: inputs.instanceIds,
                DocumentName: inputs.documentName,
                Comment: inputs.comment,
                Parameters: {
                    workingDirectory: [inputs.workingDirectory],
                    commands: [inputs.command],
                },
            },
            (err: AWSError, data: SendCommandResult) => {
                if (err) {
                    throw err;
                }
                console.log(data);
                core.setOutput("command-id", data.Command?.CommandId);
            }
        );
    } else if (inputs.mode === 'result') {
        for (const instanceId of inputs.instanceIds) {
            let params = {
                CommandId: inputs.commandId, /* required */
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
} catch (err) {
    console.error(err, err.stack);
    core.setFailed(err);
}

function parseInputs() {
    // LOCAL
    const _mode = core.getInput("mode", {required: true});

    // AWS
    const _accessKeyId = core.getInput("aws-access-key-id", {required: true});
    const _secretAccessKey = core.getInput("aws-secret-access-key", {required: true});
    const _region = core.getInput("aws-region", {required: true});

    // SSM Send Command
    const _instanceIds = core.getInput("instance-ids", {required: true});
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
