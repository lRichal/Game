(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const canvas = $('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const GROUND = 600;
  const WORLD_END = 4550;

  const assetPaths = {
    characters: 'assets/personagens_unificados_lote03_v6.png',
    background: 'assets/cenario_excelencer.png',
    documents: 'assets/ataques_documentos.png',
    boss: 'assets/chefe_cofre_quadrado_v3.png',
    scenery: 'assets/cenario_pronto.png',
    enemy: 'assets/inimigo_juros_pronto.png',
    enemyAttack: 'assets/ataque_juros_v2.png',
    pen: 'assets/caneta_azul.png',
    clip: 'assets/clipe_metalico.png',
    logoOfficial: 'assets/logo_excelencia_oficial_v2.png',
    shock: 'assets/super_shock_cartoon_v1.png'
  };
  const images = {};

  const characterNames = [
    'Bruno','Caires','Camila','Celliny','Davi','Gabriel Iglesias','Hiroshi','Holanda','Isabelly',
    'Richard','Robert','Roberta','Simone','Taina','Zuleika','Jeniffer','João','Jorge','Kaio','Kauane',
    'Larissa','Matheus','Nicole','Pedro','Tati'
  ];
  const characters = characterNames.map((name,id)=>({
    id,name,sheet:'characters',x:0,y:id*300,w:1024,h:300,frames:4,
    scaleX:1,
    reverseWalk:false
  }));

  const LEVELS = {
    normal: {
      title:'NÍVEL PADRÃO', enemyHp:3, enemySpeed:48, enemyAttackMin:1.55, enemyAttackRand:1.45,
      enemyShotSpeed:230, enemyShotChance:1, enemyDetect:560, scoreMultiplier:1, bossHp:60, bossAttackScale:1,
      positions:[760,1050,1380,1760,2070,2460,2780,3190,3520,3880,4140]
    },
    excelencer: {
      title:'EXCELENCER', enemyHp:5, enemySpeed:82, enemyAttackMin:1.05, enemyAttackRand:.95,
      enemyShotSpeed:290, enemyShotChance:.7, enemyDetect:760, scoreMultiplier:2, bossHp:100, bossAttackScale:.67,
      positions:[520,835,1150,1465,1780,2095,2410,2725,3040,3355,3670,3985,4290]
    }
  };

  const STAMP_LAYOUT = [
    [340,520],[585,500],[710,425],[835,425],[1100,520],[1370,500],
    [1530,378],[1700,378],[2000,520],[2200,475],[2390,430],[2510,430],
    [2810,520],[3160,363],[3320,363],[3560,520],[3790,425],[4050,520]
  ];

  const MUSIC_TRACKS = {
    menu:{interval:280,type:'triangle',melody:[392,494,587,494,440,523,659,523],bass:[98,110,123,110]},
    story:{interval:350,type:'sine',melody:[330,392,440,392,349,440,494,440],bass:[82,87,98,87]},
    stage:{interval:185,type:'square',melody:[523,659,784,659,587,698,880,698,523,659,784,988,880,784,698,587],bass:[131,131,147,165,131,147,165,147]},
    excelencer:{interval:138,type:'square',melody:[659,784,988,784,698,880,1047,880,784,988,1175,988,880,784,698,784],bass:[110,123,131,147,110,131,147,165]},
    boss:{interval:165,type:'sawtooth',melody:[196,233,196,262,196,294,262,233,196,233,311,262],bass:[65,73,65,82,65,87]},
    victory:{interval:235,type:'triangle',melody:[523,659,784,1047,784,880,988,1175],bass:[131,165,196,262]},
    gameover:{interval:410,type:'sine',melody:[220,196,175,147,0,147,0,131],bass:[55,49,44,37]}
  };

  const STORIES = {
    intro: [
      {speaker:'Narrador',portrait:'logo',text:'Na Excelência Mediações, cada conflito pode encontrar uma solução.'},
      {speaker:'Tati',portrait:'Tati',text:'Equipe, temos um problema! O BANK roubou os contratos e os transformou em armadilhas!'},
      {speaker:'Paulo',portrait:'Paulo',text:'Ele está espalhando Juros Abusivos por toda a cidade.'},
      {speaker:'Narrador',portrait:'logo',text:'Quanto mais tempo passa, mais fortes os Juros se tornam.'},
      {speaker:'Tati',portrait:'Tati',text:'Precisamos recuperar os contratos antes que ninguém consiga mais negociar.'},
      {speaker:'$PLAYER',portrait:'selected',text:'Então vamos mostrar que nenhum abuso é maior que uma equipe preparada!'},
      {speaker:'Todos',portrait:'team',text:'SOZINHO NINGUÉM VENCE!',team:true},
      {speaker:'Objetivo',portrait:'selected',text:'Atravesse a cidade, derrote os Juros Abusivos e recupere os contratos roubados pelo BANK.'}
    ],
    boss: [
      {speaker:'BANK',portrait:'boss',text:'Vocês chegaram tarde! Cada segundo dentro desta sala vale mais juros!',bank:true},
      {speaker:'$PLAYER',portrait:'selected',text:'Juros abusivos não são poder. São injustiça.'},
      {speaker:'BANK',portrait:'boss',text:'Eu tenho cofres, cobranças e contratos infinitos!',bank:true},
      {speaker:'$PLAYER',portrait:'selected',text:'E nós temos conhecimento, coragem e uma equipe inteira.'},
      {speaker:'BANK',portrait:'boss',text:'Então prepare-se para assinar a sua derrota!',bank:true},
      {speaker:'$PLAYER',portrait:'selected',text:'A única coisa que vamos assinar é o fim do abuso.'}
    ],
    ending: [
      {speaker:'BANK',portrait:'boss',text:'Impossível… meus cálculos eram perfeitos…',bank:true},
      {speaker:'$PLAYER',portrait:'selected',text:'Você esqueceu de considerar a parte mais importante: as pessoas.'},
      {speaker:'Tati',portrait:'Tati',text:'Contrato não deve ser usado para causar medo.'},
      {speaker:'Paulo',portrait:'Paulo',text:'Um bom acordo nasce do diálogo, do equilíbrio e da justiça.'},
      {speaker:'Narrador',portrait:'team',text:'Toda a equipe entra na sala e se reúne ao redor do BANK.',team:true},
      {speaker:'BANK',portrait:'boss',text:'Talvez… ainda exista uma forma justa de negociar?',bank:true},
      {speaker:'$PLAYER',portrait:'selected',text:'Sempre existe. Mas agora você vai precisar aprender a ouvir.'},
      {speaker:'Narrador',portrait:'logo',text:'O BANK perde a expressão maligna. Seus olhos ficam azuis e surge um documento escrito: NOVO CARNÊ.',novoCarne:true},
      {speaker:'Narrador',portrait:'logo',text:'Os contratos foram recuperados, os Juros Abusivos desapareceram e a cidade voltou a negociar com segurança.'},
      {speaker:'Todos',portrait:'team',text:'SOZINHO NINGUÉM VENCE!',team:true}
    ]
  };

  const STORY_LABELS = {
    intro:'A AMEAÇA DOS JUROS',
    boss:'ENCONTRO COM O BANK',
    ending:'O ÚLTIMO ACORDO'
  };

  const keys = { left:false, right:false };
  let selected = 0;
  let selectPage = 0;
  let gameMode = 'menu';
  let running = false;
  let paused = false;
  let lastTime = 0;
  let raf = 0;
  let cameraX = 0;
  let score = 0;
  let startTime = 0;
  let screenShake = 0;
  let message = '';
  let messageTime = 0;
  let audioCtx = null;
  let difficulty = 'normal';
  let endingStarted = false;
  let dialogueState = {active:false,scene:null,index:0,onComplete:null};
  let soundEnabled = true;
  let musicTrack = null;
  let musicTimer = 0;
  let musicStep = 0;
  let stamps = [];
  let stampCount = 0;
  let totalStamps = STAMP_LAYOUT.length;

  let player;
  let enemies = [];
  let shots = [];
  let enemyShots = [];
  let particles = [];
  let platforms = [];
  let boss = null;
  let bossHazards = [];
  let superSpecial = {active:false,used:false,type:null,t:0,hit:false};
  let stampSpecial = {active:false,used:false,mode:null,t:0,hit:false,buff:false};

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(el => el.classList.toggle('active', el.id === id));
  }

  function storySpeaker(name){return name==='$PLAYER'?characters[selected].name:name;}

  function drawShockCell(target,frame,x,y,w,h,flip=false,alpha=1){
    const im=images.shock;if(!im)return;
    const crops=[
      {x:20,y:175,w:545,h:480},
      {x:590,y:245,w:385,h:440},
      {x:1035,y:180,w:390,h:510},
      {x:1435,y:175,w:265,h:515}
    ];
    const c=crops[Math.max(0,Math.min(3,frame))],scale=Math.min(w/c.w,h/c.h),dw=c.w*scale,dh=c.h*scale,ox=(w-dw)/2,oy=h-dh;
    target.save();target.globalAlpha=alpha;
    if(flip){target.translate(x+w,y);target.scale(-1,1);target.drawImage(im,c.x,c.y,c.w,c.h,ox,oy,dw,dh);}
    else target.drawImage(im,c.x,c.y,c.w,c.h,x+ox,y+oy,dw,dh);
    target.restore();
  }

  function drawDialoguePortrait(step){
    const portrait=$('dialoguePortrait'),pctx=portrait.getContext('2d');
    pctx.clearRect(0,0,portrait.width,portrait.height);
    if(step.portrait==='logo'){
      if(images.logoOfficial)pctx.drawImage(images.logoOfficial,28,34,184,184);
      return;
    }
    if(step.portrait==='boss'){
      const im=images.boss;
      if(im){const sw=im.width/4,sh=im.height/2,frame=step.novoCarne?7:0;pctx.drawImage(im,(frame%4)*sw,Math.floor(frame/4)*sh,sw,sh,12,15,216,225);}
      return;
    }
    if(step.portrait==='Paulo'){
      drawShockCell(pctx,3,10,8,220,244,false,1);
      return;
    }
    if(step.portrait==='team'){
      const ids=[characters.findIndex(ch=>ch.name==='Tati'),selected];
      ids.forEach((id,i)=>drawSpriteCell(pctx,characters[Math.max(0,id)],3,22+i*108,82,88,170,false));
      drawShockCell(pctx,0,45,8,150,85,false,1);
      return;
    }
    const id=step.portrait==='selected'?selected:characters.findIndex(ch=>ch.name===step.portrait);
    drawSpriteCell(pctx,characters[id<0?selected:id],step.frame??0,10,8,220,244,false);
  }

  function renderDialogueStep(){
    if(!dialogueState.active)return;
    const story=STORIES[dialogueState.scene],step=story[dialogueState.index];
    $('dialogueScene').textContent=STORY_LABELS[dialogueState.scene];
    $('dialogueProgress').textContent=`${dialogueState.index+1}/${story.length}`;
    $('dialogueSpeaker').textContent=storySpeaker(step.speaker).toUpperCase();
    $('dialogueText').textContent=step.text.replaceAll('{PERSONAGEM}',characters[selected].name);
    $('dialogueNext').textContent=dialogueState.index===story.length-1?'CONCLUIR →':'CONTINUAR →';
    const balloon=$('dialogue').querySelector('.dialogue-balloon');
    balloon.classList.toggle('team-line',!!step.team);
    balloon.classList.toggle('bank-line',!!step.bank);
    balloon.classList.toggle('novo-carne-line',!!step.novoCarne);
    drawDialoguePortrait(step);
    drawStoryBackdrop(dialogueState.scene,dialogueState.index);
    beep(step.bank?115:step.team?620:step.portrait==='logo'?390:480,.045,step.bank?'sawtooth':'sine',.022);
    window.__DIALOGUE_STEP={scene:dialogueState.scene,index:dialogueState.index,speaker:storySpeaker(step.speaker),text:step.text};
  }

  function startDialogue(scene,onComplete){
    keys.left=keys.right=false;
    dialogueState={active:true,scene,index:0,onComplete};
    showScreen('dialogue');
    renderDialogueStep();
    window.__GAME_STATE=`dialogue-${scene}`;
  }

  function completeDialogue(){
    if(!dialogueState.active)return;
    const done=dialogueState.onComplete;
    dialogueState={active:false,scene:null,index:0,onComplete:null};
    showScreen(null);
    if(done)done();
  }

  function advanceDialogue(){
    if(!dialogueState.active)return;
    const story=STORIES[dialogueState.scene];
    if(dialogueState.index>=story.length-1){completeDialogue();return;}
    dialogueState.index++;
    renderDialogueStep();
  }

  function currentLevel(){return LEVELS[difficulty];}

  function setDifficulty(next){
    difficulty=next==='excelencer'?'excelencer':'normal';
    const elite=difficulty==='excelencer';
    $('difficultyNote').textContent=elite?'EXCELENCER · Mais inimigos, ataques rápidos e BANK fortalecido.':'NÍVEL PADRÃO · Equilíbrio entre ação e desafio.';
    $('difficultyNote').classList.toggle('excelencer',elite);
    $('levelBadge').textContent=elite?'NÍVEL EXCELENCER':'NÍVEL PADRÃO';
    $('levelBadge').classList.toggle('excelencer',elite);
    $('startBtn').textContent=elite?'INICIAR EXCELENCER':'JOGAR COM ESTE PERSONAGEM';
    window.__GAME_DIFFICULTY=difficulty;
  }

  function loadImage(key, src) {
    return new Promise(resolve => {
      const im = new Image();
      im.onload = () => { images[key] = im; resolve(true); };
      im.onerror = () => { console.warn('Não foi possível carregar:', src); resolve(false); };
      im.src = src;
    });
  }

  async function loadAll() {
    const entries = Object.entries(assetPaths);
    let done = 0;
    for (const [key,src] of entries) {
      await loadImage(key,src);
      done++;
      const pct = Math.round(done/entries.length*100);
      $('loadFill').style.width = pct+'%';
      $('loadText').textContent = `Carregando artes… ${pct}%`;
    }
    // Estas duas folhas já são entregues com transparência no ZIP. Isso evita
    // leitura de pixels em tempo de execução, bloqueada pelo Chrome em file://.
    images.sceneryKeyed = images.scenery;
    images.enemyKeyed = images.enemy;
    window.__ASSETS_READY = true;
    renderCharacterGrid();
    drawMenuScene();
    showScreen('menu');
  }

  function drawSpriteCell(target, def, frame, dx, dy, dw, dh, flip=false) {
    const im = images[def.sheet];
    if (!im) return;
    const fw = def.w / def.frames;
    const sx = def.x + fw * Math.max(0,Math.min(def.frames-1,frame));
    const renderW = dw*(def.scaleX||1);
    const renderX = dx+(dw-renderW)/2;
    const reverseThisFrame = def.reverseWalk&&(frame===1||frame===2);
    const finalFlip = reverseThisFrame?!flip:flip;
    target.save();
    if (finalFlip) { target.translate(renderX+renderW,dy); target.scale(-1,1); target.drawImage(im,sx,def.y,fw,def.h,0,0,renderW,dh); }
    else target.drawImage(im,sx,def.y,fw,def.h,renderX,dy,renderW,dh);
    target.restore();
  }

  function renderCharacterGrid() {
    const perPage = 8;
    const pages = Math.ceil(characters.length/perPage);
    selectPage = Math.max(0,Math.min(pages-1,selectPage));
    const start = selectPage*perPage;
    const list = characters.slice(start,start+perPage);
    const grid = $('characterGrid');
    grid.innerHTML = '';
    list.forEach(ch => {
      const button = document.createElement('button');
      button.className = 'character-card'+(ch.id===selected?' selected':'');
      button.setAttribute('aria-label',ch.name);
      const preview = document.createElement('canvas');
      preview.width=260; preview.height=190;
      const pc = preview.getContext('2d');
      const bg = pc.createRadialGradient(130,85,15,130,95,145);
      bg.addColorStop(0,'#46505e'); bg.addColorStop(1,'#151920');
      pc.fillStyle=bg; pc.fillRect(0,0,260,190);
      pc.fillStyle='#0005'; pc.beginPath(); pc.ellipse(130,169,55,10,0,0,Math.PI*2); pc.fill();
      drawSpriteCell(pc,ch,0,58,5,144,165,false);
      const label = document.createElement('span'); label.textContent=ch.name;
      button.append(preview,label);
      button.onclick = () => { selected=ch.id; $('selectedName').textContent=ch.name.toUpperCase(); renderCharacterGrid(); beep(430,.05); };
      grid.appendChild(button);
    });
    $('pageLabel').textContent=`PÁGINA ${selectPage+1}/${pages}`;
    $('prevBtn').disabled=selectPage===0;
    $('nextBtn').disabled=selectPage===pages-1;
    $('selectedName').textContent=characters[selected].name.toUpperCase();
  }

  function audioSupported(){return !!(window.AudioContext||window.webkitAudioContext);}

  function updateSoundButtons(){
    const label=soundEnabled?'♫ SOM: LIGADO':'♫ SOM: DESLIGADO';
    ['soundToggleMenu','soundTogglePause'].forEach(id=>{
      const button=$(id);if(!button)return;
      button.textContent=label;button.disabled=!audioSupported();button.setAttribute('aria-pressed',String(soundEnabled));button.classList.toggle('sound-off',!soundEnabled);
    });
    window.__SOUND_ENABLED=soundEnabled;window.__MUSIC_TRACK=musicTrack;
  }

  function initAudio() {
    if(!soundEnabled||!audioSupported())return;
    if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended')audioCtx.resume();
  }

  function playTone(freq,duration=.06,type='square',volume=.035,delay=0){
    if(!soundEnabled||!audioCtx||!freq)return;
    const start=audioCtx.currentTime+delay,o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.frequency.value=freq;o.type=type;g.gain.value=volume;
    o.connect(g);g.connect(audioCtx.destination);o.start(start);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.stop(start+duration);
  }

  function beep(freq,duration=.06,type='square',volume=.035){playTone(freq,duration,type,volume);}

  function playMusicStep(){
    if(!soundEnabled||!audioCtx||!musicTrack)return;
    const track=MUSIC_TRACKS[musicTrack];if(!track)return;
    const melody=track.melody[musicStep%track.melody.length];
    if(melody)playTone(melody,track.interval/1000*.72,track.type,.012);
    if(musicStep%2===0){
      const bass=track.bass[Math.floor(musicStep/2)%track.bass.length];
      if(bass)playTone(bass,track.interval/1000*1.45,'triangle',.009);
    }
    if((musicTrack==='stage'||musicTrack==='excelencer')&&musicStep%4===2)playTone(melody/2,track.interval/1000*.42,'sine',.005);
    musicStep++;
  }

  function setMusic(name){
    musicTrack=name&&MUSIC_TRACKS[name]?name:null;musicStep=0;
    if(musicTimer){window.clearInterval(musicTimer);musicTimer=0;}
    if(soundEnabled&&audioCtx&&musicTrack){
      playMusicStep();musicTimer=window.setInterval(playMusicStep,MUSIC_TRACKS[musicTrack].interval);
    }
    window.__MUSIC_TRACK=musicTrack;
  }

  function setSoundEnabled(enabled){
    soundEnabled=!!enabled;
    try{window.localStorage.setItem('excelencia-som',soundEnabled?'on':'off');}catch(error){}
    if(!soundEnabled){if(musicTimer){window.clearInterval(musicTimer);musicTimer=0;}}
    else{initAudio();const current=musicTrack;setMusic(current);beep(660,.08,'sine',.035);}
    updateSoundButtons();
  }

  function initializeSound(){
    try{soundEnabled=window.localStorage.getItem('excelencia-som')!=='off';}catch(error){soundEnabled=true;}
    updateSoundButtons();
  }

  function playStampSound(){
    const rise=Math.min(8,stampCount)*24;
    beep(720+rise,.08,'sine',.055);
    window.setTimeout(()=>beep(960+rise,.11,'triangle',.045),65);
  }

  function resetPlayer(x=130) {
    player={x,y:GROUND-112,w:70,h:112,vx:0,vy:0,onGround:true,jumps:0,facing:1,lives:3,inv:0,shootCd:0,anim:0,attackAnim:0,attackKind:'pen'};
  }

  function buildStage() {
    const level=currentLevel();resetPlayer(); cameraX=0; score=0; startTime=performance.now();
    endingStarted=false;
    platforms=[
      {x:660,y:492,w:250,h:28},{x:1480,y:445,w:280,h:28},{x:2350,y:495,w:230,h:28},{x:3140,y:430,w:300,h:28},{x:3750,y:490,w:230,h:28}
    ];
    enemies=level.positions.map((x,i)=>{const hp=level.enemyHp+(i>7?1:0)+(difficulty==='excelencer'&&i>13?1:0);return{x,y:GROUND-102,w:72,h:102,hp,maxHp:hp,vx:-level.enemySpeed-Math.random()*22,attack:.4+Math.random(),anim:Math.random()*3,flash:0,dead:false};});
    stamps=STAMP_LAYOUT.map(([x,y],id)=>({id,x,y,w:46,h:50,t:id*.37,collected:false}));stampCount=0;totalStamps=stamps.length;
    shots=[];enemyShots=[];particles=[];bossHazards=[];boss=null;superSpecial={active:false,used:false,type:null,t:0,hit:false};stampSpecial={active:false,used:false,mode:null,t:0,hit:false,buff:false};window.__STAMP_SPECIAL_ACTIVE=false;window.__STAMP_SPECIAL_BUFF=false;window.__STAMP_SPECIAL_DAMAGE=0;window.__PLAYER_SPEED_MULTIPLIER=1;window.__PEN_RATE_MULTIPLIER=1;
    gameMode='stage';running=true;paused=false;lastTime=performance.now();
    setMusic(difficulty==='excelencer'?'excelencer':'stage');
    say(difficulty==='excelencer'?'NÍVEL EXCELENCER · SOBREVIVA AO CERCO':'MISSÃO 01 · ATRAVESSE O ESCRITÓRIO',1900);showScreen(null);loop(lastTime);
    window.__GAME_STATE='stage';window.__STAMP_COUNT=stampCount;window.__STAMP_TOTAL=totalStamps;
  }

  function startBoss() {
    const level=currentLevel();
    endingStarted=false;
    gameMode='boss';cameraX=0;resetPlayer(130);player.lives=Math.max(1,player.lives);
    shots=[];enemyShots=[];particles=[];bossHazards=[];superSpecial={active:false,used:false,type:null,t:0,hit:false};stampSpecial={active:false,used:false,mode:null,t:0,hit:false,buff:false};window.__STAMP_SPECIAL_ACTIVE=false;window.__STAMP_SPECIAL_BUFF=false;window.__STAMP_SPECIAL_DAMAGE=0;window.__PLAYER_SPEED_MULTIPLIER=1;window.__PEN_RATE_MULTIPLIER=1;
    boss={x:930,y:GROUND-270,w:270,h:270,hp:level.bossHp,maxHp:level.bossHp,t:0,attack:1.5*level.bossAttackScale,summon:0,flash:0,phase:1};
    setMusic('boss');
    paused=true;
    drawStoryBackdrop('boss',0);
    startDialogue('boss',()=>{
      paused=false;lastTime=performance.now();boss.attack=1.5*level.bossAttackScale;
      say(difficulty==='excelencer'?'⚠ BANK EXCELENCER · PODER MÁXIMO ⚠':'⚠ BOSS DETECTADO · BANK ⚠',2100);
      beep(105,.35,'sawtooth',.08);window.__GAME_STATE='boss';
    });
  }

  function say(text,time=1200){message=text;messageTime=time/1000;}

  function jump(){
    if(!running||paused||superSpecial.active||stampSpecial.active)return;
    if(player.onGround||player.jumps<2){player.vy=player.jumps===1?-570:-640;player.onGround=false;player.jumps++;beep(player.jumps===2?610:470,.07,'square');}
  }

  function shoot(kind){
    if(!running||paused||player.shootCd>0||superSpecial.active||stampSpecial.active)return;
    const clip=kind==='clip',clipExcelencer=clip&&difficulty==='excelencer',boostedPen=!clip&&stampSpecial.buff;
    const clipSpeed=clipExcelencer?970:720;
    player.shootCd=clip?(clipExcelencer?.285:.38):(boostedPen?.16/1.5:.16);player.attackAnim=clip?(clipExcelencer?.27:.34):(boostedPen?.2/1.5:.2);player.attackKind=kind;
    shots.push({x:player.x+(player.facing>0?player.w-3:-44),y:player.y+38,w:44,h:30,vx:player.facing*(clip?clipSpeed:930),kind,damage:clip?2:1,life:1.8,rot:0});
    beep(clip?210:720,.055,clip?'sawtooth':'square',.035);
  }

  function canUseStampSpecial(){
    return running&&!paused&&gameMode==='boss'&&boss&&totalStamps>0&&stampCount>=totalStamps&&!stampSpecial.used&&!stampSpecial.active&&!superSpecial.active;
  }

  function triggerStampSpecial(mode='throw'){
    if(!canUseStampSpecial())return;
    mode=mode==='absorb'?'absorb':'throw';stampSpecial={active:true,used:true,mode,t:0,hit:false,buff:false};
    bossHazards=[];shots=[];enemyShots=[];keys.left=keys.right=false;player.vx=0;player.vy=0;player.y=GROUND-player.h;player.inv=5;boss.attack=5;boss.summon=0;screenShake=5;
    say(mode==='throw'?'ESFERA DOS CARIMBOS · 70 DE DANO':'ABSORÇÃO · VELOCIDADE 2× · CANETA 1,5×',2100);
    beep(165,.18,'sine',.05);window.setTimeout(()=>beep(247,.2,'triangle',.05),130);window.setTimeout(()=>beep(370,.24,'sine',.05),280);
    window.__STAMP_SPECIAL_MODE=mode;window.__STAMP_SPECIAL_ACTIVE=true;
  }

  function updateStampSpecial(dt){
    stampSpecial.t+=dt;player.inv=Math.max(player.inv,.35);boss.t+=dt;boss.flash=Math.max(0,boss.flash-dt);
    const throwing=stampSpecial.mode==='throw',effectAt=throwing?2.82:2.5,finishAt=throwing?3.55:3.18;
    if(!stampSpecial.hit&&stampSpecial.t>=effectAt){
      stampSpecial.hit=true;
      if(throwing){
        boss.hp=Math.max(0,boss.hp-70);boss.flash=.75;screenShake=34;score+=3500;
        burst(boss.x+boss.w/2,boss.y+boss.h/2,'#ffffff',32);burst(boss.x+boss.w/2,boss.y+boss.h/2,'#a42cff',44);burst(boss.x+boss.w/2,boss.y+boss.h/2,'#4b0b78',28);
        beep(72,.4,'sawtooth',.09);window.setTimeout(()=>beep(740,.42,'sine',.06),80);
      }else{
        stampSpecial.buff=true;screenShake=18;score+=1500;
        burst(player.x+player.w/2,player.y+player.h/2,'#ffffff',24);burst(player.x+player.w/2,player.y+player.h/2,'#a42cff',38);
        beep(294,.22,'sine',.06);window.setTimeout(()=>beep(587,.28,'triangle',.055),90);window.setTimeout(()=>beep(880,.34,'sine',.05),200);
        window.__PLAYER_SPEED_MULTIPLIER=2;window.__PEN_RATE_MULTIPLIER=1.5;
      }
      window.__STAMP_SPECIAL_HIT=true;window.__STAMP_SPECIAL_BUFF=stampSpecial.buff;window.__STAMP_SPECIAL_DAMAGE=throwing?70:0;
    }
    if(stampSpecial.t>=finishAt){
      stampSpecial.active=false;player.inv=1.2;boss.attack=1.45*currentLevel().bossAttackScale;window.__STAMP_SPECIAL_ACTIVE=false;
      if(throwing&&boss.hp<=0)finish(true);else say(throwing?'ESFERA ARREMESSADA · 70 DE DANO!':'PODER ABSORVIDO · VELOCIDADE 2× · CANETA 1,5×',1800);
    }
  }

  function canUseSuperSpecial(){
    return running&&!paused&&gameMode==='boss'&&difficulty==='excelencer'&&characters[selected].name==='Tati'&&boss&&!superSpecial.used&&!superSpecial.active&&!stampSpecial.active;
  }

  function triggerSuperSpecial(type='logo'){
    if(!canUseSuperSpecial())return;
    type=type==='shock'?'shock':'logo';
    superSpecial={active:true,used:true,type,t:0,hit:false};
    bossHazards=[];shots=[];enemyShots=[];keys.left=keys.right=false;
    player.x=130;player.y=GROUND-player.h;player.vx=0;player.vy=0;player.inv=6;
    boss.attack=type==='logo'?6:5.2;boss.summon=0;screenShake=8;
    if(type==='shock'){
      say('TATI CHAMA O SUPER SHOCK!',1350);
      beep(180,.18,'sawtooth',.055);setTimeout(()=>beep(520,.22,'sine',.06),120);setTimeout(()=>beep(880,.28,'square',.045),250);
    }else{
      say('TATI CONVOCA TODA A EQUIPE!',1350);
      beep(330,.18,'sine',.06);setTimeout(()=>beep(495,.22,'sine',.055),110);setTimeout(()=>beep(660,.3,'sine',.05),220);
    }
  }

  function updateSuperSpecial(dt){
    superSpecial.t+=dt;player.inv=Math.max(player.inv,.3);boss.t+=dt;boss.flash=Math.max(0,boss.flash-dt);
    const shock=superSpecial.type==='shock';
    const hitAt=shock?2.65:4.05,finishAt=shock?4.2:5.15,damage=shock?50:45;
    if(!superSpecial.hit&&superSpecial.t>=hitAt){
      superSpecial.hit=true;boss.hp=Math.max(0,boss.hp-damage);boss.flash=.65;screenShake=shock?30:26;score+=shock?3000:2500;
      burst(boss.x+boss.w/2,boss.y+boss.h/2,'#ffffff',34);
      burst(boss.x+boss.w/2,boss.y+boss.h/2,shock?'#32a9ff':'#e21d2b',34);
      burst(boss.x+boss.w/2,boss.y+boss.h/2,shock?'#ffd45a':'#ffd36a',24);
      beep(shock?78:95,.38,'sawtooth',.09);setTimeout(()=>beep(shock?920:780,.45,'sine',.06),90);
    }
    if(superSpecial.t>=finishAt){
      superSpecial.active=false;player.inv=1.2;boss.attack=1.4*currentLevel().bossAttackScale;
      if(boss.hp<=0)finish(true);else say(shock?'Meu herói · 50 de dano!':'SozinhoNinguemVence · 45 de dano!',1500);
    }
  }

  function damagePlayer(){
    if(player.inv>0)return;
    player.lives--;player.inv=1.25;player.vy=-330;screenShake=11;beep(90,.25,'sawtooth',.08);
    burst(player.x+player.w/2,player.y+40,'#f22',16);
    if(player.lives<=0) finish(false);
  }

  function burst(x,y,color='#ffb33a',n=10){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*330,vy:(Math.random()-.8)*280,life:.35+Math.random()*.45,color,size:3+Math.random()*6});}
  function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}

  function updatePlayer(dt,bounds=4400){
    const speed=300*(stampSpecial.buff?2:1);
    player.vx=(keys.left?-speed:0)+(keys.right?speed:0);
    if(player.vx)player.facing=Math.sign(player.vx);
    player.x=Math.max(10,Math.min(bounds,player.x+player.vx*dt));
    player.vy+=1550*dt;player.y+=player.vy*dt;player.onGround=false;
    let floor=GROUND;
    if(gameMode==='stage'){
      for(const p of platforms){
        if(player.x+player.w>p.x&&player.x<p.x+p.w&&player.vy>=0&&player.y+player.h>=p.y&&player.y+player.h-player.vy*dt<=p.y+10)floor=Math.min(floor,p.y);
      }
    }
    if(player.y+player.h>=floor){player.y=floor-player.h;player.vy=0;player.onGround=true;player.jumps=0;}
    player.anim+=Math.abs(player.vx)*dt/75;player.inv=Math.max(0,player.inv-dt);player.shootCd=Math.max(0,player.shootCd-dt);player.attackAnim=Math.max(0,player.attackAnim-dt);
  }

  function updateStamps(dt){
    for(const stamp of stamps){
      if(stamp.collected)continue;
      stamp.t+=dt;
      const bobY=stamp.y+Math.sin(stamp.t*3.4)*7;
      if(overlap(player,{x:stamp.x-4,y:bobY-4,w:stamp.w+8,h:stamp.h+8})){
        stamp.collected=true;stampCount++;score+=75*currentLevel().scoreMultiplier;
        burst(stamp.x+stamp.w/2,bobY+stamp.h/2,'#ffcf59',16);burst(stamp.x+stamp.w/2,bobY+stamp.h/2,'#df1c29',10);playStampSound();
        window.__STAMP_COUNT=stampCount;
        if(stampCount===totalStamps){
          score+=1000*currentLevel().scoreMultiplier;say('COLEÇÃO COMPLETA · TODOS OS CARIMBOS!',2200);
          window.setTimeout(()=>beep(1175,.14,'triangle',.055),130);window.setTimeout(()=>beep(1568,.22,'sine',.05),270);
        }
      }
    }
  }

  function updateStage(dt){
    const level=currentLevel();
    updatePlayer(dt,WORLD_END-150);
    updateStamps(dt);
    cameraX=Math.max(0,Math.min(WORLD_END-W,player.x-300));
    for(const e of enemies){
      if(e.dead)continue;
      const dist=player.x-e.x;
      if(Math.abs(dist)<level.enemyDetect)e.vx=Math.abs(dist)>145?Math.sign(dist)*level.enemySpeed:0;
      e.x+=e.vx*dt;e.anim+=dt*4;e.attack-=dt;e.flash=Math.max(0,e.flash-dt);
      if(e.attack<=0&&Math.abs(dist)<level.enemyDetect+90){
        e.attack=level.enemyAttackMin+Math.random()*level.enemyAttackRand;
        if(Math.random()<=level.enemyShotChance){
          const direction=Math.sign(dist)||1,originY=e.y+34;
          enemyShots.push({x:e.x+e.w/2,y:originY,baseY:originY,w:54,h:38,vx:direction*level.enemyShotSpeed,vy:0,life:4,rot:0,t:0,type:'interest'});
          if(Math.abs(e.x-player.x)<520)beep(145,.045,'sawtooth',.014);
        }
      }
      if(overlap(player,e))damagePlayer();
    }
    updateShots(dt);
    if(player.x>WORLD_END-380)startBoss();
  }

  function updateBoss(dt){
    const level=currentLevel();
    if(stampSpecial.active){updateStampSpecial(dt);updateShots(dt);return;}
    if(superSpecial.active){updateSuperSpecial(dt);updateShots(dt);return;}
    updatePlayer(dt,840);
    boss.t+=dt;boss.attack-=dt;boss.flash=Math.max(0,boss.flash-dt);boss.summon=Math.max(0,boss.summon-dt);
    boss.phase=boss.hp<boss.maxHp*.34?3:boss.hp<boss.maxHp*.67?2:1;
    if(boss.attack<=0){
      boss.attack=(boss.phase===3?1.2:boss.phase===2?1.55:1.9)*level.bossAttackScale;boss.summon=.72;beep(125,.18,'sawtooth',.055);
      const count=boss.phase+2+(difficulty==='excelencer'?2:0);
      for(let i=0;i<count;i++){
        const target=i===0?Math.max(85,Math.min(790,player.x+(Math.random()-.5)*90)):100+Math.random()*720;
        bossHazards.push({x:target,y:-150-Math.random()*170,w:78,h:104,vy:(difficulty==='excelencer'?330:255)+Math.random()*95,rot:(Math.random()-.5)*.35,delay:.25+i*.055+Math.random()*.16,life:6});
      }
    }
    for(const h of bossHazards){h.delay-=dt;if(h.delay<=0){h.vy+=180*dt;h.y+=h.vy*dt;h.rot+=dt*.6;if(overlap(player,h)){h.life=0;damagePlayer();}if(h.y>GROUND-18)h.life=0;}h.life-=dt;}
    bossHazards=bossHazards.filter(h=>h.life>0);
    updateShots(dt);
  }

  function updateShots(dt){
    for(const s of shots){
      s.x+=s.vx*dt;s.life-=dt;s.rot+=dt*8*Math.sign(s.vx);
      if(gameMode==='stage'){
        for(const e of enemies){if(!e.dead&&overlap(s,e)){e.hp-=s.damage;e.flash=.12;s.life=0;burst(s.x,s.y,'#ffd36a',7);beep(s.kind==='clip'?190:430,.035,'sine',.014);if(e.hp<=0){e.dead=true;score+=100*currentLevel().scoreMultiplier;burst(e.x+35,e.y+40,'#e21d2b',18);beep(130,.12,'square');}}}
      }else if(boss&&overlap(s,boss)){
        boss.hp-=s.damage;boss.flash=.1;s.life=0;screenShake=3;burst(s.x,s.y,'#ffbf38',7);beep(s.kind==='clip'?170:390,.035,'triangle',.014);
        if(boss.hp<=0){boss.hp=0;finish(true);}
      }
    }
    shots=shots.filter(s=>s.life>0&&s.x>-100&&s.x<(gameMode==='stage'?WORLD_END+100:W+100));
    for(const s of enemyShots){s.t+=dt;s.x+=s.vx*dt;s.y=s.baseY;s.rot+=dt*2;s.life-=dt;if(overlap(player,s)){s.life=0;damagePlayer();}}
    enemyShots=enemyShots.filter(s=>s.life>0&&s.y<H+100&&s.x>-100&&s.x<WORLD_END+100);
    for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;p.life-=dt;}
    particles=particles.filter(p=>p.life>0);
    messageTime=Math.max(0,messageTime-dt);screenShake=Math.max(0,screenShake-35*dt);
  }

  function showEndScreen(win){
    window.__GAME_STATE=win?'victory':'gameover';
    $('endEyebrow').textContent=win?(difficulty==='excelencer'?'EXCELENCER CONCLUÍDO':'MISSÃO CUMPRIDA'):'MISSÃO ENCERRADA';
    $('endTitle').textContent=win?'Missão cumprida!':'Game over';
    const stampResult=` Carimbos coletados: ${stampCount}/${totalStamps}.`;
    $('endText').textContent=win?'O combate terminou, mas a busca pelo NOVO CARNÊ continua. Excelência Mediações — Transformando conflitos em soluções.'+stampResult:'Os juros venceram esta rodada. Tente outra vez.'+stampResult;
    showScreen('end');beep(win?760:100,win?.5:.3,win?'sine':'sawtooth',.07);
  }

  function finish(win){
    if(endingStarted)return;
    endingStarted=true;
    running=false;cancelAnimationFrame(raf);window.__GAME_STATE=win?'victory':'gameover';
    setMusic(win?'victory':'gameover');
    if(win){
      gameMode='ending';bossHazards=[];shots=[];enemyShots=[];particles=[];
      startDialogue('ending',()=>showEndScreen(true));
    }else showEndScreen(win);
  }

  function roundRect(x,y,w,h,r,fill=true,stroke=false){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill)ctx.fill();if(stroke)ctx.stroke();}

  function drawOfficeBackdrop(cam=0){
    if(images.background){
      ctx.drawImage(images.background,0,0,images.background.width,images.background.height,0,0,W,H);
      const shade=ctx.createLinearGradient(0,0,W,0);shade.addColorStop(0,'#06090d28');shade.addColorStop(.5,'#0000');shade.addColorStop(1,'#06090d38');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
      if(difficulty==='excelencer'){ctx.fillStyle='#6b071016';ctx.fillRect(0,0,W,H);}
      return;
    }
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#dce9f0');g.addColorStop(.68,'#8ba6b5');g.addColorStop(.69,'#584334');g.addColorStop(1,'#17191e');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.save();ctx.translate(-(cam*.18)%420,0);
    for(let x=-420;x<W+420;x+=420){
      ctx.fillStyle='#bdd3df';ctx.fillRect(x,70,385,345);ctx.fillStyle='#52778e';ctx.fillRect(x+18,92,349,285);
      const sky=ctx.createLinearGradient(0,92,0,377);sky.addColorStop(0,'#6ebbe9');sky.addColorStop(1,'#e4eef2');ctx.fillStyle=sky;ctx.fillRect(x+25,99,335,270);
      ctx.strokeStyle='#263743';ctx.lineWidth=10;ctx.strokeRect(x+18,92,349,285);ctx.beginPath();ctx.moveTo(x+190,95);ctx.lineTo(x+190,375);ctx.stroke();
      ctx.fillStyle='#20262c';ctx.fillRect(x+385,65,35,370);
    }
    ctx.restore();
    ctx.fillStyle='#f8f1e8';ctx.fillRect(0,0,W,65);ctx.fillStyle='#5a3321';ctx.fillRect(0,415,W,18);
    ctx.fillStyle='#9d6b45';for(let y=433;y<GROUND;y+=32){ctx.fillRect(0,y,W,30);ctx.fillStyle='#7e5034';for(let x=((y/32)%2)*90;x<W;x+=180)ctx.fillRect(x,y,2,30);ctx.fillStyle='#9d6b45';}
    ctx.fillStyle='#14171c';ctx.fillRect(0,GROUND,W,H-GROUND);ctx.fillStyle='#252a31';for(let y=GROUND+15;y<H;y+=34){for(let x=(y%68?0:40);x<W;x+=82){ctx.fillRect(x,y,76,27);}}
    ctx.fillStyle='#aa111c';ctx.fillRect(36,25,285,50);ctx.fillStyle='#fff';ctx.font='900 24px Segoe UI';ctx.fillText('EXCELÊNCIA MEDIAÇÕES',55,58);
  }

  function drawGround(cam=0){
    const tile=images.sceneryKeyed;
    if(tile){for(let x=-(cam%415)-20;x<W+420;x+=415)ctx.drawImage(tile,130,655,930,120,x,560,430,58);}
    else{ctx.fillStyle='#7c4c2c';ctx.fillRect(0,560,W,45);}
    ctx.fillStyle='#1a1b20';ctx.fillRect(0,605,W,10);
  }

  function drawPlatform(p){
    const x=p.x-cameraX;if(x+p.w<0||x>W)return;const tile=images.sceneryKeyed;
    if(tile)ctx.drawImage(tile,795,75,180,170,x,p.y-5,p.w,p.h+45);else{ctx.fillStyle='#80502f';ctx.fillRect(x,p.y,p.w,p.h);}
  }

  function drawStampIcon(x,y,size,spin=1){
    ctx.save();ctx.translate(x,y);ctx.scale(spin,1);ctx.shadowColor='#ffbd42';ctx.shadowBlur=size*.45;
    ctx.fillStyle='#6f0b13';roundRect(-size*.18,-size*.62,size*.36,size*.22,size*.08,true);ctx.fillStyle='#d91b29';roundRect(-size*.3,-size*.46,size*.6,size*.18,size*.08,true);
    ctx.fillStyle='#ffcf63';ctx.beginPath();ctx.arc(0,size*.04,size*.48,0,Math.PI*2);ctx.fill();ctx.fillStyle='#bd111c';ctx.beginPath();ctx.arc(0,size*.04,size*.39,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#fff0b8';ctx.lineWidth=Math.max(1.5,size*.045);ctx.setLineDash([size*.09,size*.055]);ctx.beginPath();ctx.arc(0,size*.04,size*.3,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font=`1000 ${Math.max(8,size*.22)}px Segoe UI`;ctx.fillText('EM',0,size*.015);ctx.font=`900 ${Math.max(5,size*.105)}px Segoe UI`;ctx.fillText('CARIMBO',0,size*.2);ctx.restore();
  }

  function drawStamp(stamp){
    if(stamp.collected)return;const x=stamp.x-cameraX;if(x<-80||x>W+80)return;
    const y=stamp.y+Math.sin(stamp.t*3.4)*7,spin=.2+.8*Math.abs(Math.cos(stamp.t*2.6));
    ctx.save();ctx.globalAlpha=.22;ctx.fillStyle='#ffbd42';ctx.beginPath();ctx.ellipse(x+stamp.w/2,y+stamp.h+7,28,7,0,0,Math.PI*2);ctx.fill();ctx.restore();
    drawStampIcon(x+stamp.w/2,y+stamp.h/2,stamp.w,spin);
    const sparkle=.55+.45*Math.sin(stamp.t*7);ctx.save();ctx.globalAlpha=sparkle;ctx.strokeStyle='#fff3b6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+stamp.w+5,y+2);ctx.lineTo(x+stamp.w+5,y+14);ctx.moveTo(x+stamp.w-1,y+8);ctx.lineTo(x+stamp.w+11,y+8);ctx.stroke();ctx.restore();
  }

  function drawCharacterWorld(ch,x,y,w,h,frame,flip=false,alpha=1){ctx.save();ctx.globalAlpha=alpha;drawSpriteCell(ctx,ch,frame,x,y,w,h,flip);ctx.restore();}

  function drawPlayer(){
    const px=gameMode==='stage'?player.x-cameraX:player.x;
    const moving=player.onGround&&Math.abs(player.vx)>10,attacking=player.attackAnim>0,charging=stampSpecial.active;
    const frame=charging?3:attacking?3:!player.onGround?2:moving?(1+Math.floor(player.anim)%2):0;
    const bob=moving?Math.sin(player.anim*Math.PI)*3:0;
    const lean=attacking?-player.facing*.055:moving?Math.sin(player.anim*Math.PI)*.018:0;
    const recoil=attacking?-player.facing*5:0;
    ctx.save();if(player.inv>0&&Math.floor(player.inv*12)%2===0)ctx.globalAlpha=.3;
    if(stampSpecial.buff){
      const pulse=.6+.4*Math.sin(performance.now()/95);ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(182,80,255,${.55+.25*pulse})`;ctx.lineWidth=4;ctx.shadowColor='#a42cff';ctx.shadowBlur=26;ctx.beginPath();ctx.ellipse(px+player.w/2,player.y+player.h/2,48+8*pulse,70+7*pulse,0,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<7;i++){const a=performance.now()/420+i*Math.PI*2/7,r=46+10*Math.sin(a*2+i);ctx.fillStyle=i%2?'#e7bcff':'#8b24e8';ctx.beginPath();ctx.arc(px+player.w/2+Math.cos(a)*r,player.y+player.h/2+Math.sin(a)*r*.9,2.5+i%2,0,Math.PI*2);ctx.fill();}ctx.restore();
    }
    ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(px+player.w/2,player.y+player.h-3,35,9,0,0,Math.PI*2);ctx.fill();
    ctx.translate(px+player.w/2,player.y+player.h/2);ctx.rotate(lean);ctx.translate(-(px+player.w/2),-(player.y+player.h/2));
    drawCharacterWorld(characters[selected],px-22+recoil,player.y-19+bob,player.w+44,player.h+23,frame,player.facing<0);
    if(attacking){
      const fx=px+(player.facing>0?player.w+28:-28),fy=player.y+38+bob;ctx.translate(fx,fy);
      const power=Math.min(1,player.attackAnim/(player.attackKind==='clip'?.34:.2));ctx.globalAlpha*=power;
      ctx.fillStyle=player.attackKind==='clip'?'#f7f9ff':'#65b8ff';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=18;ctx.beginPath();ctx.arc(0,0,7+power*8,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function enemyFrame(e){if(e.flash>0)return 6;return 1+(Math.floor(e.anim)%3);}
  function drawEnemy(e){
    if(e.dead)return;const x=e.x-cameraX;if(x<-120||x>W+120)return;const im=images.enemyKeyed||images.enemy;
    ctx.save();if(e.flash>0)ctx.globalAlpha=.55;ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(x+36,GROUND-3,38,9,0,0,Math.PI*2);ctx.fill();
    if(im){const f=enemyFrame(e),col=f%4,row=Math.floor(f/4);ctx.drawImage(im,col*362,row*543+35,362,410,x-30,e.y-20,132,126);}else{ctx.fillStyle='#151515';roundRect(x,e.y,e.w,e.h,20,true);}
    ctx.globalAlpha=1;ctx.fillStyle='#28060a';roundRect(x-3,e.y-13,e.w+6,8,5,true);ctx.fillStyle='#ef2633';roundRect(x-3,e.y-13,(e.w+6)*(e.hp/e.maxHp),8,5,true);ctx.restore();
  }

  function drawWeaponShot(s){
    const im=images[s.kind];const x=(gameMode==='stage'?s.x-cameraX:s.x),y=s.y;
    ctx.save();ctx.translate(x+s.w/2,y+s.h/2);ctx.rotate(s.rot*.12);if(s.vx<0)ctx.scale(-1,1);
    if(im)ctx.drawImage(im,-28,-28,56,56);else{ctx.fillStyle=s.kind==='pen'?'#176ce5':'#ddd';ctx.fillRect(-20,-4,40,8);}ctx.restore();
  }

  function drawDocument(d,xOverride=null){
    const x=xOverride??(gameMode==='stage'?d.x-cameraX:d.x);ctx.save();ctx.translate(x+d.w/2,d.y+d.h/2);ctx.rotate(d.rot||0);
    if(images.documents)ctx.drawImage(images.documents,0,0,241,285,-d.w/2,-d.h/2,d.w,d.h);else{ctx.fillStyle='#fff5d5';ctx.fillRect(-d.w/2,-d.h/2,d.w,d.h);}ctx.restore();
  }

  function drawEnemyAttack(s){
    const x=gameMode==='stage'?s.x-cameraX:s.x,y=s.y,im=images.enemyAttack;
    ctx.save();ctx.translate(x+s.w/2,y+s.h/2);if(s.vx<0)ctx.scale(-1,1);
    ctx.shadowColor='#ff211c';ctx.shadowBlur=18;
    if(im)ctx.drawImage(im,35,120,1460,720,-46,-29,92,58);
    else{const g=ctx.createRadialGradient(10,0,2,0,0,28);g.addColorStop(0,'#fff');g.addColorStop(.22,'#ff3028');g.addColorStop(1,'#160207');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,34,20,0,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }

  function drawBossContract(h){
    if(h.delay>0){
      const pulse=.7+Math.sin(performance.now()/85+h.x)*.25;
      ctx.save();ctx.globalAlpha=pulse;ctx.strokeStyle='#ffb32f';ctx.lineWidth=4;ctx.setLineDash([11,8]);ctx.beginPath();ctx.ellipse(h.x+h.w/2,GROUND-9,38,12,0,0,Math.PI*2);ctx.stroke();ctx.restore();return;
    }
    ctx.save();ctx.translate(h.x+h.w/2,h.y+h.h/2);ctx.rotate(h.rot||0);ctx.shadowColor='#ff6c23';ctx.shadowBlur=13;
    if(images.documents)ctx.drawImage(images.documents,0,0,241,285,-h.w/2,-h.h/2,h.w,h.h);
    else{ctx.fillStyle='#fff2cd';ctx.fillRect(-h.w/2,-h.h/2,h.w,h.h);ctx.fillStyle='#b51922';ctx.font='900 12px Segoe UI';ctx.textAlign='center';ctx.fillText('CONTRATO',0,-18);}
    ctx.restore();
  }

  function drawHUD(){
    ctx.save();ctx.fillStyle='#090c11dc';roundRect(22,18,375,78,16,true);ctx.strokeStyle='#ffffff24';ctx.lineWidth=2;roundRect(22,18,375,78,16,false,true);
    ctx.fillStyle='#fff';ctx.font='900 17px Segoe UI';ctx.fillText(characters[selected].name.toUpperCase(),42,46);ctx.fillStyle='#aeb6c1';ctx.font='700 13px Segoe UI';ctx.fillText(`PONTOS ${String(score).padStart(5,'0')}`,42,75);
    ctx.font='26px Segoe UI';ctx.fillStyle='#ef2633';ctx.fillText('♥'.repeat(Math.max(0,player.lives)),244,65);ctx.fillStyle='#4d2630';ctx.fillText('♥'.repeat(3-Math.max(0,player.lives)),244+ctx.measureText('♥'.repeat(Math.max(0,player.lives))).width,65);
    ctx.fillStyle='#090c11dc';roundRect(W-225,18,203,78,16,true);ctx.strokeStyle=stampCount===totalStamps?'#ffcf63':'#ffffff24';ctx.lineWidth=2;roundRect(W-225,18,203,78,16,false,true);
    drawStampIcon(W-188,58,38,1);ctx.fillStyle='#ffdf88';ctx.font='1000 12px Segoe UI';ctx.fillText('CARIMBOS',W-155,47);ctx.fillStyle='#fff';ctx.font='1000 23px Segoe UI';ctx.fillText(`${stampCount}/${totalStamps}`,W-155,75);
    if(difficulty==='excelencer'){ctx.fillStyle='#86121be8';roundRect(22,103,166,30,15,true);ctx.strokeStyle='#ffbd42';ctx.lineWidth=1.5;roundRect(22,103,166,30,15,false,true);ctx.fillStyle='#ffe09a';ctx.font='1000 12px Segoe UI';ctx.fillText('NÍVEL EXCELENCER',37,123);}
    if(gameMode==='boss'&&difficulty==='excelencer'&&characters[selected].name==='Tati'&&!superSpecial.used){
      ctx.fillStyle='#120c1eea';roundRect(22,624,304,66,18,true);ctx.strokeStyle='#ffd36a';ctx.lineWidth=2;roundRect(22,624,304,66,18,false,true);
      ctx.fillStyle='#fff0bd';ctx.font='1000 13px Segoe UI';ctx.fillText('Z · SozinhoNinguemVence',40,649);
      ctx.fillStyle='#aee7ff';ctx.fillText('X · Meu herói',40,676);
    }
    if(gameMode==='boss'&&stampCount>=totalStamps&&!stampSpecial.used){
      ctx.fillStyle='#190626ed';roundRect(W-365,624,343,66,18,true);ctx.strokeStyle='#c76cff';ctx.lineWidth=2;roundRect(W-365,624,343,66,18,false,true);
      ctx.fillStyle='#f2d7ff';ctx.font='1000 13px Segoe UI';ctx.fillText('Q · ARREMESSAR ESFERA · 70 DE DANO',W-347,649);
      ctx.fillStyle='#d5a2ff';ctx.fillText('E · ABSORVER · VELOCIDADE 2× · CANETA 1,5×',W-347,676);
    }
    if(gameMode==='boss'&&stampSpecial.buff){
      ctx.fillStyle='#250839e8';roundRect(W-390,108,368,42,15,true);ctx.strokeStyle='#bd61ff';ctx.lineWidth=2;roundRect(W-390,108,368,42,15,false,true);ctx.fillStyle='#f0d2ff';ctx.font='1000 12px Segoe UI';ctx.fillText('ESFERA ABSORVIDA · MOVIMENTO 2× · CANETA 1,5×',W-373,134);
    }
    if(gameMode==='stage'){
      ctx.fillStyle='#080b10cc';roundRect(W/2-230,666,460,24,12,true);ctx.fillStyle='#4a161a';roundRect(W/2-220,674,440,8,4,true);ctx.fillStyle='#e2222e';roundRect(W/2-220,674,440*Math.min(1,player.x/(WORLD_END-380)),8,4,true);ctx.fillStyle='#fff';ctx.font='800 11px Segoe UI';ctx.textAlign='center';ctx.fillText(difficulty==='excelencer'?'EXCELENCER · CAMINHO ATÉ O BANK':'CAMINHO ATÉ O BANK',W/2,659);ctx.textAlign='left';
    }else if(boss){
      ctx.fillStyle='#080b10e8';roundRect(W/2-270,22,540,62,15,true);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='1000 18px Segoe UI';ctx.fillText(difficulty==='excelencer'?'BANK · EXCELENCER':'BANK',W/2,47);ctx.fillStyle='#481116';roundRect(W/2-235,58,470,12,6,true);ctx.fillStyle='#ef1f2d';roundRect(W/2-235,58,470*(boss.hp/boss.maxHp),12,6,true);ctx.textAlign='left';
    }
    if(messageTime>0){ctx.globalAlpha=Math.min(1,messageTime*3);ctx.fillStyle='#090c11e8';roundRect(W/2-300,118,600,64,15,true);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='1000 24px Segoe UI';ctx.fillText(message,W/2,158);ctx.textAlign='left';}
    ctx.restore();
  }

  function drawParticles(){for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/.8);ctx.fillStyle=p.color;ctx.fillRect((gameMode==='stage'?p.x-cameraX:p.x),p.y,p.size,p.size);}ctx.globalAlpha=1;}

  function drawStage(){
    drawOfficeBackdrop(cameraX);drawGround(cameraX);platforms.forEach(drawPlatform);stamps.forEach(drawStamp);enemyShots.forEach(drawEnemyAttack);enemies.forEach(drawEnemy);shots.forEach(drawWeaponShot);drawParticles();drawPlayer();drawHUD();
  }

  function drawBossSprite(){
    if(!boss)return;const im=images.boss;let frame=0;
    if(boss.flash>0)frame=6;
    else if(boss.summon>0)frame=4;
    else if(bossHazards.length)frame=5;
    else if(boss.phase===3)frame=3;
    else if(boss.phase===2)frame=2;
    else if(Math.sin(boss.t*3)>0)frame=1;
    ctx.save();if(boss.flash>0)ctx.globalAlpha=.55;ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(boss.x+boss.w/2,GROUND-8,135,23,0,0,Math.PI*2);ctx.fill();
    if(im){const sw=im.width/4,sh=im.height/2,sx=(frame%4)*sw,sy=Math.floor(frame/4)*sh;ctx.drawImage(im,sx,sy,sw,sh,boss.x-10,boss.y,boss.w+20,boss.h);}else{ctx.fillStyle='#373b42';roundRect(boss.x,boss.y,boss.w,boss.h,40,true);}ctx.globalAlpha=1;ctx.restore();
  }

  const clamp01=v=>Math.max(0,Math.min(1,v));

  function drawOfficialLogo(x,y,size,alpha=1,rotation=0){
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rotation);ctx.shadowColor='#ff2032';ctx.shadowBlur=size*.28;
    const halo=ctx.createRadialGradient(0,0,size*.08,0,0,size*.55);halo.addColorStop(0,'rgba(255,255,255,.98)');halo.addColorStop(.72,'rgba(255,248,232,.88)');halo.addColorStop(1,'rgba(255,215,125,0)');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(0,0,size*.56,0,Math.PI*2);ctx.fill();
    if(images.logoOfficial)ctx.drawImage(images.logoOfficial,-size*.48,-size*.48,size*.96,size*.96);
    else{
      ctx.fillStyle='#d71928';ctx.beginPath();ctx.arc(0,-size*.05,size*.33,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font=`1000 ${Math.max(12,size*.12)}px Segoe UI`;ctx.fillText('EXCELÊNCIA',0,size*.38);
    }
    ctx.restore();
  }

  function drawShockSprite(frame,x,y,w,h,flip=false,alpha=1){
    drawShockCell(ctx,frame,x,y,w,h,flip,alpha);
  }

  function drawEnergyBolt(x1,y1,x2,y2,color,alpha=1,width=3,seed=0){
    const dx=x2-x1,dy=y2-y1,len=Math.max(1,Math.hypot(dx,dy)),nx=-dy/len,ny=dx/len;
    ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.shadowColor=color;ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(x1,y1);
    for(let i=1;i<7;i++){const p=i/7,j=Math.sin(i*9.17+seed*2.3+superSpecial.t*31)*10*(1-Math.abs(p-.5));ctx.lineTo(x1+dx*p+nx*j,y1+dy*p+ny*j);}
    ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
  }

  function drawPurpleBolt(x1,y1,x2,y2,alpha=1,width=3,seed=0){
    const dx=x2-x1,dy=y2-y1,len=Math.max(1,Math.hypot(dx,dy)),nx=-dy/len,ny=dx/len,time=performance.now()/45;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=alpha;ctx.strokeStyle=seed%2?'#f0c8ff':'#a42cff';ctx.lineWidth=width;ctx.shadowColor='#9d28f3';ctx.shadowBlur=16;ctx.beginPath();ctx.moveTo(x1,y1);
    for(let i=1;i<9;i++){const p=i/9,j=Math.sin(i*8.7+seed*3.1+time)*9*(1-Math.abs(p-.5));ctx.lineTo(x1+dx*p+nx*j,y1+dy*p+ny*j);}
    ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
  }

  function drawPurpleOrb(x,y,r,power=1,alpha=1){
    if(r<=1||alpha<=0)return;const time=performance.now()/1000;
    ctx.save();ctx.globalAlpha=alpha;ctx.globalCompositeOperation='lighter';
    const halo=ctx.createRadialGradient(x,y,r*.08,x,y,r*1.8);halo.addColorStop(0,'rgba(255,255,255,.92)');halo.addColorStop(.18,'rgba(217,139,255,.72)');halo.addColorStop(.58,'rgba(139,31,231,.34)');halo.addColorStop(1,'rgba(74,0,112,0)');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,r*1.8,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.translate(x,y);for(let i=0;i<3;i++){ctx.save();ctx.rotate(time*(.7+i*.24)+i*1.8);ctx.strokeStyle=i===1?'#e9b8ff':'#8e2be2';ctx.globalAlpha=alpha*(.48+i*.11);ctx.lineWidth=Math.max(2,r*(.045-i*.007));ctx.shadowColor='#c15cff';ctx.shadowBlur=r*.25;ctx.beginPath();ctx.ellipse(0,0,r*(1.15+i*.16),r*(.38+i*.08),i*.45,0,Math.PI*2);ctx.stroke();ctx.restore();}ctx.restore();
    const core=ctx.createRadialGradient(x-r*.28,y-r*.32,r*.05,x,y,r);core.addColorStop(0,'#ffffff');core.addColorStop(.15,'#efd4ff');core.addColorStop(.38,'#c264ff');core.addColorStop(.68,'#7820c5');core.addColorStop(.9,'#3c075f');core.addColorStop(1,'#170021');ctx.fillStyle=core;ctx.shadowColor='#b442ff';ctx.shadowBlur=r*.48;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(250,224,255,.8)';ctx.lineWidth=Math.max(2,r*.035);for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(x,y,r*(.3+i*.14),time*(1+i*.18)+i, time*(1+i*.18)+i+Math.PI*.78);ctx.stroke();}
    const shine=ctx.createRadialGradient(x-r*.35,y-r*.42,0,x-r*.35,y-r*.42,r*.52);shine.addColorStop(0,'rgba(255,255,255,.92)');shine.addColorStop(.38,'rgba(241,207,255,.4)');shine.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=shine;ctx.beginPath();ctx.arc(x-r*.24,y-r*.3,r*.52,0,Math.PI*2);ctx.fill();
    for(let i=0;i<16;i++){const a=time*(i%2?1.35:-1.05)+i*Math.PI*2/16,rr=r*(1.12+(i%4)*.12),pr=Math.max(1.4,r*(.025+(i%3)*.009));ctx.fillStyle=i%3===0?'#fff':'#cb69ff';ctx.globalAlpha=alpha*(.55+.4*Math.sin(time*5+i));ctx.beginPath();ctx.arc(x+Math.cos(a)*rr,y+Math.sin(a)*rr,pr,0,Math.PI*2);ctx.fill();}
    for(let i=0;i<4;i++){const a=time*1.7+i*Math.PI/2,x1=x+Math.cos(a)*r*.72,y1=y+Math.sin(a)*r*.72,x2=x+Math.cos(a+.9)*r*1.35,y2=y+Math.sin(a+.9)*r*1.35;drawPurpleBolt(x1,y1,x2,y2,alpha*(.5+.35*power),Math.max(1.5,r*.025),i+2);}
    ctx.restore();
  }

  function drawStampSpecial(){
    if(!stampSpecial.active)return;
    const t=stampSpecial.t,charge=clamp01(t/2.12),ease=1-Math.pow(1-charge,3),startX=player.x+player.w/2,startY=player.y-90;
    const throwing=stampSpecial.mode==='throw',flight=throwing?clamp01((t-2.12)/.7):0,absorb=!throwing?clamp01((t-2.08)/.46):0;
    const flightEase=1-Math.pow(1-flight,3),targetX=boss.x+boss.w*.48,targetY=boss.y+boss.h*.48;
    let orbX=startX,orbY=startY,r=12+78*ease,alpha=1;
    if(throwing&&flight>0){orbX=startX+(targetX-startX)*flightEase;orbY=startY+(targetY-startY)*flightEase-80*Math.sin(flight*Math.PI);r=90-flight*24;}
    if(!throwing&&absorb>0){orbY=startY+(player.y+player.h*.48-startY)*absorb;r=90*(1-absorb*.9);alpha=1-absorb*.72;}
    if(throwing&&stampSpecial.hit)alpha=clamp01((3.08-t)/.26);
    ctx.save();ctx.fillStyle=`rgba(12,0,24,${.18+.22*charge})`;ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#f3d8ff';ctx.shadowColor='#9f32ef';ctx.shadowBlur=22;ctx.font='1000 30px Segoe UI';ctx.fillText('ESFERA DOS 18 CARIMBOS',W/2,116);ctx.font='900 13px Segoe UI';ctx.fillStyle=throwing?'#ffcf76':'#dcb0ff';ctx.fillText(throwing?'ARREMESSAR · 70 DE DANO':'ABSORVER · VELOCIDADE 2× · CANETA 1,5×',W/2,142);
    if(charge<1){
      for(let i=0;i<18;i++){const a=i*Math.PI*2/18+t*(1.3+i%2*.2),rr=165*(1-ease)+92,ix=startX+Math.cos(a)*rr,iy=startY+Math.sin(a)*rr*.62;drawStampIcon(ix,iy,18+8*ease,.65);ctx.strokeStyle=`rgba(194,92,255,${.18+.42*ease})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ix,iy);ctx.quadraticCurveTo((ix+startX)/2,startY-45,startX,startY);ctx.stroke();}
      ctx.fillStyle='#160522dd';roundRect(W/2-205,158,410,28,14,true);ctx.strokeStyle='#c165ff';ctx.lineWidth=2;roundRect(W/2-205,158,410,28,14,false,true);ctx.fillStyle='#8d26dc';roundRect(W/2-195,168,390*charge,8,4,true);
    }
    drawPurpleOrb(orbX,orbY,r,ease,alpha);
    if(throwing&&flight>0){for(let i=0;i<3;i++)drawPurpleBolt(startX,startY,orbX-r*.35,orbY,Math.max(0,.5-flight*.25),3+i,i+20);}
    if(!throwing&&absorb>0){for(let i=0;i<6;i++){const a=i*Math.PI/3+t*3,ex=player.x+player.w/2+Math.cos(a)*(44+45*absorb),ey=player.y+player.h/2+Math.sin(a)*(58+30*absorb);drawPurpleBolt(orbX,orbY,ex,ey,(1-absorb)*.8,2.5,i+30);}}
    if(stampSpecial.hit&&throwing){const impact=clamp01((t-2.82)/.72);ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(220,155,255,${1-impact})`;ctx.lineWidth=18*(1-impact)+3;ctx.shadowColor='#a42cff';ctx.shadowBlur=40;ctx.beginPath();ctx.arc(targetX,targetY,28+impact*230,0,Math.PI*2);ctx.stroke();ctx.fillStyle=`rgba(255,255,255,${(1-impact)*.65})`;ctx.beginPath();ctx.arc(targetX,targetY,100*(1-impact),0,Math.PI*2);ctx.fill();ctx.restore();}
    ctx.restore();
  }

  function drawLogoSpecial(){
    const t=superSpecial.t,gather=clamp01(t/1.15),charge=clamp01((t-1.02)/2.28),flight=clamp01((t-3.45)/.6),impact=clamp01((t-4.03)/.78);
    const groupFade=t<4.3?1:clamp01((5.08-t)/.78),logoStart={x:650,y:265},logoEnd={x:boss.x+boss.w*.5,y:boss.y+boss.h*.47};
    const flyEase=1-Math.pow(1-flight,3),logoX=logoStart.x+(logoEnd.x-logoStart.x)*flyEase,logoY=logoStart.y+(logoEnd.y-logoStart.y)*flyEase;
    ctx.save();ctx.fillStyle=`rgba(3,2,7,${.3+.42*clamp01(t/.5)})`;ctx.fillRect(0,0,W,H);ctx.fillStyle=`rgba(198,12,30,${.06+.08*Math.sin(t*11)})`;ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';ctx.fillStyle=`rgba(255,247,216,${clamp01(t/.35)*groupFade})`;ctx.shadowColor='#e21d2b';ctx.shadowBlur=22;ctx.font='1000 31px Segoe UI';ctx.fillText('SozinhoNinguemVence',W*.48,100);
    ctx.font='800 13px Segoe UI';ctx.fillStyle='#ffd36a';ctx.fillText('25 PESSOAS · UMA SÓ FORÇA',W*.48,126);

    const points=[];
    characters.forEach((ch,i)=>{
      const back=i<13,rowIndex=back?i:i-13,count=back?13:12,w=back?54:59,h=back?76:83,baseY=back?535:600;
      const targetX=(back?18:36)+rowIndex*(back?59:63),targetY=baseY-h;
      const startX=i%2===0?-110-i*7:W+45+i*6,ease=1-Math.pow(1-gather,3),x=startX+(targetX-startX)*ease,y=targetY-(1-ease)*25;
      const visible=clamp01((t-i*.012)/.28)*groupFade,frame=gather<.97?(Math.floor(t*11+i)%2?1:2):3;
      ctx.save();ctx.globalAlpha=visible*(back?.84:1);ctx.fillStyle='#0009';ctx.beginPath();ctx.ellipse(x+w*.5,baseY-3,w*.33,6,0,0,Math.PI*2);ctx.fill();ctx.restore();
      drawCharacterWorld(ch,x,y,w,h,frame,false,visible*(back?.9:1));
      points.push({x:x+w*.52,y:y+h*.25,a:visible});
      if(charge>0&&flight<1){
        const pulse=.52+.42*Math.sin(t*16+i*1.7);ctx.save();ctx.globalAlpha=visible*charge*pulse;ctx.fillStyle=i===selected?'#ffd35e':'#ff3345';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=18;ctx.beginPath();ctx.arc(x+w*.53,y+h*.22,3+charge*5,0,Math.PI*2);ctx.fill();ctx.restore();
      }
    });

    if(charge>0&&flight<1){
      ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<points.length;i++){const p=points[i];ctx.globalAlpha=p.a;ctx.strokeStyle=i===selected?`rgba(255,218,91,${charge*.62})`:`rgba(255,48,64,${charge*.4})`;ctx.lineWidth=i===selected?2.6:1.35;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=9;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo((p.x+logoStart.x)/2,p.y-65-charge*32,logoStart.x,logoStart.y);ctx.stroke();}ctx.restore();
      const remaining=Math.max(1,Math.ceil(3.45-t));ctx.fillStyle='#09080edc';roundRect(465,145,370,48,18,true);ctx.strokeStyle='#ffcf64';ctx.lineWidth=2;roundRect(465,145,370,48,18,false,true);
      ctx.fillStyle='#fff';ctx.font='1000 16px Segoe UI';ctx.fillText(`CARREGANDO PODER · ${remaining}`,650,165);ctx.fillStyle='#471018';roundRect(490,175,320,8,4,true);ctx.fillStyle='#ee2636';roundRect(490,175,320*charge,8,4,true);
    }

    if(flight>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,38,51,${(1-impact)*.8})`;ctx.lineWidth=38*(1-flight)+10;ctx.shadowColor='#ff2535';ctx.shadowBlur=30;ctx.beginPath();ctx.moveTo(logoStart.x-35,logoStart.y+8);ctx.lineTo(logoX,logoY);ctx.stroke();ctx.restore();}
    if(impact<.98)drawOfficialLogo(logoX,logoY,165+flight*40,(1-impact*.72)*groupFade,flight*.4);
    if(impact>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,224,117,${1-impact})`;ctx.lineWidth=20*(1-impact)+3;ctx.shadowColor='#ff1d2f';ctx.shadowBlur=40;ctx.beginPath();ctx.arc(logoEnd.x,logoEnd.y,35+impact*220,0,Math.PI*2);ctx.stroke();ctx.fillStyle=`rgba(255,255,255,${(1-impact)*.78})`;ctx.beginPath();ctx.arc(logoEnd.x,logoEnd.y,125*(1-impact),0,Math.PI*2);ctx.fill();ctx.restore();}
    ctx.restore();
  }

  function drawShockSpecial(){
    const t=superSpecial.t,arrival=clamp01((t-.08)/1.05),landing=clamp01((t-1.1)/.65),beamIn=clamp01((t-2.08)/.32),beamOut=clamp01((3.22-t)/.28),exit=clamp01((t-3.55)/.62);
    const spriteW=120,spriteH=180,landX=player.x+player.w+28,landY=GROUND-spriteH;
    const targetX=boss.x+boss.w*.45,targetY=boss.y+boss.h*.48,arrivalEase=1-Math.pow(1-arrival,3);
    ctx.save();ctx.fillStyle=`rgba(1,6,18,${.3+.44*clamp01(t/.4)})`;ctx.fillRect(0,0,W,H);ctx.fillStyle=`rgba(22,93,190,${.08+.08*Math.sin(t*14)})`;ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';ctx.fillStyle='#e9f7ff';ctx.shadowColor='#43b8ff';ctx.shadowBlur=24;ctx.font='1000 34px Segoe UI';ctx.fillText('Meu herói',W*.49,105);ctx.fillStyle='#ffd86c';ctx.font='1000 15px Segoe UI';ctx.fillText('SUPER SHOCK',W*.49,132);

    let sx,sy,frame,alpha=1;
    if(t<1.1){sx=landX+68*(1-arrivalEase);sy=145+(landY-145)*arrivalEase-28*Math.sin(arrival*Math.PI);frame=0;}
    else if(t<1.75){sx=landX;sy=landY-48*(1-landing);frame=1;}
    else if(t<3.3){sx=landX;sy=landY;frame=2;}
    else{sx=landX;sy=landY;frame=3;alpha=1-exit*.86;}

    const bodyX=sx+spriteW*.5,bodyY=sy+spriteH*.55,flightPower=t<1.25?.95:clamp01((3.45-t)/2.1)*.72;
    for(let i=0;i<6;i++){
      const ang=i*Math.PI*2/6+t*1.25,r=50+26*Math.sin(t*9+i);
      drawEnergyBolt(bodyX,bodyY,bodyX+Math.cos(ang)*r,bodyY+Math.sin(ang)*r,'#35baff',flightPower,2.4,i+4);
    }
    if(t<1.18){
      for(let i=0;i<5;i++)drawEnergyBolt(sx-15-i*18,sy+72+i*7,sx+spriteW*.45,sy+spriteH*.52,i%2?'#8edfff':'#257dff',.82,4-i*.42,i+12);
    }

    if(t>=1.1&&t<1.92){
      const ring=clamp01((t-1.22)/.52);ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(70,190,255,${1-ring})`;ctx.lineWidth=10*(1-ring)+2;ctx.shadowColor='#3cbcff';ctx.shadowBlur=34;ctx.beginPath();ctx.ellipse(landX+spriteW*.5,GROUND-8,20+ring*105,7+ring*22,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      drawEnergyBolt(player.x+player.w*.72,player.y+34,landX+spriteW*.22,GROUND-55,'#5bc8ff',(1-ring)*.72,3,22);
    }

    drawShockSprite(frame,sx,sy,spriteW,spriteH,false,alpha);

    const beamPower=beamIn*beamOut;
    if(beamPower>0){
      const palmX=sx+spriteW*.98,palmY=sy+spriteH*.38;
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(122,220,255,${.4*beamPower})`;ctx.shadowColor='#3ebeff';ctx.shadowBlur=45;ctx.beginPath();ctx.arc(palmX,palmY,18+8*Math.sin(t*28),0,Math.PI*2);ctx.fill();ctx.restore();
      drawEnergyBolt(palmX,palmY,targetX,targetY,'#1679ff',beamPower,22,31);
      drawEnergyBolt(palmX,palmY,targetX,targetY,'#53c8ff',beamPower,11,32);
      drawEnergyBolt(palmX,palmY,targetX,targetY,'#ffffff',beamPower*.92,4,33);
      for(let i=0;i<4;i++){const side=(i%2?1:-1),offset=24+i*9;drawEnergyBolt(palmX+80+i*45,palmY,targetX-35,targetY+side*offset,'#2ea9ff',beamPower*.52,2.2,i+35);}
      const pulse=.65+.35*Math.sin(t*26);ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(120,224,255,${beamPower*.38*pulse})`;ctx.shadowColor='#43c8ff';ctx.shadowBlur=55;ctx.beginPath();ctx.arc(targetX,targetY,48+20*pulse,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(255,255,255,${beamPower*.8})`;ctx.lineWidth=7;ctx.beginPath();ctx.arc(targetX,targetY,32+12*pulse,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    ctx.restore();
  }

  function drawSuperSpecial(){
    if(!superSpecial.active)return;
    if(superSpecial.type==='shock')drawShockSpecial();else drawLogoSpecial();
  }

  function drawBoss(){
    drawOfficeBackdrop(900);ctx.fillStyle='#09030766';ctx.fillRect(0,0,W,GROUND);drawGround(0);
    bossHazards.forEach(drawBossContract);shots.forEach(drawWeaponShot);drawBossSprite();drawParticles();drawPlayer();drawStampSpecial();drawSuperSpecial();drawHUD();
  }

  function drawMenuScene(){
    drawOfficeBackdrop(0);drawGround(0);ctx.fillStyle='#05070a99';ctx.fillRect(0,0,W,H);
    if(images.enemyKeyed){ctx.globalAlpha=.55;ctx.drawImage(images.enemyKeyed,0,35,362,410,75,270,230,260);ctx.globalAlpha=1;}
    if(images.boss){const sw=images.boss.width/4,sh=images.boss.height/2;ctx.globalAlpha=.65;ctx.drawImage(images.boss,0,0,sw,sh,960,285,280,240);ctx.globalAlpha=1;}
  }

  function drawIntroStoryScene(stepIndex){
    drawOfficeBackdrop(0);drawGround(0);
    const shade=ctx.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#07101a40');shade.addColorStop(1,'#030508a8');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
    const tati=characters.find(ch=>ch.name==='Tati');
    drawCharacterWorld(tati,105,365,160,225,stepIndex===1||stepIndex===4?3:0,false,1);
    drawShockSprite(0,360,140,320,185,false,1);
    drawCharacterWorld(characters[selected],475,350,175,240,stepIndex>=5?3:0,false,1);
    if(images.enemyKeyed){
      ctx.save();ctx.globalAlpha=.86;ctx.shadowColor='#ee1d2d';ctx.shadowBlur=25;ctx.drawImage(images.enemyKeyed,0,35,362,410,940,315,205,230);ctx.restore();
    }
    if(images.documents){
      const docs=[[770,115,-.18],[890,170,.2],[1060,100,-.12]];
      docs.forEach(([x,y,r],i)=>{ctx.save();ctx.translate(x,y);ctx.rotate(r);ctx.globalAlpha=.82;ctx.drawImage(images.documents,0,0,241,285,-34,-45,68,90);ctx.restore();});
    }
    ctx.fillStyle='#070a10b8';roundRect(72,78,510,82,18,true);ctx.strokeStyle='#ffbd4266';ctx.lineWidth=2;roundRect(72,78,510,82,18,false,true);
    ctx.fillStyle='#ffdc93';ctx.font='1000 15px Segoe UI';ctx.fillText('EXCELÊNCIA MEDIAÇÕES',96,107);ctx.fillStyle='#fff';ctx.font='900 27px Segoe UI';ctx.fillText('A AMEAÇA DOS JUROS',96,141);
  }

  function drawBossStoryScene(){
    drawOfficeBackdrop(900);ctx.fillStyle='#09030778';ctx.fillRect(0,0,W,GROUND);drawGround(0);
    if(player){const previousMode=gameMode;gameMode='boss';drawPlayer();gameMode=previousMode;}
    drawBossSprite();
    ctx.fillStyle='#1503074d';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#090c11d9';roundRect(390,72,500,72,18,true);ctx.strokeStyle='#ef2633';ctx.lineWidth=2;roundRect(390,72,500,72,18,false,true);
    ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='1000 30px Segoe UI';ctx.fillText('ENCONTRO COM O BANK',640,116);ctx.textAlign='left';
  }

  function drawEndingTeam(){
    characters.forEach((ch,i)=>{
      const back=i<13,row=i<13?i:i-13,count=i<13?13:12,w=i<13?54:58,h=i<13?75:80;
      const x=(i<13?18:38)+row*(i<13?59:64),baseY=i<13?455:535;
      drawCharacterWorld(ch,x,baseY-h,w,h,3,false,i<13?.82:.95);
    });
    drawShockSprite(0,500,175,280,185,false,1);
  }

  function drawNovoCarne(){
    ctx.save();ctx.translate(640,220);ctx.rotate(-.035);ctx.shadowColor='#ffbd42';ctx.shadowBlur=34;
    ctx.fillStyle='#fffaf0';roundRect(-155,-88,310,176,18,true);ctx.strokeStyle='#bd111c';ctx.lineWidth=7;roundRect(-155,-88,310,176,18,false,true);
    ctx.fillStyle='#bd111c';ctx.fillRect(-155,-88,310,38);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='1000 16px Segoe UI';ctx.fillText('EXCELÊNCIA MEDIAÇÕES',0,-62);
    ctx.fillStyle='#171b22';ctx.font='1000 35px Segoe UI';ctx.fillText('NOVO CARNÊ',0,12);
    ctx.fillStyle='#8d1720';ctx.font='800 14px Segoe UI';ctx.fillText('DOCUMENTO RECUPERADO',0,48);
    ctx.fillStyle='#d51c28';ctx.beginPath();ctx.arc(0,70,10,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  function drawEndingStoryScene(stepIndex){
    drawOfficeBackdrop(900);drawGround(0);ctx.fillStyle='#02050a76';ctx.fillRect(0,0,W,H);
    if(stepIndex>=4)drawEndingTeam();
    drawCharacterWorld(characters[selected],145,345,175,245,stepIndex>=6?3:0,false,1);
    if(images.boss){
      const sw=images.boss.width/4,sh=images.boss.height/2;
      ctx.save();ctx.globalAlpha=.94;ctx.shadowColor='#ffbd42';ctx.shadowBlur=stepIndex>=7?24:4;
      ctx.drawImage(images.boss,3*sw,sh,sw,sh,900,340,285,245);ctx.restore();
    }
    if(stepIndex>=7)drawNovoCarne();
    ctx.fillStyle='#090c11d9';roundRect(420,70,440,67,18,true);ctx.strokeStyle='#ffbd42';ctx.lineWidth=2;roundRect(420,70,440,67,18,false,true);
    ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='1000 29px Segoe UI';ctx.fillText('O ÚLTIMO ACORDO',640,112);ctx.textAlign='left';
  }

  function drawStoryBackdrop(scene,stepIndex){
    ctx.save();
    if(scene==='intro')drawIntroStoryScene(stepIndex);
    else if(scene==='boss')drawBossStoryScene(stepIndex);
    else drawEndingStoryScene(stepIndex);
    ctx.restore();
  }

  function draw(){
    ctx.save();if(screenShake>0)ctx.translate((Math.random()-.5)*screenShake,(Math.random()-.5)*screenShake);
    if(gameMode==='stage')drawStage();else if(gameMode==='boss')drawBoss();else if(gameMode==='ending')drawEndingStoryScene(dialogueState.index);else drawMenuScene();ctx.restore();
  }

  function loop(t){
    if(!running)return;const dt=Math.min(.033,(t-lastTime)/1000||0);lastTime=t;
    if(!paused){if(gameMode==='stage')updateStage(dt);else if(gameMode==='boss')updateBoss(dt);draw();}
    raf=requestAnimationFrame(loop);
  }

  function togglePause(force){
    if(!running)return;paused=force??!paused;showScreen(paused?'pause':null);window.__GAME_STATE=paused?'paused':gameMode;
  }

  window.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();
    if(k==='m'){e.preventDefault();setSoundEnabled(!soundEnabled);return;}
    if(dialogueState.active){
      if(k==='enter'||k===' '){e.preventDefault();advanceDialogue();}
      else if(k==='escape'){e.preventDefault();completeDialogue();}
      return;
    }
    if(['arrowleft','arrowright','arrowup',' '].includes(k))e.preventDefault();
    if(k==='a'||k==='arrowleft')keys.left=true;if(k==='d'||k==='arrowright')keys.right=true;
    if(k==='w'||k==='arrowup'||k===' ')jump();if(k==='j')shoot('pen');if(k==='k')shoot('clip');if(k==='q')triggerStampSpecial('throw');if(k==='e')triggerStampSpecial('absorb');if(k==='z')triggerSuperSpecial('logo');if(k==='x')triggerSuperSpecial('shock');if(k==='escape')togglePause();
  },{passive:false});
  window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='a'||k==='arrowleft')keys.left=false;if(k==='d'||k==='arrowright')keys.right=false;});
  window.addEventListener('blur',()=>{keys.left=keys.right=false;if(running&&!paused)togglePause(true);});

  document.querySelectorAll('[data-key]').forEach(btn=>{
    const action=btn.dataset.key;const down=e=>{e.preventDefault();if(action==='left')keys.left=true;else if(action==='right')keys.right=true;else if(action==='jump')jump();else if(action==='stampThrow')triggerStampSpecial('throw');else if(action==='stampAbsorb')triggerStampSpecial('absorb');else shoot(action);};
    const up=e=>{e.preventDefault();if(action==='left')keys.left=false;if(action==='right')keys.right=false;};
    btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up);
  });

  $('playBtn').onclick=()=>{setDifficulty('normal');initAudio();setMusic('menu');showScreen('how');};
  $('excelencerBtn').onclick=()=>{setDifficulty('excelencer');initAudio();setMusic('menu');showScreen('how');};
  $('soundToggleMenu').onclick=()=>setSoundEnabled(!soundEnabled);
  $('soundTogglePause').onclick=()=>setSoundEnabled(!soundEnabled);
  $('howBtn').onclick=()=>{initAudio();setMusic('menu');showScreen('how');};
  $('howContinue').onclick=()=>{renderCharacterGrid();showScreen('select');};
  document.querySelectorAll('.backMenu').forEach(b=>b.onclick=()=>{gameMode='menu';drawMenuScene();setMusic('menu');showScreen('menu');});
  $('prevBtn').onclick=()=>{selectPage--;renderCharacterGrid();};
  $('nextBtn').onclick=()=>{selectPage++;renderCharacterGrid();};
  $('startBtn').onclick=()=>{$('retryBtn').textContent='JOGAR NOVAMENTE';initAudio();setMusic('story');gameMode='menu';drawMenuScene();startDialogue('intro',buildStage);};
  $('dialogueNext').onclick=()=>advanceDialogue();
  $('dialogueSkip').onclick=()=>completeDialogue();
  $('resumeBtn').onclick=()=>togglePause(false);
  $('retryBtn').onclick=()=>buildStage();
  $('changeBtn').onclick=()=>{$('retryBtn').textContent='JOGAR NOVAMENTE';selectPage=Math.floor(selected/8);renderCharacterGrid();setMusic('menu');showScreen('select');};

  window.__GAME_BOOT_OK=true;
  window.__ASSETS_READY=false;
  window.__CHARACTER_COUNT=characters.length;
  window.__GAME_STATE='loading';
  window.__STAMP_COUNT=stampCount;
  window.__STAMP_TOTAL=totalStamps;
  window.__STAMP_SPECIAL_ACTIVE=false;
  window.__STAMP_SPECIAL_BUFF=false;
  window.__STAMP_SPECIAL_DAMAGE=0;
  window.__PLAYER_SPEED_MULTIPLIER=1;
  window.__PEN_RATE_MULTIPLIER=1;
  initializeSound();
  setDifficulty('normal');
  loadAll().catch(err=>{console.error(err);$('loadText').textContent='Falha ao preparar o jogo.';});
})();
