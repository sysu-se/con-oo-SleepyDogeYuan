import { writable } from 'svelte/store';
import { createGame } from '../domain/game';
import { createSudoku } from '../domain/sudoku';

export function createGameStore() {
    // 初始状态为 null，直到调用 start()
    const { subscribe, set } = writable(null);
    let game = null;

    // 核心机制：每当领域对象变化，调用 refresh 产生一个新快照触发 Svelte 更新
    function refresh() {
        if (!game) return;
        const sudoku = game.getSudoku();
        set({
            grid: sudoku.getGrid(),
            initialGrid: sudoku.getInitialGrid(), // 暴露题目盘面给 UI
            canUndo: game.canUndo(),
            canRedo: game.canRedo(),
        });
    }

    return {
        subscribe,

        // 任务接入：开始一局新游戏并加载题目
start() {
            const library = [
                // 题目 1 - 入门
                [[0,0,0,2,6,0,7,0,1],[6,8,0,0,7,0,0,9,0],[1,9,0,0,0,4,5,0,0],[8,2,0,1,0,0,0,4,0],[0,0,4,6,0,2,9,0,0],[0,5,0,0,0,3,0,2,8],[0,0,9,3,0,0,0,7,4],[0,4,0,0,5,0,0,3,6],[7,0,3,0,1,8,0,0,0]],
                // 题目 2 - 简单
                [[5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],[8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],[0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]],
                // 题目 3 - 中等
                [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,3,0,8,5],[0,0,1,0,2,0,0,0,0],[0,0,0,5,0,7,0,0,0],[0,0,4,0,0,0,1,0,0],[0,9,0,0,0,0,0,0,0],[5,0,0,0,0,0,0,7,3],[0,0,2,0,1,0,0,0,0],[0,0,0,0,4,0,0,0,9]],
                // 题目 4 - 困难
                [[8,0,0,0,0,0,0,0,0],[0,0,3,6,0,0,0,0,0],[0,7,0,0,9,0,2,0,0],[0,5,0,0,0,7,0,0,0],[0,0,0,0,4,5,7,0,0],[0,0,0,1,0,0,0,3,0],[0,0,1,0,0,0,0,6,8],[0,0,8,5,0,0,0,1,0],[0,9,0,0,0,0,4,0,0]],
                // 题目 5 - 专家
                [[0,0,0,6,0,2,0,0,0],[4,0,0,0,5,0,0,0,1],[0,8,5,0,1,0,6,2,0],[0,3,8,2,0,6,7,1,0],[0,0,0,0,0,0,0,0,0],[0,1,9,4,0,7,3,5,0],[0,2,6,0,4,0,5,3,0],[9,0,0,0,2,0,0,0,7],[0,0,0,8,0,9,0,0,0]]
            ];
            
            // 随机选择一个索引
            const randomIndex = Math.floor(Math.random() * library.length);
            const puzzle = library[randomIndex];
            
            // 使用领域对象创建实例
            const sudoku = createSudoku(puzzle);
            game = createGame({ sudoku });
            
            // 刷新 Store，通知 UI 更新
            refresh();
        },

        guess(x, y, value) {
            if (!game) return;
            game.guess({ row: y, col: x, value });
            refresh();
        },

        undo() {
            if (!game) return;
            game.undo();
            refresh();
        },

        redo() {
            if (!game) return;
            game.redo();
            refresh();
        }
    };
}