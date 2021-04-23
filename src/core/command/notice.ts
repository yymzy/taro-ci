import Robot from "dingtalk-robot-sdk";
import { TaroEnv, UploadResponse } from "types";
import { getAndFormatConfigInfo, getArgs, getTARO_ENV, readConfig } from "utils";

/**
 * 
 * @description 通过钉钉群发送上传结果通知
 */
async function notice(uploadResponse: UploadResponse) {
    const { result, error, item } = uploadResponse;
    console.log("getArgs()", getArgs());
    const { dd: argsDD } = getArgs();
    const { dd = argsDD, name, git = `https://newgitlab.kuaidihelp.com/MINIAPP/${name}/-/jobs/` } = readConfig();
    const { version, description, label } = getAndFormatConfigInfo(item);
    const TARO_ENV = getTARO_ENV();
    const { qrCodeUrl } = result || {};
    if (!dd) {
        throw new Error("缺少taro-ci.config.notice配置项，无法发送钉钉通知");
    }
    const ddIns = new Robot(dd);

    const markdownTitle = `[${item}]${name}`.toUpperCase() + "：" + label;
    const content = new Robot.Markdown()
        .setTitle(markdownTitle)
        .add(`[${markdownTitle}](${git})\n`)

    if (error) {
        content.add(`**上传结果：上传失败**<font color="red">（${error.message}）</font>`);
    } else {
        content.add(`**上传结果：上传成功**${TARO_ENV === TaroEnv.ALIPAY ? "【发布后合并到master】" : ""}`)
            .add(`1. version：${version}`)
            .add(`2. description：${description}`)
            .add(qrCodeUrl ? `\n![二维码](${qrCodeUrl})` : "");
    }

    ddIns.send(content);
}

export default notice;