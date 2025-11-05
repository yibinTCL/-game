// ui.js
// UI 渲染与事件绑定
(function(global){
  'use strict';
  class UI {
    constructor(game){
      this.game = game;
      // DOM 引用
      this.boardEl = document.getElementById('board');
      this.statusEl = document.getElementById('status');
      this.resetBtn = document.getElementById('reset');
      this.pvpBtn = document.getElementById('pvp');
      this.aiBtn = document.getElementById('ai');
      this.aiLevelSelect = document.getElementById('aiLevel');
      this.firstPlayerSelect = document.getElementById('firstPlayer');
    }

    init(){
      // 注入回调到 game
      this.game.onUpdate = (board)=> this.renderBoard(board);
      this.game.onStatus = (text)=> this.setStatus(text);
      // 绑定事件
      this.resetBtn.addEventListener('click', ()=> this.game.reset());
      this.pvpBtn.addEventListener('click', ()=> this._switchMode('pvp'));
      this.aiBtn.addEventListener('click', ()=> this._switchMode('ai'));
      this.aiLevelSelect.addEventListener('change', e=>{ this.game.setAILevel(e.target.value); this.game.reset(); });
      this.firstPlayerSelect.addEventListener('change', e=>{ this.game.setFirstPlayer(e.target.value); this.game.reset(); });
      // 初始模式
      this.pvpBtn.classList.add('active');
      this.aiLevelSelect.style.display = 'none';
      this.firstPlayerSelect.style.display = 'none';
      this.game.reset();
    }

    renderBoard(board){
      this.boardEl.innerHTML = '';
      board.forEach((cell, idx) => {
        const d = document.createElement('div');
        d.className = 'cell' + (cell ? ' ' + cell.toLowerCase() : '');
        d.textContent = cell ? cell : '';
        d.addEventListener('click', ()=> this.game.playerMove(idx));
        this.boardEl.appendChild(d);
      });
    }

    setStatus(text){ this.statusEl.textContent = text; }

    _switchMode(mode){
      this.game.setMode(mode);
      if(mode==='pvp'){
        this.pvpBtn.classList.add('active');
        this.aiBtn.classList.remove('active');
        this.aiLevelSelect.style.display = 'none';
        this.firstPlayerSelect.style.display = 'none';
      } else {
        this.aiBtn.classList.add('active');
        this.pvpBtn.classList.remove('active');
        this.aiLevelSelect.style.display = '';
        this.firstPlayerSelect.style.display = '';
      }
      this.game.reset();
    }
  }
  global.UI = UI;
})(window);
