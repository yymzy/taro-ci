import { readConfig } from "utils";
import path from "path";
import miniu from "miniu";       // 支付宝sdk
import { UploadResponse } from "types";

async function alipay(item: string): Promise<UploadResponse> {
    const { info = {}, ci: { alipay } = {} } = await readConfig();
    const { appId } = info[item];
    let error = null;

    if (!appId) {
        throw new Error("缺少taro-ci.config.info配置项，或缺少info[type].appId，无法上传到支付宝平台");
    }

    if (!alipay) {
        throw new Error("缺少taro-ci.config.ci配置项，或缺少ci.alipay，无法上传到支付宝平台");
    }

    miniu.setConfig(alipay);

    const result = await miniu.miniUpload({
        project: path.resolve("./"),
        appId,
        clientType: 'alipay',
        experience: true,
        onProgressUpdate: ({ data = "" }) => console.log(data),
    }).catch(({ code, msg }) => error = new Error(`${code}：${msg}`));

    return {
        result,
        error
    }
}

export default alipay;
