import { TaroEnv, UploadResponse } from "types";
import { CreateProgress, getArgs, getTARO_ENV } from "utils";
import weapp from "./weapp";
import alipay from "./alipay";
import swan from "./swan";

async function upload(item: string): Promise<UploadResponse> {
    const { isCi, isWatch, isDebug } = getArgs()
    if (isWatch || !isCi) {
        throw new Error(`${item}，未传入robot或者开发模式无法上传`);
    }
    if (isDebug) {
        throw new Error(`${item}，DEBUG模式无法上传`);
    }
    const TARO_ENV = getTARO_ENV();

    let result = {} as UploadResponse;
    const progressIns = new CreateProgress("upload", item);
    progressIns.start();
    try {
        switch (TARO_ENV) {
            case TaroEnv.WEAPP:  // 开发环境 - 微信
                result = await weapp(item);
                break;

            case TaroEnv.ALIPAY:  // 开发环境 - 支付宝
                result = await alipay(item);
                break;

            case TaroEnv.SWAN:  // 开发环境 - 百度
                result = await swan(item);
                break;

            default:
                const err = new Error(`不支持上传该平台，目前支持：${TaroEnv.WEAPP}、${TaroEnv.ALIPAY}`);
                progressIns.fail(err);
                throw err;
        }
        const { error } = result;
        error
            ? progressIns.fail(error)
            : progressIns.succeed();
    } catch (err) {
        progressIns.fail(err)
    }

    return result
}


export default upload;
