import * as math from "mathjs";

export type Vector = {
  x: number;
  y: number;
};

export interface ScoreModelOption {
  a: number;
  b: number;
  c: number;
}

export class ScoreModel {
  public a: number = 0;
  public b: number = 0;
  public c: number = 0;

  constructor(score: Vector[]);
  constructor(option: ScoreModelOption);
  constructor(option: ScoreModelOption | Vector[]) {
    if (option instanceof Array) {
      this.calculateArgs(option.map((item) => ({ x: math.multiply(item.x, 1e-8), y: item.y })));
    } else {
      this.a = option.a;
      this.b = option.b;
      this.c = option.c;
    }
  }

  //幂函数公式
  f(x: number) {
    return math
      .chain(this.a)
      .multiply(math.pow(math.multiply(x, 1e-8), this.b))
      .add(this.c)
      .done() as number;
  }

  inverseF(y: number) {
    return math
      .chain(y)
      .subtract(this.c)
      .divide(this.a)
      .pow(1 / this.b)
      .multiply(1e8)
      .done() as number;
  }

  private calculateArgs(score: Vector[]) {
    this.c = this.getEstimate(score, score[0].y - 1e-8, 1e-10);
    this.b = math.divide(
      math.subtract(math.log(math.subtract(score[1].y, this.c)), math.log(math.subtract(score[0].y, this.c))),
      math.subtract(math.log(score[1].x), math.log(score[0].x))
    ) as number;
    this.a = math.exp(
      math.subtract(math.log(math.subtract(score[0].y, this.c)), math.multiply(this.b, math.log(score[0].x)))
    ) as number;
    if (this.a === 0) {
      throw new Error("数值超过上限");
    }
  }

  private getEstimate(score: Vector[], c: number, l: number) {
    let p;
    do {
      p = c;
      c = math.subtract(c, math.divide(this.fc(score, c), this.derivative(score, c))) as number;
      if (isNaN(c)) {
        throw new Error("发生未知错误");
      }
    } while (math.abs(math.subtract(c, p)) > l);
    return c;
  }

  //牛顿法
  private fc(score: Vector[], c) {
    const ly1 = math.log(math.subtract(score[0].y, c));
    const ly2 = math.log(math.subtract(score[1].y, c));
    const ly3 = math.log(math.subtract(score[2].y, c));
    const p1 = math.divide(math.subtract(ly3, ly1), math.subtract(ly2, ly1));
    const p2 = math.divide(
      math.subtract(math.log(score[2].x), math.log(score[0].x)),
      math.subtract(math.log(score[1].x), math.log(score[0].x))
    );
    return math.subtract(p1, p2) as number;
  }

  private derivative(score: Vector[], c: number) {
    const ly1 = math.log(math.subtract(score[0].y, c));
    const ly2 = math.log(math.subtract(score[1].y, c));
    const ly3 = math.log(math.subtract(score[2].y, c));
    const dly1 = math.divide(1, math.subtract(c, score[0].y));
    const dly2 = math.divide(1, math.subtract(c, score[1].y));
    const dly3 = math.divide(1, math.subtract(c, score[2].y));
    const p1 = math.divide(math.subtract(dly3, dly1), math.subtract(ly2, ly1));
    const p2 = math
      .chain(math.subtract(dly2, dly1))
      .multiply(math.subtract(ly3, ly1))
      .divide(math.pow(math.subtract(ly2, ly1), 2))
      .done();
    return math.subtract(p1, p2) as number;
  }
}
