'use client';

import {useState, useEffect} from 'react';
import {generatePuzzle, checkPuzzle, isPuzzleComplete, type SudokuGrid, type Difficulty} from '@/lib/sudoku';
import KakaoAdFit from '@/component/KakaoAdFit';

export default function Home() {
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [puzzle, setPuzzle] = useState<SudokuGrid>([]);
    const [solution, setSolution] = useState<SudokuGrid>([]);
    const [userGrid, setUserGrid] = useState<SudokuGrid>([]);
    const [initialGrid, setInitialGrid] = useState<SudokuGrid>([]);
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [memoMode, setMemoMode] = useState(false);
    const [memos, setMemos] = useState<{ [key: string]: number[] }>({});
    const [elapsedTime, setElapsedTime] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [isFailed, setIsFailed] = useState(false);
    const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);

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
        setMemoMode(false);
        setMemos({});
        setElapsedTime(0);
        setMistakes(0);
        setIsFailed(false);
    };

    // Reset Current Game
    const resetGame = () => {
        setUserGrid(initialGrid.map(row => [...row]));
        setSelectedCell(null);
        setIsComplete(false);
        setMemos({});
        setElapsedTime(0);
        setMistakes(0);
        setIsFailed(false);
    };

    // Init Load
    useEffect(() => {
        startNewGame('medium');
    }, []);

    // Timer
    useEffect(() => {
        if (isComplete) return;

        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isComplete]);

    // Format Timer
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Click Cell
    const handleCellClick = (row: number, col: number) => {
        setSelectedCell([row, col]);
    };

    // Input Number
    const handleNumberInput = (num: number) => {
        if (!selectedCell) return;
        const [row, col] = selectedCell;
        if (initialGrid[row][col] !== 0) return;

        const key = `${row}-${col}`;

        if (memoMode) {
            const currentMemo = memos[key] || [];
            let newMemo: number[];

            if (num === 0) {
                // Clear all memos for this cell
                newMemo = [];
            } else if (currentMemo.includes(num)) {
                // Remove number from memo
                newMemo = currentMemo.filter(n => n !== num);
            } else {
                // Add number to memo
                newMemo = [...currentMemo, num].sort();
            }

            setMemos({
                ...memos,
                [key]: newMemo
            });
        } else {
            const newGrid = userGrid.map(r => [...r]);
            newGrid[row][col] = num;

            // Check if the input is wrong and count mistakes
            if (num !== 0 && num !== solution[row][col]) {
                const newMistakes = mistakes + 1;

                // Check if mistakes reached 4
                if (newMistakes >= 4) {
                    setIsFailed(true);
                    setTimeout(() => {
                        startNewGame(difficulty);
                    }, 3000);
                    return;
                }

                setMistakes(newMistakes);
            }

            setUserGrid(newGrid);

            // Clear memo when actual value is set
            if (num !== 0) {
                const newMemos = {...memos};
                delete newMemos[key];
                setMemos(newMemos);
            }

            // Check Completed
            if (isPuzzleComplete(newGrid)) {
                const isCorrect = checkPuzzle(newGrid, solution);
                if (isCorrect) {
                    setIsComplete(true);
                    setTimeout(() => {
                        startNewGame(difficulty);
                    }, 3000);
                }
            }
        }
    };

    // Hint Function
    const handleHint = () => {
        if (!selectedCell) return;
        const [row, col] = selectedCell;
        if (initialGrid[row][col] !== 0) return;

        const newGrid = userGrid.map(r => [...r]);
        newGrid[row][col] = solution[row][col];
        setUserGrid(newGrid);

        // Clear memo for this cell
        const key = `${row}-${col}`;
        const newMemos = {...memos};
        delete newMemos[key];
        setMemos(newMemos);

        // Check Completed
        if (isPuzzleComplete(newGrid)) {
            const isCorrect = checkPuzzle(newGrid, solution);
            if (isCorrect) {
                setIsComplete(true);
                setTimeout(() => {
                    startNewGame(difficulty);
                }, 3000);
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (showDifficultyDropdown) {
                const target = e.target as HTMLElement;
                if (!target.closest('.difficulty-dropdown')) {
                    setShowDifficultyDropdown(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDifficultyDropdown]);

    // Cell Style
    const getCellClassName = (row: number, col: number) => {
        const isInitial = initialGrid[row]?.[col] !== 0;
        const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
        const value = userGrid[row]?.[col];
        const isWrong = value !== 0 && value !== solution[row]?.[col];

        // Check if this cell has the same number as selected cell
        const selectedValue = selectedCell ? userGrid[selectedCell[0]]?.[selectedCell[1]] : null;
        const isSameNumber = selectedValue !== null && selectedValue !== 0 && value === selectedValue && !isSelected;

        let className = 'w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 flex items-center justify-center text-base sm:text-lg lg:text-lg font-semibold cursor-pointer border border-gray-300 ';

        // 3x3 Thick Border
        if (row % 3 === 0) className += 'border-t-2 border-t-gray-700 ';
        if (col % 3 === 0) className += 'border-l-2 border-l-gray-700 ';
        if (row === 8) className += 'border-b-2 border-b-gray-700 ';
        if (col === 8) className += 'border-r-2 border-r-gray-700 ';

        if (isInitial) {
            className += 'text-gray-800 font-bold ';
            if (isSelected) {
                className += 'bg-blue-200 ';
            } else if (isSameNumber) {
                className += 'bg-blue-100 ';
            } else {
                className += 'bg-gray-100 ';
            }
        } else if (isWrong) {
            className += 'bg-red-100 text-red-600 ';
        } else if (isSelected) {
            className += 'bg-blue-200 ';
        } else if (isSameNumber) {
            className += 'bg-blue-100 text-blue-600 ';
        } else {
            className += 'bg-white hover:bg-blue-50 text-blue-600 ';
        }

        return className;
    };

    if (puzzle.length === 0) return <div className="flex items-center justify-center min-h-screen">loading...</div>;

    return (
        <div
            className="flex flex-col lg:flex-row items-center justify-center min-h-screen lg:h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 overflow-auto lg:overflow-hidden">

            {/* Top Ad (Mobile only) */}
            <div className="flex lg:hidden items-center justify-center flex-shrink-0 mb-4">
                <KakaoAdFit
                    unit="DAN-sO1iSRgjCf8aopAP"
                    width="320"
                    height="50"
                />
            </div>

            {/* Left Ad (Desktop only) */}
            <div className="hidden lg:flex items-center justify-center flex-shrink-0 mr-4">
                <KakaoAdFit
                    unit="DAN-9F8a61CzxL0uUlch"
                    width="160"
                    height="600"
                />
            </div>

            <div className="bg-white rounded-lg shadow-2xl p-2 sm:p-3 lg:p-4 max-w-fit">

                {/* Top - Menu */}
                <div className="flex items-start justify-between mb-2 sm:mb-3 gap-1">
                    {/* New Game + Timer */}
                    <div className="flex flex-col items-start gap-1 min-w-0">
                        <button
                            onClick={() => startNewGame(difficulty)}
                            className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap text-xs sm:text-sm"
                            title="new game"
                        >
                            new
                        </button>
                        <div className="text-xs sm:text-sm text-gray-700 font-semibold whitespace-nowrap">
                            Timer {formatTime(elapsedTime)}
                        </div>
                    </div>

                    {/* Difficulty Dropdown */}
                    <div className="relative flex-1 flex justify-center">
                        <div className="difficulty-dropdown">
                            <button
                                onClick={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
                                className="px-2 sm:px-4 py-1 sm:py-1.5 bg-blue-600 text-white rounded-lg font-semibold transition-colors text-xs sm:text-sm hover:bg-blue-700"
                            >
                                {difficulty}
                            </button>
                            {showDifficultyDropdown && (
                                <div
                                    className="absolute top-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10">
                                    {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((diff) => (
                                        <button
                                            key={diff}
                                            onClick={() => {
                                                startNewGame(diff);
                                                setShowDifficultyDropdown(false);
                                            }}
                                            className={`block w-full px-4 py-2 text-left text-xs sm:text-sm font-semibold transition-colors ${
                                                difficulty === diff
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {diff}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reset + Mistakes */}
                    <div className="flex flex-col items-end gap-1 min-w-0">
                        <button
                            onClick={resetGame}
                            className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap text-xs sm:text-sm"
                            title="reset"
                        >
                            reset
                        </button>
                        <div
                            className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${mistakes >= 3 ? 'text-red-600' : 'text-gray-700'}`}>
                            Mistake {mistakes}/3
                        </div>
                    </div>
                </div>

                {/* Middle - Sudoku Grid */}
                <div className="mb-2 sm:mb-3 inline-block border-2 border-gray-700">
                    {userGrid.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex">
                            {row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={getCellClassName(rowIndex, colIndex)}
                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                >
                                    {cell !== 0 ? (
                                        cell
                                    ) : memos[`${rowIndex}-${colIndex}`]?.length > 0 ? (
                                        <div
                                            className="grid grid-cols-3 grid-rows-3 w-full h-full text-[7px] sm:text-[8px] lg:text-[8px] text-gray-500 p-0.5">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                                <div key={num}
                                                     className="flex items-center justify-center leading-none">
                                                    {memos[`${rowIndex}-${colIndex}`]?.includes(num) ? num : ''}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        ''
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Bottom - Number Pad */}
                <div className="grid grid-cols-6 gap-y-0.5 sm:gap-y-1 gap-x-0.5 mb-2 mx-auto"
                     style={{maxWidth: '24rem'}}>
                    {[1, 2, 3, 4, 5].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberInput(num)}
                            className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-blue-500 hover:bg-blue-600 text-white text-base sm:text-lg lg:text-lg font-bold rounded-lg transition-colors"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={() => setMemoMode(!memoMode)}
                        className={`w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 ${memoMode ? 'bg-purple-700' : 'bg-purple-500'} hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition-colors`}
                    >
                        {memoMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 mx-auto">
                                <path
                                    d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z"/>
                                <path
                                    d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z"/>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 mx-auto">
                                <path
                                    d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z"/>
                            </svg>
                        )}
                    </button>
                    {[6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberInput(num)}
                            className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-blue-500 hover:bg-blue-600 text-white text-base sm:text-lg lg:text-lg font-bold rounded-lg transition-colors"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={() => handleNumberInput(0)}
                        className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-gray-500 hover:bg-gray-600 text-white text-lg sm:text-xl font-bold rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                             className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 mx-auto scale-x-[-1]">
                            <path
                                d="M16.192 6.344L11.949 2.1a1.75 1.75 0 00-2.475 0L2.1 9.474a1.75 1.75 0 000 2.475l7.374 7.374a1.75 1.75 0 002.475 0l7.374-7.374a1.75 1.75 0 000-2.475l-3.131-3.13zM9.474 3.515l4.243 4.243-6.364 6.364-4.243-4.243 6.364-6.364z"/>
                            <path d="M19.5 21h-15a.75.75 0 000 1.5h15a.75.75 0 000-1.5z"/>
                        </svg>
                    </button>
                    <button
                        onClick={handleHint}
                        className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-lg transition-colors"
                        title="hint"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                             className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 mx-auto">
                            <path
                                d="M12 .75a8.25 8.25 0 00-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 00.577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 01-.937-.171.75.75 0 11.374-1.453 5.261 5.261 0 002.626 0 .75.75 0 11.374 1.452 6.712 6.712 0 01-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 00.577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0012 .75z"/>
                            <path fillRule="evenodd"
                                  d="M9.013 19.9a.75.75 0 01.877-.597 11.319 11.319 0 004.22 0 .75.75 0 11.28 1.473 12.819 12.819 0 01-4.78 0 .75.75 0 01-.597-.876zM9.754 22.344a.75.75 0 01.824-.668 13.682 13.682 0 002.844 0 .75.75 0 11.156 1.492 15.156 15.156 0 01-3.156 0 .75.75 0 01-.668-.824z"
                                  clipRule="evenodd"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Right Ad (Desktop only) */}
            <div className="hidden lg:flex items-center justify-center flex-shrink-0 ml-4">
                <KakaoAdFit
                    unit="DAN-9F8a61CzxL0uUlch"
                    width="160"
                    height="600"
                />
            </div>

            {/* Bottom Ad (Mobile only) */}
            <div className="flex lg:hidden items-center justify-center flex-shrink-0 mt-4">
                <KakaoAdFit
                    unit="DAN-sO1iSRgjCf8aopAP"
                    width="320"
                    height="50"
                />
            </div>

            {/* Completion Modal */}
            {isComplete && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-12 text-center animate-bounce">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                            Congratulations! 🎉
                        </div>
                    </div>
                </div>
            )}

            {/* Fail Modal */}
            {isFailed && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-12 text-center animate-bounce">
                        <div className="text-4xl font-bold text-red-600 mb-2">
                            Failed! 😢
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}