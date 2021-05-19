import { getArgs, readConfig } from "utils";
import path from "path";
import miniu from "miniu";
import { UploadResponse } from "types";

async function alipay(item: string): Promise<UploadResponse> {
    const { ci: argsCI } = getArgs();
    const { info = {}, ci = argsCI } = await readConfig();
    const { appId } = info[item];
    let error = null;

    if (!appId) {
        throw new Error("缺少taro-ci.config.info配置项，或缺少info[type].appId，无法上传到支付宝平台");
    }

    if (!ci) {
        throw new Error("缺少taro-ci.config.ci配置项，或缺少ci.alipay，无法上传到支付宝平台");
    }

    miniu.setConfig(ci);

    const result = await miniu.miniUpload({
        project: path.resolve("./"),
        appId,
        clientType: 'alipay',
        experience: true,
        onProgressUpdate: () => { },
    }).catch(({ code, msg }) => error = new Error(`${code}：${msg}`));

    return {
        item,
        result,
        error
    }
}

export default alipay;
