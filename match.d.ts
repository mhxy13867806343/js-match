/**
 * 仿rust 风格的 match 语法糖 - TypeScript 定义
 * @version 1.2.2
 * @author mhxy13867806343
 */

// 基础类型定义
type Pattern<T> = T | RegExp | ((value: T) => boolean) | GeneratorFunction | Promise<T>;
type Handler<T, R> = R | ((value: T, ...args: any[]) => R);
type AsyncHandler<T, R> = R | ((value: T, ...args: any[]) => Promise<R>);

// 匹配结果类型
interface MatchResult<R> {
  value: R;
  matched: boolean;
}

// 主要API接口
interface MatchAPI<T> {
  /**
   * 添加匹配模式
   * @param pattern 匹配模式：值、正则表达式、函数条件、生成器或Promise
   * @param handler 处理函数或返回值
   */
  with<R>(pattern: Pattern<T>, handler: Handler<T, R>): MatchAPI<T> | R;
  
  /**
   * 异步匹配模式
   * @param pattern 异步匹配模式
   * @param handler 异步处理函数或返回值
   */
  withAsync<R>(pattern: Pattern<T>, handler: AsyncHandler<T, R>): Promise<MatchAPI<T> | R>;
  
  /**
   * 默认处理（当没有模式匹配时）
   * @param handler 默认处理函数或返回值
   */
  otherwise<R>(handler: Handler<T, R>): MatchAPI<T>;
  
  /**
   * 执行匹配
   */
  run<R>(): R;
  
  /**
   * 异步执行匹配
   */
  runAsync<R>(): Promise<R>;
}

// 链式API接口
interface ChainAPI<T> {
  /**
   * 添加匹配条件
   * @param pattern 匹配模式
   * @param handler 处理函数或返回值
   */
  case<R>(pattern: Pattern<T>, handler: Handler<T, R>): ChainAPI<T> | MatchResult<R>;
  
  /**
   * 异步匹配条件
   * @param pattern 异步匹配模式
   * @param handler 异步处理函数或返回值
   */
  caseAsync<R>(pattern: Pattern<T>, handler: AsyncHandler<T, R>): Promise<ChainAPI<T> | MatchResult<R>>;
  
  /**
   * 默认情况
   * @param handler 默认处理函数或返回值
   */
  default<R>(handler: Handler<T, R>): MatchResult<R>;
}

// 模式对象类型（用于when方法）
type PatternObject<T, R> = {
  [key: string]: Handler<T, R>;
  _?: Handler<T, R>; // 默认情况
};

// Rust风格的arm类型
type RustArm<T, R> = [Pattern<T> | '_', Handler<T, R>];

// 主要的match函数接口
interface MatchFunction {
  /**
   * 创建匹配实例
   * @param value 要匹配的值
   */
  <T>(value: T): MatchAPI<T>;
  
  /**
   * 单行简写风格
   * @param value 要匹配的值
   * @param patterns 模式对象
   */
  when<T, R>(value: T, patterns: PatternObject<T, R>): R;
  
  /**
   * 异步单行简写风格
   * @param value 要匹配的值
   * @param patterns 异步模式对象
   */
  whenAsync<T, R>(value: T, patterns: PatternObject<T, R>): Promise<R>;
  
  /**
   * 链式写法
   * @param value 要匹配的值
   */
  chain<T>(value: T): ChainAPI<T>;
  
  /**
   * Rust风格语法糖
   * @param value 要匹配的值
   * @param arms 匹配臂数组
   */
  rust<T, R>(value: T, arms: RustArm<T, R>[]): R;
  
  /**
   * 异步Rust风格语法糖
   * @param value 要匹配的值
   * @param arms 异步匹配臂数组
   */
  rustAsync<T, R>(value: T, arms: RustArm<T, R>[]): Promise<R>;
  
  /**
   * 创建生成器模式
   * @param condition 生成器条件
   */
  generator<T>(condition: (value: T) => boolean): GeneratorFunction;
  
  /**
   * 创建异步模式
   * @param condition 异步条件
   */
  async<T>(condition: (value: T) => Promise<boolean>): Promise<boolean>;
}

// 导出主要接口
declare const match: MatchFunction;
export = match;

// 全局声明（用于浏览器环境）
declare global {
  interface Window {
    match: MatchFunction;
  }
}
