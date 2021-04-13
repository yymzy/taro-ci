import { getAndFormatConfigInfo, readConfig } from "utils";
import path from "path";
import ci from "miniprogram-ci";  // 微信sdk
import { UploadResponse } from "types";

async function weapp(item: string): Promise<UploadResponse> {
    const config = await readConfig();
    const { appId } = config.info[item];
    const { version, description: desc, robot } = getAndFormatConfigInfo(item);
    let error = null;

    const project = new ci.Project({
        appid: appId,
        type: 'miniProgram',
        projectPath: path.resolve("./"),
        privateKeyPath: path.resolve("./", `private.${appId}.key`),
        ignores: ['node_modules/**/*'],
    });

    const result = await ci.upload({
        robot,
        project,
        version,
        desc,
        setting: {
            es6: true,
        },
        onProgressUpdate: console.log
    }).catch(err => error = err);

    return {
        error,
        result
    }
}

export default weapp;
