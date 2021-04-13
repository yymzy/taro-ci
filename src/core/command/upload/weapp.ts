import { getAndFormatConfigInfo, readConfig } from "utils";
import path from "path";
import ci from "miniprogram-ci";  // 微信sdk
import { UploadResponse } from "types";

async function weapp(item: string): Promise<UploadResponse> {
    const { info = {} } = await readConfig();
    const { appId } = info[item];
    const { version, description: desc, robot } = getAndFormatConfigInfo(item);
    let error = null;

    if (!appId) {
        throw new Error("缺少taro-ci.config.info配置项，或缺少info[type].appId，无法上传到微信平台");
    }

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
