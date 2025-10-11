'use client';

import {useState, useEffect} from 'react';
import {generatePuzzle, checkPuzzle, isPuzzleComplete, type SudokuGrid, type Difficulty} from '@/lib/sudoku';

export default function Home() {
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [puzzle, setPuzzle] = useState<SudokuGrid>([]);
    const [solution, setSolution] = useState<SudokuGrid>([]);
    const [userGrid, setUserGrid] = useState<SudokuGrid>([]);
    const [initialGrid, setInitialGrid] = useState<SudokuGrid>([]);
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    // Start New Game
    const startNewGame = (diff: Difficulty) => {
        setDifficulty(diff);
        const {puzzle: newPuzzle, solution: newSolution} = generatePuzzle(diff);
        setPuzzle(newPuzzle);
        setSolution(newSolution);
        setUserGrid(newPuzzle.map(row => [...row]));
        setInitialGrid(newPuzzle.map(row => [...row]));
        setSelectedCell(null);
        setIsComplete(false);
    };

    // Reset Current Game
    const resetGame = () => {
        setUserGrid(initialGrid.map(row => [...row]));
        setSelectedCell(null);
        setIsComplete(false);
    };

    // Init Load
    useEffect(() => {
        startNewGame('medium');
    }, []);

    // Click Cell
    const handleCellClick = (row: number, col: number) => {
        setSelectedCell([row, col]);
    };

    // Input Number
    const handleNumberInput = (num: number) => {
        if (!selectedCell) return;
        const [row, col] = selectedCell;
        if (initialGrid[row][col] !== 0) return;

        const newGrid = userGrid.map(r => [...r]);
        newGrid[row][col] = num;
        setUserGrid(newGrid);

        // Check Completed
        if (isPuzzleComplete(newGrid)) {
            const isCorrect = checkPuzzle(newGrid, solution);
            if (isCorrect) {
                setIsComplete(true);
            }
        }
    };

    // Type Keyboard
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key >= '1' && e.key <= '9') {
                handleNumberInput(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                handleNumberInput(0);
            } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                if (!selectedCell) {
                    setSelectedCell([0, 0]);
                    return;
                }

                const [row, col] = selectedCell;
                let newRow = row;
                let newCol = col;

                if (e.key === 'ArrowUp') newRow = Math.max(0, row - 1);
                if (e.key === 'ArrowDown') newRow = Math.min(8, row + 1);
                if (e.key === 'ArrowLeft') newCol = Math.max(0, col - 1);
                if (e.key === 'ArrowRight') newCol = Math.min(8, col + 1);

                setSelectedCell([newRow, newCol]);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [selectedCell, userGrid, initialGrid]);

    // Cell Style
    const getCellClassName = (row: number, col: number) => {
        const isInitial = initialGrid[row]?.[col] !== 0;
        const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
        const value = userGrid[row]?.[col];
        const isWrong = value !== 0 && value !== solution[row]?.[col];

        let className = 'w-12 h-12 flex items-center justify-center text-lg font-semibold cursor-pointer border border-gray-300 ';

        // 3x3 Thick Border
        if (row % 3 === 0) className += 'border-t-2 border-t-gray-700 ';
        if (col % 3 === 0) className += 'border-l-2 border-l-gray-700 ';
        if (row === 8) className += 'border-b-2 border-b-gray-700 ';
        if (col === 8) className += 'border-r-2 border-r-gray-700 ';

        if (isInitial) {
            className += 'text-gray-800 font-bold ';
            if (isSelected) {
                className += 'bg-blue-200 ';
            } else {
                className += 'bg-gray-100 ';
            }
        } else if (isWrong) {
            className += 'bg-red-100 text-red-600 ';
        } else if (isSelected) {
            className += 'bg-blue-200 ';
        } else {
            className += 'bg-white hover:bg-blue-50 text-blue-600 ';
        }

        return className;
    };

    if (puzzle.length === 0) return <div className="flex items-center justify-center min-h-screen">loading...</div>;

    return (
        <div
            className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 overflow-hidden">
            <div className="bg-white rounded-lg shadow-2xl p-4 max-w-fit">

                {/* Top - Menu */}
                <div className="flex items-center justify-between mb-3">
                    {/* New Game */}
                    <button
                        onClick={() => startNewGame(difficulty)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap text-sm"
                    >
                        new
                    </button>

                    {/* Difficulty */}
                    <div className="flex gap-2 justify-center flex-1">
                        {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                            <button
                                key={diff}
                                onClick={() => startNewGame(diff)}
                                className={`px-4 py-1.5 rounded-lg font-semibold transition-colors text-sm ${
                                    difficulty === diff
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>

                    {/* Reset */}
                    <button
                        onClick={resetGame}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap text-sm"
                        title="reset"
                    >
                        ↻
                    </button>
                </div>

                {/* Middle - Sudoku Grid */}
                <div className="mb-3 inline-block border-2 border-gray-700">
                    {userGrid.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex">
                            {row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={getCellClassName(rowIndex, colIndex)}
                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                >
                                    {cell !== 0 ? cell : ''}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Bottom - Number Pad */}
                <div className="grid grid-cols-5 gap-1.5 mb-2 max-w-md mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberInput(num)}
                            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold rounded-lg transition-colors"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={() => handleNumberInput(0)}
                        className="w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white text-lg font-bold rounded-lg transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Complete Message */}
                <div className="flex items-center justify-between gap-4 min-h-[3rem]">
                    <div className="flex-1 text-center">
                        {isComplete && (
                            <div className="text-lg font-bold text-green-600">
                                Congratulation! 🎉
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}