import minimist from "minimist";
// 命令返回
export type CommandPromiseRes = {
  code: number,
  err?: string
}

// 自定义环境变量
export type EnvCustom = {
  MODE_ENV?: string,
  PLATFORM_ENV?: string,
  ROOT_PATH?: string,
}

// 打包配置项
export type BuildOptions = {
  appId?: string,
  isWatch?: boolean,
  isCi?: boolean
};

export type Ci = { privateKey: string, toolId: string }
export type Dd = { accessToken: string, secret: string }
// 携带参数
export interface ArgsResponse extends minimist.ParsedArgs {
  robot: Robot,
  watch: boolean,
  ci?: Ci,
  dd?: Dd,
  isCi?: boolean,
  isWatch?: boolean
}

// info组内选项
export type InfoOptions = {
  appId: string,
  version?: string,
  description?: string,
  label?: string,
  tag?: string,
  robot?: number
}

// ci配置项
export type ConfigOptions = {
  name: string,
  version?: string,
  description?: string,
  type: string | Array<string>,
  info: {
    [propertys: string]: InfoOptions
  },
  useTaroPluginBuild?: boolean,
  useTaroPluginBuildBy?: "mode" | "normal",
  git?: string,
  ci?: Ci,
  dd?: Dd,
}

export type UploadResponse = {
  item: string,
  result?: {
    qrCodeUrl?: string,
    [propertys: string]: any
  },
  error: Error
}

export type Robot =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30;

export type ConfigInfoResponse = {
  version: string,
  description: string,
  label: string,
  robot?: Robot
}

export type ProjectConfig = {
  miniprogramRoot: string,
  appid: string,
  setting: {
    [propertys: string]: any
  }
}

export type PkgMap = { [propertys: string]: { label: string, key: string } };

export enum TaroEnv {
  "WEAPP" = "weapp",
  "ALIPAY" = "alipay"
}

export type Platform = "weapp" | "alipay"