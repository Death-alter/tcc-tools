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
      this.calculateArgs(option);
    } else {
      this.a = option.a;
      this.b = option.b;
      this.c = option.c;
    }
  }

  //幂函数公式
  f(x: number) {
    return math.chain(this.a).multiply(math.pow(x, this.b)).add(this.c).done() as number;
  }

  inverseF(y: number) {
    return math
      .chain(y)
      .subtract(this.c)
      .divide(this.a)
      .pow(1 / this.b)
      .done() as number;
  }

  private calculateArgs(score: Vector[]) {
    this.b = this.getEstimate(score, 0.01, 30, 1e-11, 100);
    this.a = math.divide(
      math.subtract(score[1].y, score[0].y),
      math.subtract(math.pow(score[1].x, this.b), math.pow(score[0].x, this.b))
    ) as number;
    this.c = math.subtract(score[0].y, math.multiply(this.a, math.pow(score[0].x, this.b))) as number;
  }

  private getEstimate(score: Vector[], b1: number, b2: number, l: number, n: number) {
    let b;
    for (let k = 0; k < n; k++) {
      if (this.secant(score, b1, b2) == 0) {
        throw new Error("出现奇异情况");
      }
      b = b2 - this.delta(score, b2) / this.secant(score, b1, b2);
      if (math.abs(math.subtract(b, b2)) < l) {
        return b;
      }
      b1 = b2;
      b2 = b;
    }
    throw new Error("迭代失败，已达最大迭代次数");
  }

  //弦截法
  private secant(score: Vector[], x1: number, x2: number) {
    return math.divide(math.subtract(this.delta(score, x2), this.delta(score, x1)), math.subtract(x2, x1));
  }

  private delta(score: Vector[], b: number) {
    const px = math.pow(score[0].x, b);
    const dy = math.divide(math.subtract(score[2].y, score[0].y), math.subtract(score[1].y, score[0].y));

    return math
      .chain(math.pow(score[2].x, b))
      .subtract(px)
      .divide(math.subtract(math.pow(score[1].x, b), px))
      .subtract(dy)
      .done() as number;
  }
}
