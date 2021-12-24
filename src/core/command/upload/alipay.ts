import { getAndFormatConfigInfo, getArgs, readConfig } from "utils";
import { UploadResponse } from "types";
import path from "path";
import miniu, { MiniUploadOptions } from "miniu";
import semver from "semver";

async function alipay(item: string): Promise<UploadResponse> {
    const { ci: argsCI } = getArgs();
    const { info = {}, ci = argsCI } = await readConfig();
    const { appId } = info[item];
    let { versionPure: packageVersion } = getAndFormatConfigInfo(item);
    let error = null;

    if (!appId) {
        throw new Error("缺少taro-ci.config.info配置项，或缺少info[type].appId，无法上传到支付宝平台");
    }

    if (!ci) {
        throw new Error("缺少taro-ci.config.ci配置项，或缺少ci.alipay，无法上传到支付宝平台");
    }

    // 初始化配置
    miniu.setConfig(ci);

    const clientType = "alipay";
    const uploadConfig = {
        project: path.resolve("./"),
        appId,
        clientType,
        experience: true,
        onProgressUpdate: () => { },
    } as MiniUploadOptions;

    if (packageVersion && packageVersion !== "-1") {
        // 上传版本字符串
        const uploadLastVersion = await miniu.getUploadVersion({
            appId,
            clientType,
        });
        if (!semver.gt(packageVersion, uploadLastVersion)) {
            // 传入的版本比最新版本号小，则最新版本号自增1
            packageVersion = semver.inc(uploadLastVersion, "patch");
        }
        uploadConfig.packageVersion = packageVersion;
    }

    const result = await miniu.miniUpload(uploadConfig).catch((err) => (error = new Error(`${err.message}`)));

    return {
        item,
        result,
        error
    }
}

export default alipay;
