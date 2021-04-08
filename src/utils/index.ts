import { spawn } from "child_process";
import chalk from "chalk";

// 命令返回
type CommandPromiseRes = {
  code: number,
  err?: string
}

// 自定义环境变量
type EnvCustom = {
  MODE_ENV: string,
  [propertys: string]: any;
}

/**
 * @description 输出配色，替换关键词
 * @param str 
 * @param tag 
 * @param color 
 * @param isAll
 * @returns 
 */
function keywordTheme(str: string, keyword: string, color: string, isAll: boolean = false): string {
  const rule = new RegExp(`^${keyword}`);
  const isMatch = isAll ? str.includes(keyword) : rule.test(str);
  return isMatch ? isAll ? chalk.hex(color)(str) : str.replace(rule, chalk.hex(color)(keyword)) : ""
}

/**
 * 
 * @description 风格化并打印结果
 */
function consoleBufferByTheme(data: ArrayBuffer): string {
  let str = data.toString().replace(/\n$/g, "");
  if (!str) return ""
  str = keywordTheme(str, "Tips:", "#f5faa4", true)
    || keywordTheme(str, "生成", "#b278ff")
    || keywordTheme(str, "编译", "#00ee76")
    || keywordTheme(str, "编译成功", "#00ee76", true)
    || keywordTheme(str, "监听文件", "#6c6f7d", true)
    || str;
  console.log(str);
  return str;
}

/**
 * 
 * @description 命令触发器：执行系统指令
 * @param commandStr 命令行字符串
 * @returns 
 */
export function commandTrigger(commandStr: string, env: EnvCustom): Promise<CommandPromiseRes> {
  return new Promise((resolve) => {
    const [command, ...arg] = commandStr.split(/\s/g);

    const subprocess = spawn(command, arg, {
      env: {
        ...process.env,
        ...env
      }
    });

    console.log(chalk.red("COMMAND："), commandStr, chalk.red("MODE_ENV："), env.MODE_ENV)

    subprocess.stdout.on('data', consoleBufferByTheme);

    subprocess.stderr.on('data', data => {
      consoleBufferByTheme(data);
      resolve({ code: 0 });
    });

    subprocess.on('error', (err) => {
      console.error(err);
    });
  })
}