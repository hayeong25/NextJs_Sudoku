export type SudokuGrid = number[][];
export type Difficulty = 'easy' | 'medium' | 'hard';

// Valid Sudoku Grid
export function isValid(grid: SudokuGrid, row: number, col: number, num: number): boolean {
    // Valid Row
    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
    }

    // Valid Column
    for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
    }

    // Valid 3x3
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i + startRow][j + startCol] === num) return false;
        }
    }

    return true;
}

// Solve Sudoku (with random 1st row)
export function solveSudoku(grid: SudokuGrid): boolean {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(grid, row, col, num)) {
                        grid[row][col] = num;
                        if (solveSudoku(grid)) return true;
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// Generate Sudoku
export function generateCompleteSudoku(): SudokuGrid {
    const grid: SudokuGrid = Array(9).fill(0).map(() => Array(9).fill(0));

    // Random 1st Row
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    grid[0] = nums;

    solveSudoku(grid);

    return grid;
}

// Generate by Difficulty
export function generatePuzzle(difficulty: Difficulty): { puzzle: SudokuGrid; solution: SudokuGrid } {
    const solution = generateCompleteSudoku();
    const puzzle = solution.map(row => [...row]);

    // Number of cells to remove by difficulty level
    const cellsToRemove = {
        easy: 35,
        medium: 45,
        hard: 55
    };

    const count = cellsToRemove[difficulty];
    let removed = 0;

    while (removed < count) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);

        if (puzzle[row][col] !== 0) {
            const backup = puzzle[row][col];
            puzzle[row][col] = 0;

            const testGrid = puzzle.map(r => [...r]);
            const count = countSolutions(testGrid, 0);

            if (count === 1) {
                removed++;
            } else {
                puzzle[row][col] = backup;
            }
        }
    }

    return {puzzle, solution};
}

// Count Solutions (Up to 2)
function countSolutions(grid: SudokuGrid, count: number): number {
    if (count > 1) return count;

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(grid, row, col, num)) {
                        grid[row][col] = num;
                        count = countSolutions(grid, count);
                        grid[row][col] = 0;
                        if (count > 1) return count;
                    }
                }
                return count;
            }
        }
    }
    return count + 1;
}

// Check Puzzle
export function checkPuzzle(puzzle: SudokuGrid, solution: SudokuGrid): boolean {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (puzzle[row][col] !== 0 && puzzle[row][col] !== solution[row][col]) {
                return false;
            }
        }
    }
    return true;
}

// Check if it is Completed
export function isPuzzleComplete(puzzle: SudokuGrid): boolean {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (puzzle[row][col] === 0) return false;
        }
    }
    return true;
}