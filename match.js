/**
 * 仿rust 风格的 match 语法糖
 * 通用零依赖 match 工具 
 * 支持四种风格的模式匹配 + 正则表达式 + async/await + Promise + 生成器
 * @version 1.2.2
 * @author mhxy13867806343
 */ 

// 核心匹配函数 
function match(value) { 
  const matchers = []; 
  let defaultHandler = null; 
  let executed = false; 
  let isAsync = false;

  const api = { 
    // 对象表达式风格 
    with(pattern, handler) { 
      if (executed) return api; 
      
      // 正则表达式匹配
      if (pattern instanceof RegExp) {
        if (typeof value === 'string' && pattern.test(value)) {
          const matches = value.match(pattern);
          const result = typeof handler === 'function' ? handler(value, matches) : handler;
          executed = true;
          return result;
        }
      }
      // 生成器函数匹配
      else if (typeof pattern === 'function' && pattern.constructor.name === 'GeneratorFunction') {
        const generator = pattern(value);
        let genResult = generator.next();
        if (!genResult.done && genResult.value) {
          const result = typeof handler === 'function' ? handler(value, generator) : handler;
          executed = true;
          return result;
        }
      }
      // Promise 匹配 (标记为异步)
      else if (pattern instanceof Promise) {
        isAsync = true;
        return pattern.then(resolvedPattern => {
          if (resolvedPattern === value) {
            return typeof handler === 'function' ? handler(value) : handler;
          }
          return api;
        });
      }
      // 对象模式匹配 
      else if (typeof pattern === 'object' && pattern !== null) { 
        let allMatch = true;
        for (const [key, expectedValue] of Object.entries(pattern)) { 
          if (!value || value[key] !== expectedValue) {
            allMatch = false;
            break;
          }
        }
        if (allMatch) {
          const result = typeof handler === 'function' ? handler(value) : handler; 
          executed = true; 
          return result; 
        }
      } 
      // 函数条件匹配或值匹配
      else if (pattern === value || (typeof pattern === 'function' && pattern(value))) { 
        const result = typeof handler === 'function' ? handler(value) : handler; 
        executed = true; 
        return result; 
      } 
      
      matchers.push({ pattern, handler }); 
      return api; 
    }, 

    // 异步匹配方法
    async withAsync(pattern, handler) {
      if (executed) return api;
      
      // 异步函数模式匹配
      if (typeof pattern === 'function' && pattern.constructor.name === 'AsyncFunction') {
        try {
          const result = await pattern(value);
          if (result) {
            const handlerResult = typeof handler === 'function' ? await handler(value) : handler;
            executed = true;
            return handlerResult;
          }
        } catch (error) {
          // 异步函数执行失败，继续下一个匹配
        }
      }
      // Promise 模式匹配
      else if (pattern instanceof Promise) {
        try {
          const resolvedPattern = await pattern;
          if (resolvedPattern === value || (typeof resolvedPattern === 'function' && resolvedPattern(value))) {
            const result = typeof handler === 'function' ? await handler(value) : handler;
            executed = true;
            return result;
          }
        } catch (error) {
          // Promise 失败，继续下一个匹配
        }
      }
      
      return this.with(pattern, handler);
    },

    // 默认处理 
    otherwise(handler) { 
      if (executed) return api; 
      
      defaultHandler = handler; 
      return api; 
    }, 

    // 执行匹配 
    run() { 
      if (executed) return; 
      
      for (const { pattern, handler } of matchers) { 
        // 正则表达式匹配
        if (pattern instanceof RegExp) {
          if (typeof value === 'string' && pattern.test(value)) {
            const matches = value.match(pattern);
            return typeof handler === 'function' ? handler(value, matches) : handler;
          }
        }
        // 生成器函数匹配
        else if (typeof pattern === 'function' && pattern.constructor.name === 'GeneratorFunction') {
          const generator = pattern(value);
          let genResult = generator.next();
          if (!genResult.done && genResult.value) {
            return typeof handler === 'function' ? handler(value, generator) : handler;
          }
        }
        // 普通函数条件匹配
        else if (typeof pattern === 'function') { 
          if (pattern(value)) { 
            return typeof handler === 'function' ? handler(value) : handler; 
          } 
        } 
        // 值匹配
        else if (pattern === value) { 
          return typeof handler === 'function' ? handler(value) : handler; 
        } 
      } 
      
      if (defaultHandler) { 
        return typeof defaultHandler === 'function' ? defaultHandler(value) : defaultHandler; 
      } 
      
      throw new Error(`No matching pattern found for value: ${value}`); 
    },

    // 异步执行匹配
    async runAsync() {
      if (executed) return;
      
      for (const { pattern, handler } of matchers) {
        // 异步函数模式匹配
        if (typeof pattern === 'function' && pattern.constructor.name === 'AsyncFunction') {
          try {
            const result = await pattern(value);
            if (result) {
              return typeof handler === 'function' ? await handler(value) : handler;
            }
          } catch (error) {
            continue;
          }
        }
        // Promise 模式匹配
        else if (pattern instanceof Promise) {
          try {
            const resolvedPattern = await pattern;
            if (resolvedPattern === value) {
              return typeof handler === 'function' ? await handler(value) : handler;
            }
          } catch (error) {
            continue;
          }
        }
        // 其他模式使用同步方式
        else {
          try {
            const syncResult = this.run();
            if (syncResult !== undefined) return syncResult;
          } catch (error) {
            continue;
          }
        }
      }
      
      if (defaultHandler) {
        return typeof defaultHandler === 'function' ? await defaultHandler(value) : defaultHandler;
      }
      
      throw new Error(`No matching pattern found for value: ${value}`);
    }
  }; 

  return api; 
} 

// 单行简写风格 (增强版)
match.when = (value, patterns) => { 
  for (const [pattern, handler] of Object.entries(patterns)) { 
    if (pattern === '_') continue; // 跳过默认情况 
    
    // 正则表达式匹配
    if (pattern instanceof RegExp || (typeof pattern === 'string' && pattern.startsWith('/') && pattern.endsWith('/'))) {
      let regex = pattern;
      if (typeof pattern === 'string') {
        regex = new RegExp(pattern.slice(1, -1));
      }
      if (typeof value === 'string' && regex.test(value)) {
        const matches = value.match(regex);
        return typeof handler === 'function' ? handler(value, matches) : handler;
      }
    }
    // 字符串值匹配
    else if (typeof pattern === 'string' && pattern === value) { 
      return typeof handler === 'function' ? handler(value) : handler; 
    } 
    // 函数条件匹配
    else if (typeof pattern === 'function' && pattern(value)) { 
      return typeof handler === 'function' ? handler(value) : handler; 
    } 
  } 
  
  // 处理默认情况 
  if (patterns._) { 
    return typeof patterns._ === 'function' ? patterns._(value) : patterns._; 
  } 
  
  throw new Error(`No matching pattern found for value: ${value}`); 
}; 

// 异步版本的 when
match.whenAsync = async (value, patterns) => {
  for (const [pattern, handler] of Object.entries(patterns)) {
    if (pattern === '_') continue;
    
    // Promise 模式匹配
    if (pattern instanceof Promise) {
      try {
        const resolvedPattern = await pattern;
        if (resolvedPattern === value) {
          return typeof handler === 'function' ? await handler(value) : handler;
        }
      } catch (error) {
        continue;
      }
    }
    // 异步函数匹配
    else if (typeof pattern === 'function' && pattern.constructor.name === 'AsyncFunction') {
      try {
        const result = await pattern(value);
        if (result) {
          return typeof handler === 'function' ? await handler(value) : handler;
        }
      } catch (error) {
        continue;
      }
    }
    // 其他模式使用同步方式
    else {
      try {
        return match.when(value, { [pattern]: handler, '_': null });
      } catch (error) {
        continue;
      }
    }
  }
  
  if (patterns._) {
    return typeof patterns._ === 'function' ? await patterns._(value) : patterns._;
  }
  
  throw new Error(`No matching pattern found for value: ${value}`);
};

// 链式写法 (增强版)
match.chain = (value) => { 
  const chain = { 
    case(pattern, handler) { 
      // 正则表达式匹配
      if (pattern instanceof RegExp) {
        if (typeof value === 'string' && pattern.test(value)) {
          const matches = value.match(pattern);
          const result = typeof handler === 'function' ? handler(value, matches) : handler;
          return { value: result, matched: true };
        }
      }
      // 生成器函数匹配
      else if (typeof pattern === 'function' && pattern.constructor.name === 'GeneratorFunction') {
        const generator = pattern(value);
        let genResult = generator.next();
        if (!genResult.done && genResult.value) {
          const result = typeof handler === 'function' ? handler(value, generator) : handler;
          return { value: result, matched: true };
        }
      }
      // 普通匹配
      else if (pattern === value || (typeof pattern === 'function' && pattern(value))) { 
        const result = typeof handler === 'function' ? handler(value) : handler; 
        return { value: result, matched: true }; 
      } 
      return chain; 
    }, 
    
    // 异步 case
    async caseAsync(pattern, handler) {
      // 异步函数匹配
      if (typeof pattern === 'function' && pattern.constructor.name === 'AsyncFunction') {
        try {
          const result = await pattern(value);
          if (result) {
            const handlerResult = typeof handler === 'function' ? await handler(value) : handler;
            return { value: handlerResult, matched: true };
          }
        } catch (error) {
          return chain;
        }
      }
      // Promise 匹配
      else if (pattern instanceof Promise) {
        try {
          const resolvedPattern = await pattern;
          if (resolvedPattern === value) {
            const result = typeof handler === 'function' ? await handler(value) : handler;
            return { value: result, matched: true };
          }
        } catch (error) {
          return chain;
        }
      }
      
      return this.case(pattern, handler);
    },
    
    default(handler) { 
      const result = typeof handler === 'function' ? handler(value) : handler; 
      return { value: result, matched: true }; 
    } 
  }; 
  
  return chain; 
}; 

// Rust 风格语法糖 (增强版)
match.rust = (value, arms) => { 
  for (const arm of arms) { 
    const [pattern, handler] = arm; 
    
    if (pattern === '_') { 
      return typeof handler === 'function' ? handler(value) : handler; 
    } 
    
    // 正则表达式匹配
    if (pattern instanceof RegExp) {
      if (typeof value === 'string' && pattern.test(value)) {
        const matches = value.match(pattern);
        return typeof handler === 'function' ? handler(value, matches) : handler;
      }
    }
    // 生成器函数匹配
    else if (typeof pattern === 'function' && pattern.constructor.name === 'GeneratorFunction') {
      const generator = pattern(value);
      let genResult = generator.next();
      if (!genResult.done && genResult.value) {
        return typeof handler === 'function' ? handler(value, generator) : handler;
      }
    }
    // 普通匹配
    else if (pattern === value || (typeof pattern === 'function' && pattern(value))) { 
      return typeof handler === 'function' ? handler(value) : handler; 
    } 
  } 
  
  throw new Error(`No matching pattern found for value: ${value}`); 
}; 

// 异步版本的 Rust 风格
match.rustAsync = async (value, arms) => {
  for (const arm of arms) {
    const [pattern, handler] = arm;
    
    if (pattern === '_') {
      return typeof handler === 'function' ? await handler(value) : handler;
    }
    
    // 异步函数匹配
    if (typeof pattern === 'function' && pattern.constructor.name === 'AsyncFunction') {
      try {
        const result = await pattern(value);
        if (result) {
          return typeof handler === 'function' ? await handler(value) : handler;
        }
      } catch (error) {
        continue;
      }
    }
    // Promise 匹配
    else if (pattern instanceof Promise) {
      try {
        const resolvedPattern = await pattern;
        if (resolvedPattern === value) {
          return typeof handler === 'function' ? await handler(value) : handler;
        }
      } catch (error) {
        continue;
      }
    }
    // 其他模式使用同步方式
    else {
      try {
        return match.rust(value, [[pattern, handler]]);
      } catch (error) {
        continue;
      }
    }
  }
  
  throw new Error(`No matching pattern found for value: ${value}`);
};

// 工具函数：创建生成器模式
match.generator = function* (condition) {
  yield condition;
};

// 工具函数：创建异步模式
match.async = async (condition) => {
  return await condition;
};

// 导出 
if (typeof module !== 'undefined' && module.exports) { 
  module.exports = match; 
} else if (typeof window !== 'undefined') { 
  window.match = match; 
}
