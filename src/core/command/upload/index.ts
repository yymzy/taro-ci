import { TaroEnv, UploadResponse } from "types";
import { getArgs, getTARO_ENV } from "utils";
import weapp from "./weapp";
import alipay from "./alipay";

async function upload(item: string): Promise<UploadResponse> {
    const { isCi, isWatch } = getArgs()
    if (isWatch || !isCi) {
        throw new Error(`${item}，未传入robot或者开发模式无法上传`);
    }
    const TARO_ENV = getTARO_ENV();

    switch (TARO_ENV) {
        case TaroEnv.WEAPP:  // 开发环境 - 微信
            return await weapp(item);

        case TaroEnv.ALIPAY:  // 开发环境 - 支付宝
            return await alipay(item);

        default:
            throw new Error(`不支持上传该平台，目前支持：${TaroEnv.WEAPP}、${TaroEnv.ALIPAY}`);

    }
}


export default upload;
