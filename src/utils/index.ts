import { spawn } from "child_process";
import chalk from "chalk";
import path from "path";

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

    // 打印当前执行的指令
    console.log(chalk.red("COMMAND:"), commandStr, chalk.red("MODE_ENV:"), env.MODE_ENV)

    // 打印数据输出
    subprocess.stdout.on('data', consoleBufferByTheme);

    // 打印错误输出
    subprocess.stderr.on('data', data => {
      consoleBufferByTheme(data);
      resolve({ code: 0 });
    });

    // 监听报错信息
    subprocess.on('error', (err) => console.error(err));
  })
}

/**
 * 
 * @param name 
 * @returns 
 */
export function readConfig(name: string) {
  try {
    const config = require(path.resolve("./", name));
    return typeof config === 'function' ? config(merge) : config
  } catch (error) {
    return {}
  }
}


export function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
export function isArray(arr) {
  return Array.isArray(arr)
}
/**
 * @description 合并数据
 * @param target 
 * @param arg 
 * @returns 
 */
export function merge(target, ...arg) {
  return arg.reduce((acc, cur) => {
    return Object.keys(cur).reduce((subAcc, key) => {
      const srcVal = cur[key]
      if (isObject(srcVal)) {
        subAcc[key] = merge(subAcc[key] ? subAcc[key] : {}, srcVal)
      } else if (isArray(srcVal)) {
        subAcc[key] = srcVal.map((item, idx) => {
          if (isObject(item)) {
            const curAccVal = subAcc[key] ? subAcc[key] : []
            return merge(curAccVal[idx] ? curAccVal[idx] : {}, item)
          } else {
            return item
          }
        })
      } else {
        subAcc[key] = srcVal
      }
      return subAcc
    }, acc)
  }, target)
}
