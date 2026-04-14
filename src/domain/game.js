import { createSudoku, createSudokuFromJSON } from './sudoku.js';

function _buildGame(sudoku, history, pointer) {
  let _current = sudoku;
  let _history = history || [_current.clone()];
  let _pointer = pointer ?? 0;

  return {
    getSudoku: () => _current,
    getGrid: () => _current.getGrid(),

    guess(move) {
      _history = _history.slice(0, _pointer + 1);
      _current.guess(move);
      _history.push(_current.clone());
      _pointer++;
    },
    undo() {
      if (_pointer > 0) {
        _pointer--;
        _current = _history[_pointer].clone();
      }
    },
    redo() {
      if (_pointer < _history.length - 1) {
        _pointer++;
        _current = _history[_pointer].clone();
      }
    },
    canUndo: () => _pointer > 0,
    canRedo: () => _pointer < _history.length - 1,
    toJSON: () => ({
      history: _history.map(s => s.toJSON()),
      pointer: _pointer
    })
  };
}

export const createGame = ({ sudoku }) => _buildGame(sudoku.clone());

export const createGameFromJSON = (json) => {
  const history = json.history.map(h => createSudokuFromJSON(h));
  const pointer = json.pointer;
  return _buildGame(history[pointer].clone(), history, pointer);
};