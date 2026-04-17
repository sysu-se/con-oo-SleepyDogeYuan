# con-oo-SleepyDogeYuan - Review

## Review 结论

当前实现已经有了 `Sudoku` / `Game` / `gameStore` 的基本分层，也尝试用 store adapter 把领域对象接到 Svelte 上；但从静态阅读看，领域对象还没有成为真实游戏流程的单一核心。开局/载入、胜利流程、提示、分享等关键链路仍大量依赖旧 `@sudoku/*` 状态，数独校验也仍写在组件里，因此整体只能算“部分接入”，尚未达到作业对 OOP、OOD 和 Svelte 真正集成的要求。

## 总体评价

| 维度 | 评价 |
| --- | --- |
| OOP | fair |
| JS Convention | fair |
| Sudoku Business | poor |
| OOD | fair |

## 缺点

### 1. 开始新局和加载题目的主流程仍绕过领域对象

- 严重程度：core
- 位置：src/components/Header/Dropdown.svelte:11-23, src/components/Header/Dropdown.svelte:41-55, src/components/Modal/Types/Welcome.svelte:16-24
- 原因：UI 的主要开局入口仍调用旧的 `@sudoku/game.startNew/startCustom`，而不是 `gameStore` 或 `Game`。这意味着 `createGameStore()` 里的领域对象只在 `App.svelte` 初次挂载时随机启动一次，之后从欢迎弹窗、菜单切换难度、输入自定义题目码，都不会更新当前领域对象，未满足“开始一局游戏必须创建/加载你的 Game/Sudoku”的要求。

### 2. 数独校验和胜利判定没有建模进领域层，而是散落在组件中

- 严重程度：core
- 位置：src/domain/sudoku.js:13-18, src/components/Board/index.svelte:55-112
- 原因：`Sudoku` 只负责写值和保护初始格，没有提供校验能力，也没有表达冲突/完成状态；真正的冲突检测和 `isWin` 被写在 `Board.svelte`。这直接违背了作业对 `Sudoku`“提供校验能力”的要求，也让业务规则依赖某个具体组件才能成立，导致 OOP/OOD 边界失真。

### 3. Game 会把被拒绝或无效的输入也写入历史

- 严重程度：core
- 位置：src/domain/game.js:12-17
- 原因：`Game.guess()` 在调用 `_current.guess(move)` 后不检查返回值，直接截断历史并 push 新快照。对初始题目格的非法输入会返回 `false`，但仍然生成一条与前一条完全相同的历史记录，导致 `undo/redo` 语义被污染，也不符合数独业务中的“无效操作不应产生一步历史”。

### 4. 界面仍混用新旧两套状态源，领域对象不是唯一真相源

- 严重程度：major
- 位置：src/App.svelte:15-35, src/components/Board/index.svelte:111-113, src/components/Controls/ActionBar/Actions.svelte:14-21, src/components/Modal/Types/Share.svelte:5-13
- 原因：`App.svelte` 继续订阅旧 `gameWon`，`Board.svelte` 又反向把基于 `gameStore.grid` 的胜利结果塞回旧 store；提示按钮仍操作旧 `userGrid`，分享弹窗仍读取旧 `grid`。这样会形成“撤销/重做看的是领域对象，提示/分享/部分流程看的是旧 store”的分裂状态，Svelte 架构上缺少单一源头，后续很容易出现功能彼此不同步。

### 5. 同一类键盘输入被两个组件重复监听，可能重复落子并重复记历史

- 严重程度：major
- 位置：src/components/Board/index.svelte:35-52, src/components/Controls/Keyboard.svelte:15-60
- 原因：`Board` 在可聚焦容器上监听 `keydown`，`Keyboard` 又通过 `<svelte:window>` 全局监听同样的数字和删除键。用户在棋盘区域按键时，事件会同时命中局部监听和全局监听，静态上看会对同一步输入调用两次 `gameStore.guess()`，从而重复修改/重复入历史。

## 优点

### 1. 当前盘面与初始题面被明确区分并做了快照保护

- 位置：src/domain/sudoku.js:1-34
- 原因：构造时对 `grid` 和 `initialGrid` 都做了深拷贝，`getGrid()`、`getInitialGrid()`、`clone()`、`toJSON()` 也持续返回副本，避免了 UI 直接拿到内部可变数组，为历史记录和序列化打下了不错的基础。

### 2. Undo/Redo 责任集中在 Game，而不是散落在组件中

- 位置：src/domain/game.js:18-45
- 原因：历史数组、指针推进、撤销/重做和从 JSON 恢复都封装在 `Game` 内部，至少在职责分配方向上是对的，避免把历史管理写进 `.svelte` 事件处理函数。

### 3. 采用了贴近 Svelte 习惯的 store adapter 方案

- 位置：src/stores/gameStore.js:10-19, src/stores/gameStore.js:52-67
- 原因：`createGameStore()` 持有领域对象，并在每次领域操作后通过 `refresh()` 发布新的普通对象快照，让组件以 `$gameStore` 消费状态。这比在组件里直接 mutate 二维数组更符合题目推荐的接入方式。

### 4. 固定数字的渲染已经开始消费领域对象导出的状态

- 位置：src/components/Board/Cell.svelte:25-25
- 原因：`Cell` 通过 `$gameStore.initialGrid` 判断 fixed cell，而不是继续依赖旧的题面 store，说明 UI 渲染层至少已经开始接入领域对象暴露出来的视图数据。

## 补充说明

- 本次结论基于静态阅读；按要求未运行测试，也未实际运行页面交互。
- 关于“开局流程未接入”“提示/分享仍读旧 store”“键盘输入可能重复触发”等结论，来自对 `src/domain/*`、`src/stores/gameStore.js`、相关 `.svelte` 文件以及为确认接入链路而阅读的本地 `src/node_modules/@sudoku/*` 代码的静态追踪。
- 审查范围已限制在 `src/domain/*` 及其关联的 Svelte 接入链路，没有扩展评价无关目录。
