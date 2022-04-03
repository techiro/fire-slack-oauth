export class SlackError extends Error {
  constructor(e?: string) {
    super(e);
    this.name = new.target.name;
  }
}

// BaseErrorを継承して、新しいエラーを作る
// statusCode属性にHTTPのステータスコードが格納できるように
export class NetworkAccessError extends SlackError {
  constructor(public statusCode: number, e?: string) {
    super(e);
  }
}

// 追加の属性がなければ、コンストラクタも定義不要
export class NoWorkSpaceError extends SlackError {}
