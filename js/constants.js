// constants.js
// 全局常量与默认配置
(function(global){
  'use strict';
  /** 胜利线组合 */
  const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  /** AI 难度枚举 */
  const AI_LEVELS = { EASY:'easy', MEDIUM:'medium', HARD:'hard' };
  /** 默认设置 */
  const DEFAULTS = { mode:'pvp', aiLevel:AI_LEVELS.EASY, firstPlayer:'player' };
  global.Constants = { WIN_LINES, AI_LEVELS, DEFAULTS };
})(window);
