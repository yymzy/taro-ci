import { readConfig } from "utils";
import path from "path";
import miniu from "miniu";       // 支付宝sdk
import { UploadResponse } from "types";

async function alipay(item: string): Promise<UploadResponse> {
    const config = await readConfig();
    const { appId } = config.info[item];
    let error = null;

    miniu.setConfig(config.ci.alipay);

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
