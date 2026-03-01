# VS Code 自定义复制扩展实现计划 (React + Vite Webview 版本)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 创建一个 VS Code 扩展，允许用户通过自定义快捷键复制当前文件的相对或绝对路径，以及选中代码的行号信息。使用 React + Vite 构建 Webview 配置面板，提供可视化配置和实时预览功能。

**Architecture:**
- **扩展核心**：TypeScript 实现，处理 VS Code API 交互（快捷键、命令、配置）
- **Webview UI**：使用 **React + Vite** 构建，提供可视化配置界面、实时预览、占位符选择器
- **构建流程**：双构建系统 - tsc 编译扩展，Vite 构建 Webview UI

**Tech Stack:**
- **扩展核心**：TypeScript 5.x, VS Code Extension API, Node.js
- **Webview UI**：React 18.x, Vite 5.x, TypeScript
- **构建工具**：tsc, Vite, ESLint

---

## 前置条件

- Node.js >= 18.x 已安装
- VS Code 已安装
- 具备基本的 TypeScript/React 开发知识

---

## Task 1: 扩展核心 - 项目初始化

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.vscode/launch.json`
- Create: `.vscode/tasks.json`
- Create: `.vscodeignore`

**Step 1: 创建项目目录结构**

执行：
```bash
mkdir -p vscode-custom-copy/src/webview
mkdir -p vscode-custom-copy/.vscode
cd vscode-custom-copy
```

预期：目录结构创建成功

**Step 2: 初始化 package.json**

创建 `package.json`：
```json
{
  "name": "vscode-custom-copy",
  "displayName": "Custom Copy",
  "description": "Copy file path with line numbers in customizable format",
  "version": "0.1.0",
  "publisher": "your-publisher",
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": [
    "Other",
    "Keybindings"
  ],
  "keywords": [
    "copy",
    "path",
    "line number",
    "format"
  ],
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "customCopy.copyWithPath",
        "title": "Copy with Path",
        "category": "Custom Copy"
      },
      {
        "command": "customCopy.openSettings",
        "title": "Open Settings Panel",
        "category": "Custom Copy"
      }
    ],
    "keybindings": [
      {
        "command": "customCopy.copyWithPath",
        "key": "ctrl+shift+c",
        "mac": "cmd+shift+c",
        "when": "editorTextFocus"
      }
    ],
    "configuration": {
      "title": "Custom Copy",
      "properties": {
        "customCopy.pathType": {
          "type": "string",
          "enum": ["relative", "absolute"],
          "default": "relative",
          "description": "Path type to copy: 'relative' from workspace root, or 'absolute' full path"
        },
        "customCopy.format": {
          "type": "string",
          "default": "{path}:{line}",
          "description": "Format string. Available placeholders: {path}, {relativePath}, {absolutePath}, {line}, {startLine}, {endLine}, {lines}. Example: '{path}#L{lines}' -> 'src/file.js#L42' or 'src/file.js#L42-50'"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile && npm run build:webview",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "build:webview": "cd webview-ui && npm run build",
    "pretest": "npm run compile && npm run lint",
    "lint": "eslint src --ext ts",
    "test": "node ./out/test/runTest.js",
    "package": "vsce package"
  },
  "devDependencies": {
    "@types/vscode": "^1.74.0",
    "@types/node": "18.x",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "typescript": "^5.0.0",
    "@vscode/test-electron": "^2.3.0",
    "@vscode/vsce": "^2.15.0"
  }
}
```

预期：package.json 创建成功，包含双构建脚本（compile + build:webview）

**Step 3: 创建 tsconfig.json**

创建 `tsconfig.json`：
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["ES2020"],
    "outDir": "out",
    "rootDir": "src",
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "exclude": [
    "node_modules",
    ".vscode-test",
    "webview-ui"
  ]
}
```

预期：tsconfig.json 创建成功，排除了 webview-ui 目录

**Step 4: 创建 VS Code 调试配置**

创建 `.vscode/launch.json`：
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "${defaultBuildTask}"
    },
    {
      "name": "Extension Tests",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "${defaultBuildTask}"
    }
  ]
}
```

创建 `.vscode/tasks.json`：
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "watch",
      "problemMatcher": "$tsc-watch",
      "isBackground": true,
      "presentation": {
        "reveal": "never"
      },
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "type": "npm",
      "script": "build:webview",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always"
      },
      "group": "build"
    }
  ]
}
```

预期：调试配置创建成功，可以在 VS Code 中按 F5 运行扩展

**Step 5: 创建 .vscodeignore**

创建 `.vscodeignore`：
```
.vscode
.vscode-test
node_modules
out/test
test
src
.gitignore
.yarnrc
vsc-extension-quickstart.md
**/tsconfig.json
**/.eslintrc.json
**/*.map
**/*.ts
```

预期：.vscodeignore 创建成功，打包时不会包含开发文件

**Step 6: Commit**

执行：
```bash
git add .
git commit -m "chore: initialize VS Code extension project

- Add package.json with extension configuration
- Add tsconfig.json for TypeScript compilation
- Add VS Code debug and task configurations
- Add .vscodeignore for packaging"
```

预期：所有文件已提交到 git

---

## Task 2: 扩展核心 - 实现格式解析器模块

**Files:**
- Create: `src/formatter.ts`

**Step 1: 创建格式解析器模块**

（此处省略详细的 formatter.ts 代码，与设计文档相同）

**Step 2: Commit**

执行：
```bash
git add src/formatter.ts
git commit -m "feat: add format parser module

- Implement placeholder replacement logic
- Support {path}, {line}, {lines} and other placeholders
- Add path normalization support"
```

---

## Task 3: 扩展核心 - 实现主扩展逻辑

**Files:**
- Create: `src/extension.ts`
- Create: `src/commands.ts`
- Create: `src/config.ts`

**Step 1: 创建配置管理模块**

创建 `src/config.ts`：（此处省略详细代码）

**Step 2: 创建命令实现**

创建 `src/commands.ts`：（此处省略详细代码）

**Step 3: 创建扩展入口**

创建 `src/extension.ts`：（此处省略详细代码）

**Step 4: Commit**

执行：
```bash
git add src/
git commit -m "feat: implement core extension logic

- Add configuration management
- Implement copy command with path and line number
- Register keyboard shortcuts"
```

---

## Task 4: Webview UI - 初始化 React + Vite 项目

**Files:**
- Create: `webview-ui/package.json`
- Create: `webview-ui/vite.config.ts`
- Create: `webview-ui/tsconfig.json`
- Create: `webview-ui/index.html`

**Step 1: 创建 webview-ui 目录结构**

执行：
```bash
mkdir -p webview-ui/src/components
mkdir -p webview-ui/src/hooks
mkdir -p webview-ui/src/types
```

**Step 2: 初始化 webview-ui package.json**

创建 `webview-ui/package.json`：
```json
{
  "name": "vscode-custom-copy-webview",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@vscode/webview-ui-toolkit": "^1.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

**Step 3: 创建 Vite 配置**

创建 `webview-ui/vite.config.ts`：
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../out/webview-ui',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
})
```

**Step 4: 创建 TypeScript 配置**

创建 `webview-ui/tsconfig.json`：
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

创建 `webview-ui/tsconfig.node.json`：
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 5: 创建 HTML 入口**

创建 `webview-ui/index.html`：
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Custom Copy Settings</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 6: Commit**

执行：
```bash
git add webview-ui/
git commit -m "chore: initialize webview-ui with React + Vite

- Add Vite configuration with React plugin
- Add TypeScript configurations
- Add HTML entry point
- Configure build output to out/webview-ui"
```

---

## Task 5: Webview UI - 实现 React 组件

**Files:**
- Create: `webview-ui/src/main.tsx`
- Create: `webview-ui/src/App.tsx`
- Create: `webview-ui/src/types/webview.ts`
- Create: `webview-ui/src/hooks/useVsCodeApi.ts`
- Create: `webview-ui/src/components/FormatInput.tsx`
- Create: `webview-ui/src/components/Preview.tsx`
- Create: `webview-ui/src/components/PlaceholderSelector.tsx`
- Create: `webview-ui/src/components/Settings.tsx`

**Step 1: 创建类型定义**

创建 `webview-ui/src/types/webview.ts`：（此处省略详细代码，包含 VSCode 状态类型、消息类型等）

**Step 2: 创建 VS Code API Hook**

创建 `webview-ui/src/hooks/useVsCodeApi.ts`：（此处省略详细代码）

**Step 3: 创建组件**

（此处省略各组件的详细代码实现）

**Step 4: 创建主应用**

创建 `webview-ui/src/App.tsx`：（此处省略详细代码）

**Step 5: 创建入口文件**

创建 `webview-ui/src/main.tsx`：（此处省略详细代码）

**Step 6: Commit**

执行：
```bash
git add webview-ui/src/
git commit -m "feat: implement webview UI with React components

- Add VS Code API hook for communication
- Add format input, preview, placeholder selector components
- Add settings panel with path type and format configuration
- Implement real-time preview functionality"
```

---

## Task 6: 扩展核心 - Webview 面板管理

**Files:**
- Create: `src/webview/panel.ts`
- Create: `src/webview/provider.ts`
- Modify: `src/extension.ts` - 添加打开设置面板命令

**Step 1: 创建 Webview 面板管理器**

创建 `src/webview/panel.ts`：（此处省略详细代码）

**Step 2: 创建 Webview 内容提供器**

创建 `src/webview/provider.ts`：（此处省略详细代码）

**Step 3: 修改扩展入口**

修改 `src/extension.ts` - 添加打开设置面板命令：（此处省略详细代码）

**Step 4: Commit**

执行：
```bash
git add src/webview/
git commit -m "feat: add webview panel management

- Add webview panel manager for settings UI
- Add content provider to serve built webview files
- Integrate open settings command into extension"
```

---

## Task 7: 集成与测试

**Files:**
- Modify: `package.json` - 添加完整的 scripts
- Create: 测试文件

**Step 1: 验证完整构建流程**

执行：
```bash
# 安装扩展依赖
npm install

# 编译扩展
npm run compile

# 安装 webview-ui 依赖并构建
cd webview-ui
npm install
npm run build
cd ..
```

预期：构建成功，out/ 目录包含扩展代码和 webview-ui 文件

**Step 2: 运行扩展测试**

执行：
```bash
npm run test
```

预期：测试通过

**Step 3: 手动测试扩展**

1. 按 F5 启动扩展开发主机
2. 打开一个文件，选择代码
3. 按 Ctrl+Shift+C 测试复制功能
4. 运行命令 "Custom Copy: Open Settings Panel" 测试 Webview

**Step 4: Commit**

执行：
```bash
git add .
git commit -m "test: verify complete build and test workflow

- Verify TypeScript compilation
- Verify webview-ui Vite build
- Run extension tests
- Manual testing in development host"
```

---

## Task 8: 打包与发布准备

**Files:**
- Create: `README.md`
- Create: `CHANGELOG.md`
- Create: `LICENSE`

**Step 1: 创建 README**

创建 `README.md`：（此处省略详细内容）

**Step 2: 创建 CHANGELOG**

创建 `CHANGELOG.md`：（此处省略详细内容）

**Step 3: 打包扩展**

执行：
```bash
npm run package
```

预期：生成 `vscode-custom-copy-0.1.0.vsix` 文件

**Step 4: Final Commit**

执行：
```bash
git add README.md CHANGELOG.md LICENSE
git commit -m "docs: add documentation and prepare for release

- Add comprehensive README with usage instructions
- Add CHANGELOG for version tracking
- Add LICENSE file
- Package extension for distribution"
```

---

## 完成总结

所有任务已完成！VS Code 自定义复制扩展已实现：

1. **扩展核心**：TypeScript 实现，支持自定义快捷键、路径和行号复制
2. **Webview UI**：React + Vite 构建，提供可视化配置面板
3. **构建系统**：双构建流程，tsc 编译扩展 + Vite 构建 UI
4. **测试验证**：完整的测试和手动验证流程
5. **发布准备**：文档、CHANGELOG、打包脚本全部就绪

扩展可通过 `vscode-custom-copy-0.1.0.vsix` 安装，或在开发模式下按 F5 运行。
