// 命令返回
export type CommandPromiseRes = {
  code: number,
  err?: string
}

// 自定义环境变量
export type EnvCustom = {
  MODE_ENV: string,
  [propertys: string]: any;
}

export type ConfigOptions = {
  appId?: string,
  isWatch?: boolean
};

type InfoOptsion = {
  appId: string,
  version?: string,
  description?: string,
}

export type UploadOptions = {
  version: string,
  description: string,
  type: string | Array<string>,
  info: {
    [propertys: string]: InfoOptsion
  }
}

export enum TaroEnv {
  "WEAPP" = "WEAPP",
  "ALIPAY" = "ALIPAY"
}
