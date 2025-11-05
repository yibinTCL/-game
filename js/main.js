// main.js
// 入口：实例化各模块并启动游戏
(function(){
  'use strict';
  // 创建管理器与引擎
  const audio = new AudioManager();
  const ai = new AIEngine();
  const game = new Game(audio, ai);
  const ui = new UI(game);
  ui.init();
  // 暴露调试接口
  window.__TicTacToe = { audio, ai, game, ui };
})();
