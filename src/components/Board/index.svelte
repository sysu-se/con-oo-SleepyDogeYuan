<script>
    export let gameStore;
	import { gameWon } from '@sudoku/stores/game';
	import { BOX_SIZE } from '@sudoku/constants';
	import { gamePaused } from '@sudoku/stores/game';
	
	
	import { settings } from '@sudoku/stores/settings';
	import { cursor } from '@sudoku/stores/cursor';
	import { candidates } from '@sudoku/stores/candidates';
	import Cell from './Cell.svelte';

	function isSelected(cursorStore, x, y) {
		return cursorStore.x === x && cursorStore.y === y;
	}

	function isSameArea(cursorStore, x, y) {
		if (cursorStore.x === null && cursorStore.y === null) return false;
		if (cursorStore.x === x || cursorStore.y === y) return true;

		const cursorBoxX = Math.floor(cursorStore.x / BOX_SIZE);
		const cursorBoxY = Math.floor(cursorStore.y / BOX_SIZE);
		const cellBoxX = Math.floor(x / BOX_SIZE);
		const cellBoxY = Math.floor(y / BOX_SIZE);
		return (cursorBoxX === cellBoxX && cursorBoxY === cellBoxY);
	}

	function getValueAtCursor(gridStore, cursorStore) {
		if (cursorStore.x === null && cursorStore.y === null) return null;

		return gridStore[cursorStore.y][cursorStore.x];
	}


	function handleKeydown(e) {
    if (!$cursor) return

    const x = $cursor.x
    const y = $cursor.y

    if (x === null || y === null) return

    const num = Number(e.key)

    if (num >= 1 && num <= 9) {
        gameStore.guess(x, y, num)
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
        gameStore.guess(x, y, 0)
    }
}

 
function isConflict(grid, x, y) {
    const value = grid[y][x];
    if (!value) return false;

    // 行
    for (let i = 0; i < 9; i++) {
        if (i !== x && grid[y][i] === value) return true;
    }

    // 列
    for (let i = 0; i < 9; i++) {
        if (i !== y && grid[i][x] === value) return true;
    }

    // 宫
    const boxX = Math.floor(x / 3) * 3;
    const boxY = Math.floor(y / 3) * 3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const nx = boxX + j;
            const ny = boxY + i;

            if ((nx !== x || ny !== y) && grid[ny][nx] === value) {
                return true;
            }
        }
    }

    return false;
}



function isWin(grid) {
    // 有没有空格
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (grid[y][x] === 0) return false;
        }
    }

    // 有没有冲突
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (isConflict(grid, x, y)) return false;
        }
    }

    return true;
}

	let grid
    $: grid = $gameStore?.grid || []


	$: if (grid.length && isWin(grid)) {
    gameWon.set(true);
}

</script>

<div class="board-padding relative z-10"
     tabindex="0"
     on:keydown={handleKeydown}>
	<div class="max-w-xl relative">
		<div class="w-full" style="padding-top: 100%"></div>
	</div>
	<div class="board-padding absolute inset-0 flex justify-center">

		<div class="bg-white shadow-2xl rounded-xl overflow-hidden w-full h-full max-w-xl grid" class:bg-gray-200={$gamePaused}>

			{#each grid as row, y}
				{#each row as value, x}
					<Cell {value}
					      {gameStore}
					      cellY={y + 1}
					      cellX={x + 1}
					      candidates={$candidates[x + ',' + y]}
					      disabled={$gamePaused}
					      selected={isSelected($cursor, x, y)}
					      userNumber={grid[y][x] === 0}
					      sameArea={$settings.highlightCells && !isSelected($cursor, x, y) && isSameArea($cursor, x, y)}
					      sameNumber={$settings.highlightSame && value && !isSelected($cursor, x, y) && getValueAtCursor(grid, $cursor) === value}
					      conflictingNumber={isConflict(grid, x, y)} />
				{/each}
			{/each}

		</div>

	</div>
</div>

<style>
	.board-padding {
		@apply px-4 pb-4;
	}
</style>