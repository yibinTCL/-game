# 井字棋网页游戏 (#game)

## 📌 项目简介
一个支持玩家对战与人机对战的井字棋（Tic-Tac-Toe）网页小游戏。包含 AI 难度选择、先手切换、音效支持与响应式布局，代码已模块化，方便维护与扩展。

## ✅ 主要功能
1. 3x3 棋盘点击落子，显示当前回合。
2. 胜负与平局自动判断，结束提示。
3. 玩家对战 / 人机对战切换。
4. AI 难度：简单 / 中等 / 困难（Minimax 最优策略）。
5. 先手选择：玩家先手或 AI 先手。
6. 音效播放（落子/胜利），处理浏览器自动播放限制。
7. 响应式设计，移动端适配。
8. 模块化结构，易于扩展新特性。

## 🧱 目录结构
```
index.html              # 页面主结构与脚本引入顺序
style.css               # 样式与响应式适配
script.js               # 旧版入口（已保留，提示模块化）
move.mp3 / win.mp3      # 音效文件（需替换为真实音频）
js/
	constants.js          # 全局常量（胜利线、默认配置、枚举）
	audio.js              # AudioManager：解锁与播放、WebAudio 回退
	ai.js                 # AIEngine：不同难度策略与 Minimax
	game.js               # Game：核心状态与规则处理
	ui.js                 # UI：渲染棋盘和事件绑定
	main.js               # 项目入口，实例化并初始化
```

## 🛠 技术栈
- HTML5 + CSS3 原生实现，无外部框架。
- 原生 JavaScript（ES5/ES6 混合）立即执行函数 (IIFE) 形成模块命名空间。
- 可选 Web Audio API（音频播放失败时回退）。

## 🧩 模块职责说明
| 模块 | 职责 |
| ---- | ---- |
| constants.js | 提供胜利组合、AI 难度枚举与默认配置。 |
| audio.js | 处理音频解锁、播放、失败回退与调试提示。 |
| ai.js | 根据不同难度生成 AI 下一步；困难模式用 Minimax 保证不输。 |
| game.js | 管理棋盘状态、玩家回合、胜负判断与重置逻辑。 |
| ui.js | DOM 渲染与交互事件绑定，桥接 Game 与浏览器界面。 |
| main.js | 入口组装所有模块，并暴露 `window.__TicTacToe` 便于调试。 |

## 🤖 AI 策略详解
- 简单（easy）：尝试直接获胜；否则阻挡玩家胜利；否则随机。
- 中等（medium）：在简单基础上加入基础“阻挡双赢点”尝试。
- 困难（hard）：极大极小（Minimax）搜索所有可能局面，评分：
	- AI 胜：10 - 深度
	- 玩家胜：深度 - 10
	- 平局：0
 通过深度调节使更快获胜更优。

## 🔊 音频实现与优化
浏览器通常禁止自动播放：
1. `AudioManager` 监听首次 `pointerdown`/`keydown` 交互进行静音播放解锁。
2. 如果 `<audio>` 播放被拒绝，使用 `fetch + AudioContext.decodeAudioData` 进行 WebAudio 回退。
3. 当 `duration === 0` 提示音频可能为空（需替换真实 mp3）。

## 🧠 核心实现思路
1. 状态与逻辑分离：UI 不直接运算胜负，而是侦听 Game 回调。
2. AI 在困难模式复制当前棋盘进行递归搜索，不修改真实状态。
3. 所有模块通过挂载在 `window` 下的命名空间暴露（适合无打包环境）。
4. 音频管理独立，可后续扩展音量、静音、更多事件音效。

## 🚀 快速开始
1. 将 `move.mp3` / `win.mp3` 替换为有效短音效。
2. 双击 `index.html` 打开。（也可放入任意静态服务器）
3. 切换“人机对战”→ 选择 AI 难度与先手 → 开始体验。
4. 打开控制台输入 `__TicTacToe` 查看内部对象。

### 🔄 自动运行网页方式
#### 方式一：直接打开
双击 `start.ps1` （可能需右键“使用 PowerShell 运行”），自动在默认浏览器中打开页面。

#### 方式二：本地简易服务器
执行：
```powershell
PowerShell -ExecutionPolicy Bypass -File .\server.ps1
```
自动打开 `http://localhost:8080`，便于未来接入更复杂逻辑（如接口或多页面）。

#### 方式三：VS Code 任务（可选）
在 `.vscode/tasks.json` 中添加任务：
```jsonc
{
	"version": "2.0.0",
	"tasks": [
		{ "label": "Serve TicTacToe", "type": "shell", "command": "PowerShell", "args": ["-ExecutionPolicy","Bypass","-File","server.ps1"], "problemMatcher": [] }
	]
}
```
然后在 VS Code 命令面板运行 "Tasks: Run Task" -> 选择 Serve TicTacToe。

### 🐞 自动调试运行（Launch 配置）
已提供 `.vscode/launch.json`，可在 VS Code 侧边栏运行：
1. Debug index.html (Edge) 直接调试单文件（文件协议）。
2. Serve + Debug (Edge / Chrome) 自动执行预任务启动本地服务器，再附加浏览器调试。
3. 复合配置：在调试面板选择 "Start Server + Edge Debug" 一键启动。

如果断点不生效：
- 确认使用的是通过服务器访问的 `http://localhost:8080` 而不是直接文件路径。
- 检查浏览器是否缓存旧脚本，尝试禁用缓存 (DevTools -> Network -> Disable cache)。
- 确保源文件未被重命名，映射依赖 `webRoot`。

可自定义：修改 `launch.json` 中 `port` 或新增 Firefox：
```jsonc
{
	"name": "Serve + Debug (Firefox)",
	"type": "firefox",
	"request": "launch",
	"url": "http://localhost:8080",
	"preLaunchTask": "Serve TicTacToe"
}
```

### ⚠️ 执行策略提示
若出现脚本被阻止，可先执行（仅当前会话）：
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## 🧪 调试技巧
```js
// 强制让 AI 下一个回合：
__TicTacToe.game.currentPlayer = 'O';
__TicTacToe.game.playerMove(0); // 试图玩家落子
// 查看当前棋盘：
__TicTacToe.game.board;
```

## 📈 可扩展方向
- 添加局面复盘：记录每步落子，支持上一手/下一手。
- 增加动画：胜利线高亮、棋子入场过渡。
- PWA 支持：添加 manifest.json 与 Service Worker 离线体验。
- 排行与统计：累计胜率、本地存储。
- 多局自动对战：让不同 AI 等级互相模拟对局用于测试策略。

## ❓ 常见问题
| 问题 | 可能原因 | 解决方案 |
| ---- | ---- | ---- |
| 没声音 | mp3 文件为空 | 替换为真实音效资源 |
| AI 太强 | 使用困难模式 | 切换到简单或中等 |
| 页面按钮无效 | 脚本未加载顺序异常 | 确认 `index.html` 引入顺序未改动 |

## 📄 License
当前示例未指定开源协议，如需发布请补充所需 License。

---
文档生成时间：2025-11-05
