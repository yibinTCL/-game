const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const pvpBtn = document.getElementById('pvp');
const aiBtn = document.getElementById('ai');
const aiLevelSelect = document.getElementById('aiLevel');
const firstPlayerSelect = document.getElementById('firstPlayer');

let moveSound, winSound;
let audioUnlocked = false;

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let mode = 'pvp'; // 'pvp' or 'ai'
let aiLevel = 'easy'; // easy, medium, hard
// 默认玩家对战
// 旧逻辑已模块化拆分至 js/*.js
// 保留文件仅用于兼容或提示。
// 请查看 js/main.js 入口实现。
console.info('脚本已模块化，请参考 js/ 目录下文件。');
        const cellEl = document.createElement('div');
