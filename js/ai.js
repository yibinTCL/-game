// ai.js
// AI 引擎：不同难度策略封装
(function(global){
  'use strict';
  const { WIN_LINES, AI_LEVELS } = global.Constants;

  /**
   * AIEngine 根据难度给出下一步位置
   * 难度说明：
   * easy   -> 赢法 > 阻挡 > 随机
   * medium -> 赢法 > 阻挡双赢点 > 阻挡 > 随机
   * hard   -> 使用 Minimax 完全搜索（最优）
   */
  class AIEngine {
    constructor(){ }

    chooseMove(board, level){
      if(level === AI_LEVELS.HARD) return this._minimaxMove(board);
      if(level === AI_LEVELS.MEDIUM) return this._mediumMove(board);
      return this._easyMove(board); // 默认 easy
    }

    _easyMove(board){
      return this._findWinning('O', board)
          || this._findWinning('X', board)
          || this._random(board);
    }
    _mediumMove(board){
      return this._findWinning('O', board)
          || this._blockFork('X', board)
          || this._findWinning('X', board)
          || this._random(board);
    }

    // 查找玩家 player 的制胜落子
    _findWinning(player, board){
      for(const line of WIN_LINES){
        const [a,b,c] = line;
        const cells = [board[a],board[b],board[c]];
        if(cells.filter(v=>v===player).length === 2 && cells.includes(null)){
          return line[cells.indexOf(null)];
        }
      }
      return null;
    }

    // 简单阻挡双赢点（不是完整的 fork 检测）
    _blockFork(player, board){
      const forks = [ [0,2,4],[2,8,4],[6,8,4],[0,6,4] ];
      for(const [a,b,c] of forks){
        if(board[a]===player && board[b]===player && board[c]===null){
          return c;
        }
      }
      return null;
    }

    _random(board){
      const empty = board.map((v,i)=> v? null : i).filter(i=>i!==null);
      if(empty.length===0) return null;
      return empty[Math.floor(Math.random()*empty.length)];
    }

    _minimaxMove(board){
      let bestScore = -Infinity;
      let move = null;
      for(let i=0;i<9;i++){
        if(!board[i]){
          board[i] = 'O';
          const score = this._minimax(board,0,false);
          board[i] = null;
          if(score>bestScore){ bestScore=score; move=i; }
        }
      }
      return move;
    }

    _minimax(bd, depth, isMax){
      const winner = this._checkWinner(bd);
      if(winner === 'O') return 10 - depth;
      if(winner === 'X') return depth - 10;
      if(winner === 'draw') return 0;
      if(isMax){
        let best = -Infinity;
        for(let i=0;i<9;i++) if(!bd[i]){ bd[i]='O'; best=Math.max(best,this._minimax(bd,depth+1,false)); bd[i]=null; }
        return best;
      } else {
        let best = Infinity;
        for(let i=0;i<9;i++) if(!bd[i]){ bd[i]='X'; best=Math.min(best,this._minimax(bd,depth+1,true)); bd[i]=null; }
        return best;
      }
    }

    _checkWinner(bd){
      for(const [a,b,c] of WIN_LINES){
        if(bd[a] && bd[a]===bd[b] && bd[a]===bd[c]) return bd[a];
      }
      if(bd.every(cell => cell)) return 'draw';
      return null;
    }
  }

  global.AIEngine = AIEngine;
})(window);
