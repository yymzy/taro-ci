import { getAndFormatConfigInfo, getArgs, installCommand, readConfig } from "utils";
import { UploadResponse } from "types";
import { spawn } from "child_process";

function createUploadFailMessage(noNpm = true) {
    return `上传失败${noNpm ? "，缺少swan-toolkit包" : ""}`
}

function upload(opts, reUpload = false) {
    return new Promise((resolve) => {
        const { token, version, desc, minSwanVersion } = opts;
        const [command, ...arg] = `swan upload -p ./ --token ${token} --min-swan-version ${minSwanVersion} --release-version ${version} -d ${desc.replace(/\s/, "")}`.split(/\s/g);
        const ls = spawn(command, arg, { shell: true });
        ls.on("close", code => {
            if (code === 0) {
                resolve({});
            } else if (code === 127) {
                installCommand("swan-toolkit").then(() => {
                    if (!reUpload) {
                        upload(opts, true).then(resolve).catch(resolve);
                    } else {
                        resolve({ error: createUploadFailMessage() });
                    }
                }).catch(() => {
                    resolve({ error: createUploadFailMessage() });
                });
            } else {
                resolve({ error: createUploadFailMessage(false) });
            }
        });
    })
}

async function swan(item: string): Promise<UploadResponse> {
    const { ci: argsCI } = getArgs();
    const { ci } = await readConfig();
    const { versionPure: version, description: desc, minSwanVersion } = getAndFormatConfigInfo(item);
    const { token = "" } = { ...ci, ...argsCI };
    let error = null;

    if (!token) {
        throw new Error("缺少taro-ci.config.ci配置项，或缺少ci.swan，无法上传到百度平台");
    }

    const result = await upload({ token, version, desc, minSwanVersion });

    return {
        item,
        result,
        error
    }
}

export default swan;
