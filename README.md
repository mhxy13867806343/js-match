# Match - Rust-style Pattern Matching for JavaScript

## 📘 Introduction

A universal **zero-dependency** pattern matching tool that provides multiple syntactic styles, supporting object patterns, function conditions, value matching, and more. Handle complex logic with elegance.

Supports four different syntax styles, semantically similar to Rust's `match`, and works seamlessly with Vue/React projects.

---

## 📦 Installation & Import

### npm Package

```bash
# npm
npm install @mhxy13867806343/js-match

# yarn
yarn add @mhxy13867806343/js-match

# pnpm
pnpm add @mhxy13867806343/js-match
```

### Usage in Node.js

```js
const match = require('@mhxy13867806343/js-match');
// or ES6 import
import match from '@mhxy13867806343/js-match';
```

### Browser (CDN)

```html
<script src="https://unpkg.com/@mhxy13867806343/js-match@latest/match.js"></script>
<!-- Available as window.match -->
```

### Local Development

```js
const match = require('./match.js');
```

---

## 🧰 Four Usage Styles

### 1. Object Expression Style (Recommended)

```js
const result = match(value)
  .with('apple', () => 'This is an apple')
  .with('banana', () => 'This is a banana')
  .with(x => x > 10, x => `Number ${x} is greater than 10`)
  .with({ type: 'user', active: true }, obj => `Active user: ${obj.name}`)
  .otherwise(() => 'Unknown type')
  .run();
```

---

### 2. One-line Shorthand Style

```js
const result = match.when(value, {
  'apple': 'This is an apple',
  'banana': 'This is a banana',
  [x => x > 10]: x => `Number ${x} is greater than 10`,
  '_': 'Unknown type'
});
```

---

### 3. Chain Style

```js
const result = match.chain(value)
  .case('apple', 'This is an apple')
  .case('banana', 'This is a banana')
  .case(x => x > 10, x => `Number ${x} is greater than 10`)
  .default('Unknown type');

console.log(result.value); // This is an apple / Number 12 is greater than 10 ...
```

---

### 4. Rust-style Syntax Sugar

```js
const result = match.rust(value, [
  ['apple', 'This is an apple'],
  ['banana', 'This is a banana'],
  [x => x > 10, x => `Number ${x} is greater than 10`],
  ['_', 'Unknown type']
]);
```

---

## 🌟 Feature Description

### ✅ Value Matching

```js
match('success')
  .with('success', 'Operation successful')
  .with('error', 'Operation failed')
  .otherwise('Unknown status')
  .run();
```

---

### ✅ Function Condition Matching

```js
match(15)
  .with(x => x < 0, 'Negative number')
  .with(x => x === 0, 'Zero')
  .with(x => x > 0 && x <= 10, 'Small positive number')
  .with(x => x > 10, 'Large positive number')
  .run();
```

---

### ✅ Object Structure Matching (Shallow matching)

```js
match({ type: 'admin', active: true })
  .with({ type: 'admin', active: true }, 'Full access permissions')
  .with({ type: 'user', active: true }, 'Regular permissions')
  .with({ active: false }, 'Disabled')
  .otherwise('Unknown identity')
  .run();
```

---

### ✅ Return Function or Direct Value

```js
match('hello')
  .with('hello', val => val.toUpperCase())
  .run(); // 'HELLO'

match('hello')
  .with('hello', 'HELLO')
  .run(); // 'HELLO'
```

---

## 🖼️ Framework Integration Examples

### ✅ Vue Example

```js
export default {
  methods: {
    getStatusText(status) {
      return match(status)
        .with('pending', 'Pending')
        .with('completed', 'Completed')
        .otherwise('Unknown status')
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

### ✅ React Example

```jsx
function StatusComponent({ status }) {
  const statusText = match(status)
    .with('loading', 'Loading...')
    .with('success', 'Success')
    .otherwise('Unknown status')
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

## ⚠️ Error Handling

If no conditions are matched and no `.otherwise()` or default value is set, an error will be thrown:

```js
try {
  const result = match('unknown')
    .with('known', 'This is known')
    .run(); // Throws error
} catch (error) {
  console.log(error.message); // No matching pattern found for value: unknown
}
```

---

## 🎯 Advanced Usage

### Complex Object Matching

```js
const user = { id: 1, type: 'admin', permissions: ['read', 'write'] };

const result = match(user)
  .with({ type: 'admin' }, u => `Admin user: ${u.id}`)
  .with({ type: 'user' }, u => `Regular user: ${u.id}`)
  .otherwise('Guest user')
  .run();
```

### Nested Function Conditions

```js
const score = 85;

const grade = match(score)
  .with(s => s >= 90, 'A')
  .with(s => s >= 80, 'B')
  .with(s => s >= 70, 'C')
  .with(s => s >= 60, 'D')
  .otherwise('F')
  .run();
```

### Multiple Pattern Types

```js
const input = 'test';

const result = match(input)
  .with('test', 'String match')
  .with(123, 'Number match')
  .with(x => typeof x === 'boolean', 'Boolean type')
  .with({ key: 'value' }, 'Object match')
  .otherwise('No match')
  .run();
```

---

## 📋 API Reference

### Core Methods

#### `match(value)`
Creates a new match instance with the given value.

#### `.with(pattern, handler)`
Adds a pattern-handler pair to the match.
- `pattern`: Value, function, or object to match against
- `handler`: Function or value to return when matched

#### `.otherwise(handler)`
Sets the default handler when no patterns match.

#### `.run()`
Executes the matching and returns the result.

### Static Methods

#### `match.when(value, patterns)`
One-line pattern matching with object syntax.

#### `match.chain(value)`
Creates a chainable match instance.

#### `match.rust(value, arms)`
Rust-style pattern matching with array syntax.

---

## 🚀 Performance Notes

- Zero dependencies
- Lightweight (~2KB minified)
- Fast pattern matching
- Memory efficient
- Works in all modern browsers and Node.js

---

## 📄 License

MIT License

---

## 🤝 Contributing

Feel free to submit issues and pull requests to improve this library.

---

## 📞 Contact

- Email: 869710179@qq.com
- GitHub: [@mhxy13867806343](https://github.com/mhxy13867806343)

---

**Happy coding with pattern matching! 🎉** 