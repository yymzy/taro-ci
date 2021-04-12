// import ora from "ora";
// import chalk from "chalk";

import { TaroEnv } from "types";
import { getTARO_ENV, readConfig } from "utils";
import path from "path";
import ci from "miniprogram-ci";  // 微信sdk
// import miniu from "miniu";     // 支付宝sdk

async function upload(item: string) {
    const TARO_ENV = getTARO_ENV(item);
    const config = await readConfig();
    const { appId, version, description: desc } = config.info[item];
    let errInfo = null;
    let uploadResult = null;

    switch (TARO_ENV) {
        case TaroEnv.WEAPP:  // 开发环境 - 微信
            console.log("upload-weapp");
            const project = new ci.Project({
                appid: appId,
                type: 'miniProgram',
                projectPath: path.resolve("./"),
                privateKeyPath: path.resolve("./", `private.${appId}.key`),
                ignores: ['node_modules/**/*'],
            });
            uploadResult = await ci.upload({
                project,
                version,
                desc,
                setting: {
                    es6: true,
                },
                robot: 4,
                onProgressUpdate: console.log,
            }).catch((err) => {
                errInfo = err
            });
            break;
        case TaroEnv.ALIPAY:  // 开发环境 - 支付宝

            break;

        default:
            break;
    }

    if (errInfo) {
        throw errInfo
    } else {
        console.log("uploadResult", uploadResult);
    }
}


export default upload;
