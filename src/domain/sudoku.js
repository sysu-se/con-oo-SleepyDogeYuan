export function createSudoku(grid, initialGrid = null) {
    // 深度克隆原始数据，防止引用污染
    const _grid = grid.map(row => [...row]);
    // 如果没有传入初始盘面，就把当前的 grid 当作初始盘面（题目）
    const _initialGrid = initialGrid 
        ? initialGrid.map(row => [...row]) 
        : grid.map(row => [...row]);

    return {
        getGrid: () => _grid.map(row => [...row]),
        getInitialGrid: () => _initialGrid.map(row => [...row]),
        
        // 核心领域逻辑：如果是初始题目数字，不允许修改
        guess: ({ row, col, value }) => {
            if (_initialGrid[row][col] !== 0) return false; 
            _grid[row][col] = value ?? 0;
            return true;
        },

        // 辅助方法：判断某格是否是题目自带的
        isInitial: (row, col) => _initialGrid[row][col] !== 0,

        clone: () => createSudoku(
            _grid.map(row => [...row]), 
            _initialGrid.map(row => [...row])
        ),
        
        toJSON: () => ({ 
            grid: _grid.map(row => [...row]),
            initialGrid: _initialGrid.map(row => [...row])
        })
    };
}

export const createSudokuFromJSON = (json) => createSudoku(json.grid, json.initialGrid);