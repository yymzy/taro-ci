import { BuildOptions } from "types";
import { commandTrigger, readProjectConfig } from "utils";

async function build(item: string, opts: BuildOptions) {
  const { isWatch } = opts
  const [type, ...modes] = item.split("-");

  // 生成打印指令
  let commandStr = `taro build --type ${type}`;

  if (isWatch) {
    // 开发模式，开启监听
    commandStr += " --watch";
  }

  const { miniprogramRoot } = await readProjectConfig(item);

  // 执行命令
  await commandTrigger(commandStr, isWatch, {
    MODE_ENV: modes.join("-").toLocaleUpperCase(),
    ROOT_PATH: miniprogramRoot
  });
}

export default build;
