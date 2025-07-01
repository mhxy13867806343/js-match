以下是整理和优化后的 `match-documentation.md` 使用文档，更加清晰有层次，适合放在项目中：

---

# Match 工具使用文档

## 📘 简介

这是一个通用的 **零依赖** 模式匹配工具，提供多种写法，支持对象模式、函数条件、值匹配等，让你以更优雅的方式处理复杂逻辑。

支持四种风格语法，语义类似 Rust 中的 `match`，同时适用于 Vue / React 项目。

---

## 📦 安装与引入

### npm包安装

```bash
# npm
npm install @mhxy13867806343/js-match

# yarn
yarn add @mhxy13867806343/js-match

# pnpm
pnpm add @mhxy13867806343/js-match
```

### Node.js中使用

```js
const match = require('@mhxy13867806343/js-match');
// 或 ES6 导入
import match from '@mhxy13867806343/js-match';
```

### 浏览器 (CDN)

```html
<script src="https://unpkg.com/@mhxy13867806343/js-match@latest/match.js"></script>
<!-- 挂载为 window.match -->
```

### 本地开发

```js
const match = require('./match.js');
```

---

## 🧰 四种使用方式

### 1. 对象表达式风格（推荐）

```js
const result = match(value)
  .with('apple', () => '这是苹果')
  .with('banana', () => '这是香蕉')
  .with(x => x > 10, x => `数字 ${x} 大于 10`)
  .with({ type: 'user', active: true }, obj => `活跃用户: ${obj.name}`)
  .otherwise(() => '未知类型')
  .run();
```

---

### 2. 单行简写风格

```js
const result = match.when(value, {
  'apple': '这是苹果',
  'banana': '这是香蕉',
  [x => x > 10]: x => `数字 ${x} 大于 10`,
  '_': '未知类型'
});
```

---

### 3. 链式写法

```js
const result = match.chain(value)
  .case('apple', '这是苹果')
  .case('banana', '这是香蕉')
  .case(x => x > 10, x => `数字 ${x} 大于 10`)
  .default('未知类型');

console.log(result.value); // 这是苹果 / 数字 12 大于 10 ...
```

---

### 4. Rust 风格语法糖

```js
const result = match.rust(value, [
  ['apple', '这是苹果'],
  ['banana', '这是香蕉'],
  [x => x > 10, x => `数字 ${x} 大于 10`],
  ['_', '未知类型']
]);
```

---

## 🌟 特性说明

### ✅ 值匹配

```js
match('success')
  .with('success', '操作成功')
  .with('error', '操作失败')
  .otherwise('未知状态')
  .run();
```

---

### ✅ 函数条件匹配

```js
match(15)
  .with(x => x < 0, '负数')
  .with(x => x === 0, '零')
  .with(x => x > 0 && x <= 10, '小正数')
  .with(x => x > 10, '大正数')
  .run();
```

---

### ✅ 对象结构匹配（浅匹配）

```js
match({ type: 'admin', active: true })
  .with({ type: 'admin', active: true }, '完全访问权限')
  .with({ type: 'user', active: true }, '普通权限')
  .with({ active: false }, '已禁用')
  .otherwise('未知身份')
  .run();
```

---

### ✅ 返回函数或直接值

```js
match('hello')
  .with('hello', val => val.toUpperCase())
  .run(); // 'HELLO'

match('hello')
  .with('hello', 'HELLO')
  .run(); // 'HELLO'
```

---

## 🖼️ 框架集成示例

### ✅ Vue 示例

```js
export default {
  methods: {
    getStatusText(status) {
      return match(status)
        .with('pending', '待处理')
        .with('completed', '已完成')
        .otherwise('未知状态')
        .run();
    },

    handleUserAction(user) {
      return match(user)
        .with({ role: 'admin' }, () => this.showAdminPanel())
        .with({ role: 'user', verified: true }, () => this.showUserDashboard())
        .otherwise(() => this.showLoginForm())
        .run();
    }
  }
}
```

---

### ✅ React 示例

```jsx
function StatusComponent({ status }) {
  const statusText = match(status)
    .with('loading', '加载中...')
    .with('success', '成功')
    .otherwise('未知状态')
    .run();

  return <div>{statusText}</div>;
}

function UserProfile({ user }) {
  const content = match(user)
    .with({ type: 'premium' }, u => <PremiumProfile user={u} />)
    .with({ type: 'basic' }, u => <BasicProfile user={u} />)
    .otherwise(() => <LoginForm />)
    .run();

  return <div>{content}</div>;
}
```

---

## ⚠️ 错误处理

若未匹配到任何条件并且未设置 `.otherwise()` 或默认值，将抛出错误：

```js
try {
  match('unknown')
    .with('apple', '苹果')
    .run();
} catch (e) {
  console.error(e.message); // No matching pattern found for value: unknown
}
```

建议始终添加 `.otherwise()` 或 `'_'` 条件兜底。

---

## 🔍 注意事项

* 匹配顺序严格按声明顺序，第一个匹配成功即返回结果。
* 对象匹配为浅匹配，仅匹配指定字段。
* 函数条件需返回布尔值。
* 可与 TypeScript 搭配使用，建议加类型定义。

---

## 🧪 快速创建

```bash
touch match.js match-documentation.md
```

将本说明文档内容保存为 `match-documentation.md`，工具逻辑写入 `match.js` 即可使用。

---

如需我帮你自动生成 `match.js` 工具源码，也可直接告诉我。
