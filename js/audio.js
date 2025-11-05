// audio.js
// 音频管理：解决浏览器自动播放限制，提供播放接口与调试信息
(function(global){
  'use strict';
  /**
   * AudioManager 负责：
   * 1. 延迟用户交互后解锁音频 (click / pointerdown)
   * 2. 检测音频文件是否有效 (duration 为 0 给出警告)
   * 3. Web Audio API 回退：如果 <audio> 播放失败，则使用 AudioContext 解码播放。
   */
  class AudioManager {
    constructor(){
      this.moveEl = document.getElementById('moveSound');
      this.winEl = document.getElementById('winSound');
      this.unlocked = false;
      this.ctx = null; // Web Audio 上下文
      this.buffers = {}; // 缓存已加载的 buffer
      // 是否强制使用合成音效（更轻量，不依赖外部文件）
      this.forceSynth = true;
      this._bindUnlock();
    }
    _bindUnlock(){
      const handler = () => this.unlock();
      window.addEventListener('pointerdown', handler, { once:true });
      window.addEventListener('keydown', handler, { once:true });
    }
    unlock(){
      if(this.unlocked) return;
      // 尝试一次静音播放触发权限
      try {
        [this.moveEl,this.winEl].forEach(a => { if(a){ a.volume = 0; a.play().catch(()=>{}); }});
        setTimeout(()=>{
          [this.moveEl,this.winEl].forEach(a => { if(a){ a.pause(); a.currentTime = 0; a.volume = 1; }});
          this.unlocked = true;
          this._checkDuration();
        },120);
      } catch(e){
        console.warn('音频解锁失败，切换到 WebAudio 回退模式:', e);
        this._initContext();
        this.unlocked = true;
      }
    }
    _checkDuration(){
      [this.moveEl,this.winEl].forEach(a => {
        if(a && a.duration === 0){
          console.warn(`音频文件 ${a.id} 可能为空或加载失败，请确认 mp3 是否有效。`);
        }
      });
    }
    _initContext(){
      if(!this.ctx){
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if(AudioCtx){ this.ctx = new AudioCtx(); }
      }
    }
    async _playViaWebAudio(el){
      this._initContext();
      if(!this.ctx) return; // 无法创建上下文
      if(this.buffers[el.id]){
        const src = this.ctx.createBufferSource();
        src.buffer = this.buffers[el.id];
        src.connect(this.ctx.destination);
        src.start();
        return;
      }
      try {
        const resp = await fetch(el.src);
        const arr = await resp.arrayBuffer();
        const buffer = await this.ctx.decodeAudioData(arr);
        this.buffers[el.id] = buffer;
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(this.ctx.destination);
        src.start();
      } catch(e){
        console.warn('WebAudio 解码失败:', e);
      }
    }
    playMove(){
      if(!this.unlocked) return; // 尚未解锁
      if(this.forceSynth || !this.moveEl || this.moveEl.duration === 0){
        this._playSynthMove();
        return;
      }
      this.moveEl.currentTime = 0;
      const p = this.moveEl.play();
      if(p) p.catch(()=> this._playViaWebAudio(this.moveEl));
    }
    playWin(){
      if(!this.unlocked) return;
      if(this.forceSynth || !this.winEl || this.winEl.duration === 0){
        this._playSynthWin();
        return;
      }
      this.winEl.currentTime = 0;
      const p = this.winEl.play();
      if(p) p.catch(()=> this._playViaWebAudio(this.winEl));
    }
    // 合成一个短促的点击 POP 声音
    _playSynthMove(){
      this._initContext();
      if(!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(380, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.6, this.ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    }
    // 合成一个胜利和弦（C5-E5-G5 顺序闪烁）
    _playSynthWin(){
      this._initContext();
      if(!this.ctx) return;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      const start = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start + i*0.15);
        gain.gain.setValueAtTime(0, start + i*0.15);
        gain.gain.linearRampToValueAtTime(0.5, start + i*0.15 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + i*0.15 + 0.4);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(start + i*0.15);
        osc.stop(start + i*0.15 + 0.42);
      });
    }
  }
  global.AudioManager = AudioManager;
})(window);
