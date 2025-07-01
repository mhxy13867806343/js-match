/** 仿rust 风格的 match 语法糖
 * 通用零依赖 match 工具 
 * 支持四种风格的模式匹配 
 */ 

// 核心匹配函数 
function match(value) { 
  const matchers = []; 
  let defaultHandler = null; 
  let executed = false; 

  const api = { 
    // 对象表达式风格 
    with(pattern, handler) { 
      if (executed) return api; 
      
      if (typeof pattern === 'object' && pattern !== null) { 
        // 处理对象模式匹配 
        for (const [key, expectedValue] of Object.entries(pattern)) { 
          if (value && value[key] === expectedValue) { 
            const result = typeof handler === 'function' ? handler(value) : handler; 
            executed = true; 
            return result; 
          } 
        } 
      } else if (pattern === value || (typeof pattern === 'function' && pattern(value))) { 
        const result = typeof handler === 'function' ? handler(value) : handler; 
        executed = true; 
        return result; 
      } 
      
      matchers.push({ pattern, handler }); 
      return api; 
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
        if (typeof pattern === 'function') { 
          if (pattern(value)) { 
            return typeof handler === 'function' ? handler(value) : handler; 
          } 
        } else if (pattern === value) { 
          return typeof handler === 'function' ? handler(value) : handler; 
        } 
      } 
      
      if (defaultHandler) { 
        return typeof defaultHandler === 'function' ? defaultHandler(value) : defaultHandler; 
      } 
      
      throw new Error(`No matching pattern found for value: ${value}`); 
    } 
  }; 

  return api; 
} 

// 单行简写风格 
match.when = (value, patterns) => { 
  for (const [pattern, handler] of Object.entries(patterns)) { 
    if (pattern === '_') continue; // 跳过默认情况 
    
    if (typeof pattern === 'string' && pattern === value) { 
      return typeof handler === 'function' ? handler(value) : handler; 
    } 
    
    if (typeof pattern === 'function' && pattern(value)) { 
      return typeof handler === 'function' ? handler(value) : handler; 
    } 
  } 
  
  // 处理默认情况 
  if (patterns._) { 
    return typeof patterns._ === 'function' ? patterns._(value) : patterns._; 
  } 
  
  throw new Error(`No matching pattern found for value: ${value}`); 
}; 

// 链式写法 
match.chain = (value) => { 
  const chain = { 
    case(pattern, handler) { 
      if (pattern === value || (typeof pattern === 'function' && pattern(value))) { 
        const result = typeof handler === 'function' ? handler(value) : handler; 
        return { value: result, matched: true }; 
      } 
      return chain; 
    }, 
    
    default(handler) { 
      const result = typeof handler === 'function' ? handler(value) : handler; 
      return { value: result, matched: true }; 
    } 
  }; 
  
  return chain; 
}; 

// Rust 风格语法糖 
match.rust = (value, arms) => { 
  for (const arm of arms) { 
    const [pattern, handler] = arm; 
    
    if (pattern === '_') { 
      return typeof handler === 'function' ? handler(value) : handler; 
    } 
    
    if (pattern === value || (typeof pattern === 'function' && pattern(value))) { 
      return typeof handler === 'function' ? handler(value) : handler; 
    } 
  } 
  
  throw new Error(`No matching pattern found for value: ${value}`); 
}; 

// 导出 
if (typeof module !== 'undefined' && module.exports) { 
  module.exports = match; 
} else if (typeof window !== 'undefined') { 
  window.match = match; 
}