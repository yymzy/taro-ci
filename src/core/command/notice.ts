import Robot from "dingtalk-robot-sdk";
import { TaroEnv, UploadResponse } from "types";
import { getAndFormatConfigInfo, getTARO_ENV, readConfig } from "utils";

/**
 * 
 * @description 通过钉钉群发送上传结果通知
 */
async function notice(item: string, uploadResponse: UploadResponse) {
    const { notice, name } = readConfig();
    const { version, description, label } = getAndFormatConfigInfo(item)
    const { result, error } = uploadResponse;
    const TARO_ENV = getTARO_ENV(item);
    const { qrCodeUrl } = result || {};
    const ddIns = new Robot(notice);

    const markdownTitle = `[${item}]${name}`.toUpperCase() + "：" + label;
    const content = new Robot.Markdown()
        .setTitle(markdownTitle)
        .add(`[${markdownTitle}](https://newgitlab.kuaidihelp.com/MINIAPP/${name}/-/jobs/)\n`)

    if (error) {
        content.add(`上传结果：上传失败（${error.message}）`);
    } else {
        content.add(`上传结果：上传成功${TARO_ENV === TaroEnv.ALIPAY ? "【发布后合并到master】" : ""}`)
            .add(`1. version：${version}`)
            .add(`2. description：${description}`)
            .add(qrCodeUrl ? `![二维码](${qrCodeUrl})` : "");
    }

    ddIns.send(content);
}

export default notice;