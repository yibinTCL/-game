// game.js
// 游戏核心状态与规则
(function(global){
  'use strict';
  const { WIN_LINES } = global.Constants;

  /** Game 类负责：
   * - 维护棋盘数组 board
   * - 当前玩家 currentPlayer ('X'|'O')
   * - 模式 mode ('pvp'|'ai') 与难度 aiLevel
   * - 先手 firstPlayer ('player'|'ai')
   * - 胜负判断与重置
   */
  class Game {
    constructor(audioManager, aiEngine){
      this.audio = audioManager;
      this.ai = aiEngine;
      this.board = Array(9).fill(null);
      this.currentPlayer = 'X';
      this.mode = 'pvp';
      this.aiLevel = global.Constants.DEFAULTS.aiLevel;
      this.firstPlayer = global.Constants.DEFAULTS.firstPlayer;
      this.active = true;
      this.onUpdate = () => {}; // 外部注入：刷新UI
      this.onStatus = () => {}; // 外部注入：状态文本更新
    }

    setMode(mode){ this.mode = mode; }
    setAILevel(level){ this.aiLevel = level; }
    setFirstPlayer(first){ this.firstPlayer = first; }

    reset(){
      this.board = Array(9).fill(null);
      this.active = true;
      this.currentPlayer = (this.mode==='ai' && this.firstPlayer==='ai') ? 'O' : 'X';
      this._emitStatus();
      this._emitUpdate();
      // AI 先手自动走
      if(this.mode==='ai' && this.currentPlayer==='O'){
        setTimeout(()=> this._aiTurn(), 320);
      }
    }

    playerMove(index){
      if(!this.active || this.board[index]) return;
      if(this.mode==='ai' && this.currentPlayer==='O') return; // 不允许玩家操作AI回合
      this._place(index); // 玩家落子
      if(!this.active) return;
      if(this.mode==='ai' && this.currentPlayer==='O'){ // 切换到 AI 回合
        setTimeout(()=> this._aiTurn(), 320);
      }
    }

    _aiTurn(){
      if(!this.active || this.currentPlayer!=='O') return;
      const move = this.ai.chooseMove([...this.board], this.aiLevel);
      if(move!==null) this._place(move);
    }

    _place(index){
      this.board[index] = this.currentPlayer;
      this.audio.playMove();
      this._emitUpdate();
      const winner = this._checkWinner();
      if(winner){
        this.active = false;
        if(winner==='draw'){
          this.onStatus('平局');
        } else {
          this.onStatus(`${winner} 获胜!`);
          this.audio.playWin();
        }
        return;
      }
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      this._emitStatus();
    }

    _checkWinner(){
      for(const [a,b,c] of WIN_LINES){
        if(this.board[a] && this.board[a]===this.board[b] && this.board[a]===this.board[c]) return this.board[a];
      }
      if(this.board.every(cell => cell)) return 'draw';
      return null;
    }

    _emitUpdate(){ this.onUpdate(this.board); }
    _emitStatus(){ this.onStatus(`当前回合：${this.currentPlayer}`); }
  }

  global.Game = Game;
})(window);
