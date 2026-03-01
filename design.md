# 设计文档（React + Vite Webview 版本）

## 项目概述

这是一个 VS Code 扩展，旨在提供**自定义复制**功能。当用户触发特定快捷键时，扩展会将当前文件的路径（相对或绝对）与选中代码的行号信息，按照用户自定义的格式复制到剪贴板。

**架构更新**：本项目采用 **VS Code Webview Extension** 架构：
- **核心扩展**：TypeScript 实现，处理 VS Code API 交互（快捷键、命令、配置）
- **Webview UI**：使用 **React + Vite** 构建，提供可视化的配置界面和预览功能

---

## 功能需求

### 1. 核心复制功能
- **触发方式**：快捷键（默认 `Ctrl+Shift+C`），可自定义
- **复制内容**：
  - 当前打开文件的路径（相对或绝对）
  - 用户选中代码块的起止行号

### 2. 路径处理（可配置）
- **相对路径**：相对于工作区根目录
- **绝对路径**：文件系统完整路径
- **配置**：用户可在 VS Code 设置中切换

### 3. 格式自定义（高级配置）
用户可通过占位符自定义最终字符串格式：

| 占位符 | 说明 | 示例 |
|--------|------|------|
| `{path}` | 根据配置的路径类型 | `src/utils.js` |
| `{relativePath}` | 相对于工作区的路径 | `src/utils.js` |
| `{absolutePath}` | 绝对路径 | `/home/project/src/utils.js` |
| `{path:norm}` | 规范化路径（解析 `../` `./`） | `src/utils.js` |
| `{line}` / `{startLine}` | 起始行号 | `42` |
| `{endLine}` | 结束行号 | `50` |
| `{lines}` | **智能行号**：单行显示数字，多行显示 `start-end` | `42` 或 `42-50` |

### 4. Webview UI 功能（React + Vite）
- **配置面板**：可视化设置路径类型、格式字符串
- **实时预览**：输入不同占位符，即时查看输出效果
- **占位符选择器**：点击按钮插入占位符，无需记忆
- **快捷键提示**：显示当前绑定的快捷键

---

## 项目架构

```
vscode-Extention/
├── 📁 .vscode/              # VS Code 调试配置
│   ├── launch.json
│   └── tasks.json
├── 📁 src/                  # 扩展核心代码 (TypeScript)
│   ├── extension.ts        # 扩展入口，激活/停用逻辑
│   ├── commands.ts         # 命令实现（复制功能）
│   ├── formatter.ts        # 格式解析器（占位符替换）
│   ├── config.ts           # 配置管理
│   └── webview/            # Webview 相关
│       ├── panel.ts        # Webview 面板管理
│       └── provider.ts     # Webview 内容提供
├── 📁 webview-ui/          # Webview UI (React + Vite)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json        # UI 依赖
│   └── src/
│       ├── main.tsx        # React 入口
│       ├── App.tsx         # 主组件
│       ├── components/     # UI 组件
│       │   ├── FormatInput.tsx
│       │   ├── Preview.tsx
│       │   ├── PlaceholderSelector.tsx
│       │   └── Settings.tsx
│       ├── hooks/          # 自定义 Hooks
│       │   └── useVsCodeApi.ts
│       └── types/          # 类型定义
│           └── webview.ts
├── 📁 out/                 # 编译输出
├── package.json           # 扩展清单
├── tsconfig.json          # TypeScript 配置
└── README.md
```

---

## 技术栈

### 扩展核心
- **TypeScript 5.x**
- **VS Code Extension API** (`vscode` 模块)
- **Node.js** `path` 模块（路径处理）

### Webview UI
- **React 18.x** (UI 框架)
- **Vite 5.x** (构建工具)
- **TypeScript** (类型安全)

### 开发工具
- **ESLint** (代码质量)
- **VS Code** (调试和测试)

---

## 核心实现逻辑

### 1. 命令注册与快捷键
```typescript
// src/extension.ts
export function activate(context: vscode.ExtensionContext) {
  // 注册复制命令
  let disposable = vscode.commands.registerCommand(
    'customCopy.copyWithPath',
    copyWithPathHandler
  );
  context.subscriptions.push(disposable);
}
```

### 2. 路径与行号获取
```typescript
// src/commands.ts
async function copyWithPathHandler() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const document = editor.document;
  const selection = editor.selection;

  // 获取路径
  const filePath = document.uri.fsPath;
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  const relativePath = workspaceRoot
    ? path.relative(workspaceRoot, filePath)
    : filePath;

  // 获取行号
  const startLine = selection.start.line + 1; // 0-based to 1-based
  const endLine = selection.end.line + 1;
}
```

### 3. 格式解析器（占位符替换）
```typescript
// src/formatter.ts
export function format(formatStr: string, context: FormatContext): string {
  let result = formatStr;

  // 计算智能行号
  const lines = context.startLine === context.endLine
    ? String(context.startLine)
    : `${context.startLine}-${context.endLine}`;

  // 替换所有占位符
  const replacements = {
    '{path}': context.path,
    '{line}': String(context.startLine),
    '{startLine}': String(context.startLine),
    '{endLine}': String(context.endLine),
    '{lines}': lines,
    // ... 更多占位符
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.split(placeholder).join(value);
  }

  return result;
}
```

### 4. Webview UI 通信
```typescript
// Webview 发送消息到扩展
const vscode = acquireVsCodeApi();
vscode.postMessage({
  command: 'updateFormat',
  value: newFormat
});

// 扩展接收消息
webviewPanel.webview.onDidReceiveMessage(
  message => {
    switch (message.command) {
      case 'updateFormat':
        // 更新配置
        break;
    }
  }
);
```

---

## 配置项

| 配置键 | 类型 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- |
| `customCopy.pathType` | `string` | `"relative"` | 路径类型：`"relative"`（相对路径）或 `"absolute"`（绝对路径）。 |
| `customCopy.format` | `string` | `"{path}:{line}"` | 自定义复制格式字符串，支持占位符。 |
| `customCopy.keybinding` | `string` | `"ctrl+shift+c"` | 触发自定义复制的快捷键（在 `keybindings.json` 中实现，此处声明式）。 |

---

## 使用示例

假设文件路径为 `/home/user/project/src/utils.js`，选中代码从第 42 行开始。

| 配置 `pathType` | 配置 `format` | 复制的字符串 |
| :--- | :--- | :--- |
| `relative` | `"{path}:{line}"` | `src/utils.js:42` |
| `absolute` | `"{path}:{line}"` | `/home/user/project/src/utils.js:42` |
| `relative` | `"{path}#L{line}"` | `src/utils.js#L42` |
| `relative` | `"[file]({path}:{line})"` | `[file](src/utils.js:42)` |

---

## 开发计划

### 阶段 1: 核心功能
1. 项目初始化（package.json, tsconfig.json）
2. 实现格式解析器（formatter.ts）
3. 实现核心复制功能（extension.ts, commands.ts）
4. 配置系统实现
5. 快捷键绑定

### 阶段 2: Webview UI
1. 初始化 Vite + React 项目
2. 创建配置面板组件
3. 实现实时预览功能
4. 实现占位符选择器
5. Webview 与扩展通信

### 阶段 3: 测试与发布
1. 单元测试
2. 集成测试
3. 打包与发布

---

**设计确认：**
本设计文档涵盖了 VS Code Webview Extension + React + Vite 的完整架构。请确认是否符合你的需求，如有调整请告知。确认后我将创建详细的实现计划。