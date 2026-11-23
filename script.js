/* Pure growth/reward functions are shared by the page and the Node verification script. */
const STORAGE_KEY = 'myHappinessTrackerV1';
const MOODS = ['Happy', 'Grateful', 'Calm', 'Excited', 'Neutral'];
// Explicitly curated vocabulary: variations are listed, never guessed from arbitrary input.
const POSITIVE = new Set(`happy happiness joy joyful grateful gratitude thankful warm peaceful peace calm excited love loved lovely kind kindness hope hopeful positive smile smiling wonderful beautiful amazing proud confident relaxed blessed cheerful good great awesome fun friendship comfort safe motivated inspired healthy patient courage brave gentle delight sunshine laughter generous caring serene content optimistic supported together creative gratefulness

ability able ably abound abundance abundant abundantly accept acceptance accepted accepting accessible acclaim acclaimed accomplish accomplished accomplishment accomplishments achieve achieved achievement achievements achieving active actively adaptable adaptation adept admirable admirably admiration admire admired admiring adorable adore adored adoring adventurous adventure adventures affectionate affection affirm affirmation affirmations affirmative affirmed agile agility agreeable agreeably aid aided aiding alive alleviate alleviated alluring ally allies altruism altruistic amaze amazed amazement amazingly ambition ambitious amenable amiable amicable ample amusing amusement amuse amused angel angelic applaud applauded applause appeal appealing appreciate appreciated appreciates appreciating appreciation appreciative approachable approval approve approved ardent ardently aspire aspiration aspirations aspiring assurance assure assured assuring astonish astonished astonishing astound astounding attentive attentiveness attractive authentic authenticity autonomy available avid award awarded awards awe awed awesome awesomeness balance balanced balm beaming beauty beautify beautifully beloved beneficial benefit benefited benefits benevolence benevolent best better bliss blissful blissfully bloom bloomed blooming blooms blossom blossomed blossoming blossoms bold boldly boldness bonny boost boosted bountiful bounty bravery bravely breathtaking bright brighten brightened brightening brighter brightest brightly brightness brilliant brilliance brilliantly brisk brotherhood bubbly buoyant buoyancy capable capability captivating care cared careful carefully carefree caress caring celebrate celebrated celebrates celebrating celebration celebrations centered champion champions charm charmed charming charitably charitable charity cherish cherished cherishes cherishing chic clarity clean cleaner cleanest clear clearly clearness clever cleverness cleverly close closeness colorful colour colorful colors colourful comfy comforting comforted comforts comfortable comfortably commitment committed companion companionship compassion compassionate compassionately competent competence complete completed completeness compliment compliments complimented composure concord confidence confidently congratulate congratulated congratulation congratulations conscientious considerate consideration consistently consistency constructive contented contentment contribute contributed contribution contributions cooperation cooperative cordial courageously courageous courtesy courteous coziness cozy cosy creativity creatively creator cuddle cuddled cuddles cuddling cultured cure cured curiosity curious cute cuteness darling dazzle dazzled dazzling dear dearly decency decent dedicated dedication delectable delicious delight delighted delightful delightfully delights dependable dependability deserving desirable determined determination develop developed development devoted devotion dignity diligent diligence diligently discovery discover discovered discovering dream dreams dreamed dreaming dreamy durable dynamic eager eagerly eagerness ease eased easing easy easier easiest easygoing educate educated education effective effectiveness efficiently efficient effort effortless elegantly elegant elegance embrace embraced embraces embracing empathy empathetic empower empowered empowering empowerment enchant enchanted enchanting enchantment encourage encouraged encouragement encouraging endear endearing endless energetic energy energize energized energizing engage engaged engaging enjoy enjoyed enjoying enjoyable enjoyment enjoys enlighten enlightened enlightening enlightenment enrich enriched enriching enrichment enthusiasm enthusiastic enthusiastically entire entrust entrusted equality equal equitable essential esteem esteemed ethical ethics excel excelled excellence excellent excellently exceptional exceptionally excite excitement exciting exquisite extraordinary exuberance exuberant fabulous fabulously fair fairness fairly faithful faithfully faith fame famous fantastic fantastically fascinating fascination fascinate fascinated favorite favourite favorites favourites fearless fearlessly fearlessness feast festive festival fidelity fine finely fitness fit flourish flourished flourishing flourishes flow flowing fond fondly fondness forgive forgiven forgiving forgiveness fortitude fortunate fortunately fortune forward foster freedom free freely fresh fresher freshness friendly friendliness friends friend fruitful fulfilled fulfilling fulfillment fulfilment fulfill fulfilled fully funnier funniest funny future gaiety gain gained gains gallant generosity generously genial genius genuine genuinely gifted gifts gift giving gladly glad gladness gleam gleaming glee gleeful glitter glittering glow glowing golden goodness goodwill gorgeous gorgeously grace graceful gracefully gracious graciously grandeur grand greatness greener green growth grow growing grown greet greeting greetings grounded guidance guide guided gusto gutsy hale handsomely handsome handy happily happier happiest harmonious harmony harmonize healing heal healed health healthful healthier healthiest heartening heartfelt heartwarming heavenly heaven help helped helpful helping hero heroes heroic hilarious hilarity holistic honest honestly honesty honor honoured honored honour honorable honourable hospitality hospitable hug hugs hugged hugging humanity humane humble humility humor humour humorous ideal ideally illuminate illuminated illuminating illumination imaginative imagination imagine immaculate impressive impress impresses impressed improve improved improvement improvements improving inclusion inclusive inclusivity incredible incredibly independence independent ingenuity ingenious initiative innovation innovative inspire inspires inspiring inspiration inspirational integrity intelligent intelligence intuitive intuition invigorate invigorated invigorating invitation inviting invaluable inventive invincible irresistible jubilant jubilation joyous joyfully jovial jubilantly justice just kindnesses kindly knowledgeable knowledge laugh laughed laughing laughs learn learned learning liberty liberating liberation light lighten lightened lighter lighthearted lively liveliness livelihood lovable loving lovingly loyal loyalty lucid luck lucky luckily luscious luminous luxuriant luxury magical magic magnificence magnificent magnificently majestic marvel marvelous marvellous master mastery mature maturity meaningful meaning meditate meditation meditative mellow merciful mercy merit merry merriment mindful mindfully mindfulness miraculous miracle miracles mirth modest modesty motivate motivating motivation motivational mutual natural naturally neat nicely nice nicer nicest nimble noble nourish nourished nourishing nourishment nurture nurtured nurturing oasis open openhearted openness opportunity opportunities optimal optimum optimism optimistically original originality outstanding overcome overcame overcoming paradise patience patiently passion passionate passionately peacefully peaceable peacemaker peachy perfect perfection perfectly perseverance persevere persevered persistent persistence playful playfully playfulness pleasant pleasantly pleased pleasing pleasure plentiful plenty poise poised positively positivity possibility possibilities potential powerful praise praised praises praising precious precision prepared presence present prestige prestigious pretty prettiest prettier priceless privilege privileged proactive productive productivity proficient proficiency progress progressed progressing progressive promising prosper prospered prosperity prosperous protect protected protecting protection protective proudly prowess prudent prudence purity pure purpose purposeful quality radiant radiance radiate radiating rapture rapturous ready readiness reassure reassured reassuring reassurance receptive recognition recognize recognized reconcile reconciliation reconnect reconnected recovery recover recovered recovering refresh refreshed refreshing refuge rejuvenate rejuvenated rejuvenating rejoice rejoiced rejoicing relationship relationships reliable reliability relief relieved relieve relieving remarkable remarkably renewal renew renewed renewing resilient resilience resolute resolution resourceful resourcefulness respect respected respectful respectfully restore restored restoring restorative rest rested restful reward rewarded rewarding richness rich right righteous righteousness robust romance romantic rosy sacred safeguard safety saintly satisfy satisfied satisfying satisfaction savor savored savour savoured scrumptious secure secured securely security selfless selflessness sensitivity sensitive sensational sense sensible serenity serenely service share shared shares sharing shimmer shimmering shine shines shining sincere sincerely sincerity skill skilled skillful skilfully skillfully smart smarter smartest smoothly smooth snuggle snug solace solidarity soothe soothed soothing soulful soul sparkle sparkled sparkles sparkling special spectacular splendid splendidly splendor splendour spontaneous spontaneity spotlessly spotless stability stable steadfast steadiness steady strength strengths strengthen strengthened strong stronger strongest successfully successful success succeed succeeded succeeding sunny super superb superbly superior supportive support supports supporting supreme surprise surprised surprising sustainability sustainable sweet sweeter sweetest sweetness sweetness tender tenderly tenderness terrific thankfully thank thanks thanked thanking thoughtful thoughtfully thoughtfulness thrive thrived thrives thriving thrill thrilled thrilling thrills togetherness tolerant tolerance tranquility tranquillity tranquil treasure treasured treasures treat treats triumph triumphant trust trusted trusting trustworthy truth truthful truthfully understanding understand understood unity unique uplift uplifted uplifting upliftment upbeat useful usefulness valuable value valued values valor valour vibrant vibrancy victory victories victorious vigor vigour vigorous vitality vivacious vivid volunteer volunteering volunteers voluntary warmth warmly welcome welcomed welcoming well wellness wellspring wholehearted wholesome willing willingness win winner winners winning wins wisdom wise wisely witty wit wonder wonders wondrous wonderfully worthy worthiness worth worthwhile wow zest zestful zesty zing
`.trim().split(/\s+/));
const STAGES = ['Seed', 'Little Sprout', 'Growing Plant', 'Young Tree', 'Fully Grown Happiness Tree'];
const STAGE_RATIOS = [0, 53/350, 140/350, 245/350, 1];
function localDateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function monthKey(date=localDateKey()) { return date.slice(0,7); }
function validMonth(value) { return typeof value==='string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value); }
function monthlyTarget(month) {
  const [year,number]=month.split('-').map(Number);
  return new Date(year,number,0,12).getDate()*15;
}
function monthLabel(month) { return new Date(month+'-01T12:00:00').toLocaleDateString(undefined,{month:'long',year:'numeric'}); }
function newMonthlyTree(month) { return {month,hp:0,target:monthlyTarget(month),startDate:month+'-01',completedDate:null}; }
function defaultState(date=localDateKey()) {
  const month=monthKey(date);
  return {version:4,hp:0,treeId:1,startDate:month+'-01',activeMonth:month,
    monthlyTrees:{[month]:newMonthlyTree(month)},entries:[],completedTrees:[],rewardedWords:[],
    rewardedWordsByDate:{},rewardedDates:[],moodRewardedDates:[]};
}
function ensureMonthlyTree(state,date=localDateKey()) {
  const month=monthKey(date);const changed=state.activeMonth!==month || !state.monthlyTrees[month];
  if(!state.monthlyTrees[month]) state.monthlyTrees[month]=newMonthlyTree(month);
  state.activeMonth=month;state.hp=state.monthlyTrees[month].hp;state.startDate=state.monthlyTrees[month].startDate;
  return changed;
}
function getStageIndex(hp,target=monthlyTarget(monthKey())) { return STAGE_RATIOS.reduce((stage,ratio,i)=>hp>=Math.ceil(target*ratio)?i:stage,0); }
function tokenizeWords(text) { return [...new Set((text.toLowerCase().match(/\p{L}+/gu)||[]))]; }
function extractPositiveWords(text) { return tokenizeWords(text).filter(word=>POSITIVE.has(word)); }
function analyzeWords(state,text,date=localDateKey()) {
  const tokens=tokenizeWords(text),used=new Set(state.rewardedWordsByDate[date]||[]);
  return {newWords:tokens.filter(w=>POSITIVE.has(w)&&!used.has(w)),usedWords:tokens.filter(w=>POSITIVE.has(w)&&used.has(w)),unrecognizedWords:tokens.filter(w=>!POSITIVE.has(w))};
}
function validDate(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const date=new Date(value+'T12:00:00');return !isNaN(date)&&localDateKey(date)===value;
}
function validateState(saved,date=localDateKey()) {
  if(!saved||typeof saved!=='object')return defaultState(date);
  // Retain legacy fields and historical records rather than rewriting their earned points.
  const clean={...saved,...defaultState(date)};
  clean.entries=Array.isArray(saved.entries)?saved.entries.filter(e=>e&&validDate(e.date)&&typeof e.journal==='string'&&(typeof e.mood==='string'&&e.mood.trim().length>0)&&Number.isFinite(e.points)).map(e=>({...e,words:typeof e.words==='string'?e.words:'',time:typeof e.time==='string'?e.time:''})):[];
  clean.completedTrees=Array.isArray(saved.completedTrees)?saved.completedTrees.filter(t=>t&&validDate(t.completedDate)&&Number.isFinite(t.hp)).map(t=>({...t})):[];
  clean.treeId=Number.isInteger(saved.treeId)&&saved.treeId>0?saved.treeId:clean.completedTrees.length+1;
  clean.rewardedWords=Array.isArray(saved.rewardedWords)?saved.rewardedWords.filter(w=>typeof w==='string'):[];
  clean.rewardedDates=Array.isArray(saved.rewardedDates)?saved.rewardedDates.filter(validDate):[];
  clean.moodRewardedDates=Array.isArray(saved.moodRewardedDates)?saved.moodRewardedDates.filter(validDate):[];
  clean.entries.forEach(e=>{
    if(e.journal.trim()&&!clean.rewardedDates.includes(e.date))clean.rewardedDates.push(e.date);
    if(e.moodBonus&&!clean.moodRewardedDates.includes(e.date))clean.moodRewardedDates.push(e.date);
  });
  if(saved.rewardedWordsByDate&&typeof saved.rewardedWordsByDate==='object')Object.entries(saved.rewardedWordsByDate).forEach(([day,words])=>{
    if(validDate(day)&&Array.isArray(words))clean.rewardedWordsByDate[day]=[...new Set(words.filter(w=>typeof w==='string').flatMap(tokenizeWords))];
  });
  if(saved.version!==4)clean.entries.forEach(e=>{
    clean.rewardedWordsByDate[e.date]=[...new Set([...(clean.rewardedWordsByDate[e.date]||[]),...extractPositiveWords(e.words+' '+e.journal)])];
  });
  clean.monthlyTrees={};
  if(saved.version===4 && saved.monthlyTrees && typeof saved.monthlyTrees==='object') {
    Object.entries(saved.monthlyTrees).forEach(([month,tree])=>{
      if(!validMonth(month)||!tree||!Number.isFinite(tree.hp))return;
      const target=monthlyTarget(month),hp=Math.min(target,Math.max(0,tree.hp));
      clean.monthlyTrees[month]={...tree,month,target,hp,startDate:validDate(tree.startDate)?tree.startDate:month+'-01',completedDate:validDate(tree.completedDate)?tree.completedDate:null};
    });
  }else {
    // Preserve the indivisible old tree's balance once, in its latest active month.
    // Do not sum historical entry rewards or completed trees into that balance again.
    const activeEntries=clean.entries.filter(e=>!e.treeId||e.treeId===clean.treeId);
    const latest=activeEntries.map(e=>e.date).sort().at(-1);
    const sourceDate=latest||(validDate(saved.startDate)?saved.startDate:date);
    const month=monthKey(sourceDate);
    const alreadyArchived=clean.completedTrees.some(t=>t.id===clean.treeId&&t.hp===saved.hp);
    const hp=!alreadyArchived&&Number.isFinite(saved.hp)?Math.max(0,saved.hp):0;
    clean.monthlyTrees[month]={...newMonthlyTree(month),hp:Math.min(monthlyTarget(month),hp),migratedFromLegacy:true};
    clean.legacyProgress={hp:saved.hp,treeId:saved.treeId,startDate:saved.startDate,alreadyArchived};
  }
  ensureMonthlyTree(clean,date);
  Object.values(clean.monthlyTrees).forEach(tree=>{
    if(tree.hp>=tree.target&&!tree.completedDate)tree.completedDate=tree.month===monthKey(date)?date:tree.month+'-'+String(tree.target/15).padStart(2,'0');
  });
  return clean;
}
function readBackup(text) {
  const backup=JSON.parse(text),saved=backup?.state;
  if(backup?.format!=='my-happiness-tracker'||backup.version!==1||saved?.version!==4||
     !Array.isArray(saved.entries)||!Array.isArray(saved.completedTrees)||
     !Array.isArray(saved.rewardedDates)||!saved.rewardedDates.every(validDate)||
     !Array.isArray(saved.moodRewardedDates)||!saved.moodRewardedDates.every(validDate)||
     !saved.rewardedWordsByDate||typeof saved.rewardedWordsByDate!=='object'||Array.isArray(saved.rewardedWordsByDate)||
     !Object.entries(saved.rewardedWordsByDate).every(([day,words])=>validDate(day)&&Array.isArray(words)&&words.every(word=>typeof word==='string'))||
     !saved.monthlyTrees||!validMonth(saved.activeMonth)||!saved.monthlyTrees[saved.activeMonth]||
     !Object.entries(saved.monthlyTrees).every(([month,tree])=>validMonth(month)&&tree&&Number.isFinite(tree.hp)&&tree.hp>=0&&tree.hp<=monthlyTarget(month))) {
    throw new Error('Choose a valid My Happiness Tracker backup file.');
  }
  const restored=validateState(saved);
  if(restored.entries.length!==saved.entries.length||restored.completedTrees.length!==saved.completedTrees.length) {
    throw new Error('The backup contains invalid journal or tree records.');
  }
  return restored;
}
function calculatePoints(state,input,date) {
  const journal=input.journal.trim(),month=monthKey(date),tree=state.monthlyTrees[month]||newMonthlyTree(month);
  const today=state.entries.filter(e=>e.date===date),reasons=[];
  const moodBonus=!state.moodRewardedDates.includes(date)&&!today.some(e=>e.moodBonus);
  const reflectionBonus=!!journal&&!state.rewardedDates.includes(date)&&!today.some(e=>e.journal.trim());
  if(moodBonus)reasons.push({label:'Daily mood check-in',points:5});
  if(reflectionBonus)reasons.push({label:'First daily reflection',points:10});
  const wordAnalysis=analyzeWords(state,journal,date);
  if(wordAnalysis.newWords.length)reasons.push({label:'Positive words',points:wordAnalysis.newWords.length*5});
  const memoryBonus=!!input.memory&&journal.length>=30&&!today.some(e=>e.memoryBonus);
  const gratitudeBonus=!!journal&&(input.gratitude||input.mood==='Grateful'||/\b(grateful|thankful|gratitude|appreciate)\b/i.test(journal))&&!today.some(e=>e.gratitudeBonus);
  if(memoryBonus)reasons.push({label:'Happy memory',points:10});
  if(gratitudeBonus)reasons.push({label:'Gratitude reflection',points:10});
  let remaining=Math.max(0,tree.target-tree.hp);
  const awarded=reasons.map(reason=>{const points=Math.min(reason.points,remaining);remaining-=points;return {...reason,points};});
  return {points:awarded.reduce((sum,r)=>sum+r.points,0),reasons:awarded,...wordAnalysis,moodBonus,reflectionBonus,memoryBonus,gratitudeBonus};
}
function addReflection(state,input,date=localDateKey(),time=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})) {
  if(!MOODS.includes(input.mood))return {error:'Choose a mood to check in with yourself.'};
  if(input.memory&&input.journal.trim().length<30)return {error:'Give your happy memory a little more detail (at least 30 characters).'};
  ensureMonthlyTree(state,date);
  const result=calculatePoints(state,input,date),tree=state.monthlyTrees[monthKey(date)];
  state.entries.unshift({id:`${Date.now()}-${Math.random().toString(36).slice(2)}`,date,time,mood:input.mood,words:'',journal:input.journal.trim(),points:result.points,treeId:state.treeId,monthId:monthKey(date),moodBonus:result.moodBonus,reflectionBonus:result.reflectionBonus,memoryBonus:result.memoryBonus,gratitudeBonus:result.gratitudeBonus});
  tree.hp+=result.points;state.hp=tree.hp;
  if(tree.hp===tree.target&&!tree.completedDate)tree.completedDate=date;
  state.rewardedWordsByDate[date]=[...new Set([...(state.rewardedWordsByDate[date]||[]),...result.newWords])];
  if(result.reflectionBonus&&!state.rewardedDates.includes(date))state.rewardedDates.push(date);
  if(result.moodBonus&&!state.moodRewardedDates.includes(date))state.moodRewardedDates.push(date);
  return result;
}
function treeSVG(stage) {
  // Original storybook artwork only; growth thresholds and all reward logic are unchanged.
  const defs=`<defs><linearGradient id="leaf" x2="1" y2="1"><stop stop-color="#899481"/><stop offset=".45" stop-color="#6FAF73"/><stop offset="1" stop-color="#3E7655"/></linearGradient><linearGradient id="leaf-soft" x2="1" y2="1"><stop stop-color="#6FAF73"/><stop offset="1" stop-color="#899481"/></linearGradient><linearGradient id="bark" x2="1"><stop stop-color="#304F6D"/><stop offset="1" stop-color="#E07D54"/></linearGradient><radialGradient id="halo"><stop stop-color="#FFE1A0" stop-opacity=".7"/><stop offset="1" stop-color="#FFE1A0" stop-opacity="0"/></radialGradient></defs>`;
  const leaf=(x,y,angle,size=1)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${size})"><path d="M0 0Q-21-9-11-29Q8-24 0 0Z" fill="url(#${(x+y)%3===0?'leaf-soft':'leaf'})"/><path d="M0-2L-8-23" stroke="#3E7655" stroke-opacity=".5" stroke-width=".7"/></g>`;
  const bloom=(x,y,size=1)=>`<g class="flower" transform="translate(${x} ${y}) scale(${size})"><g fill="#E07D54"><ellipse cy="-5" rx="3.7" ry="5.5"/><ellipse cy="-5" rx="3.7" ry="5.5" transform="rotate(72)"/><ellipse cy="-5" rx="3.7" ry="5.5" transform="rotate(144)"/><ellipse cy="-5" rx="3.7" ry="5.5" transform="rotate(216)"/><ellipse cy="-5" rx="3.7" ry="5.5" transform="rotate(288)"/></g><circle r="2.6" fill="#FFE1A0"/></g>`;
  let plant='';
  if(stage===0) plant=`<ellipse cx="131" cy="194" rx="18" ry="7" fill="#304F6D" opacity=".15"/><path d="M130 193C110 190 111 169 131 160C151 171 148 190 130 193Z" fill="url(#bark)"/><path d="M130 185Q122 176 131 164" stroke="#FFE1A0" stroke-width="1.5" fill="none"/><path d="M122 163Q124 156 131 155" stroke="#899481" fill="none"/><path d="M142 162l2-5m-28 9-4-3" stroke="#E2F3FD" stroke-linecap="round"/>`;
  if(stage===1) plant=`<path d="M130 194Q122 166 132 143" stroke="#899481" stroke-width="4" fill="none" stroke-linecap="round"/>${leaf(128,169,-57,.85)}${leaf(130,154,58,.95)}<circle cx="133" cy="142" r="3" fill="#E07D54"/>`;
  if(stage===2) plant=`<path d="M131 194Q117 149 135 99" stroke="#899481" stroke-width="5" fill="none" stroke-linecap="round"/>${leaf(128,175,-62,1.05)}${leaf(128,157,55,1.1)}${leaf(128,137,-52,.95)}${leaf(132,118,54,.85)}${leaf(135,103,-10,.65)}${bloom(136,98,.55)}`;
  if(stage>=3){
    plant=`<path d="M114 196Q131 155 122 108L136 103Q131 157 148 196Z" fill="url(#bark)"/><path d="M129 166Q104 145 88 116M129 141Q155 126 170 95M127 119Q109 102 108 82M131 119Q142 93 141 65" fill="none" stroke="#304F6D" stroke-width="6" stroke-linecap="round"/><path d="M127 190Q135 162 130 127" stroke="#E07D54" stroke-width="1.4" fill="none"/>`;
    const leaves=[[89,122,-65,1.15],[96,132,65,1],[82,109,-52,1],[103,112,40,1.15],[108,95,-50,1.1],[116,105,38,1],[125,89,-25,1.12],[141,81,18,1.2],[150,100,63,1.2],[159,116,65,1.15],[170,101,38,1.1],[169,89,-20,1.1],[129,116,-42,1],[147,125,45,.9]];
    if(stage===4) leaves.push([70,104,-65,1.1],[82,85,-30,1.1],[101,74,-22,1.18],[121,62,-20,1.1],[139,60,15,1.1],[158,72,45,1.15],[181,88,55,1.1],[178,120,66,1.1],[109,136,-65,1.1]);
    plant+=leaves.map(l=>leaf(...l)).join('');
    plant+=stage===4?[[91,83,.7],[127,66,.75],[161,85,.75],[110,113,.7],[155,123,.7],[180,104,.6]].map(f=>bloom(...f)).join(''):bloom(143,84,.6);
    if(stage===4)plant+=`<g class="magic-dust" fill="#FFE1A0"><path d="M62 112l2-5 2 5 5 2-5 2-2 5-2-5-5-2Z"/><path d="M192 64l2-4 2 4 4 2-4 2-2 4-2-4-4-2Z"/><circle cx="77" cy="146" r="2"/><circle cx="182" cy="153" r="2"/><circle cx="121" cy="37" r="1.5"/></g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 230" aria-hidden="true">${defs}<ellipse cx="130" cy="126" rx="104" ry="108" fill="url(#halo)"/><ellipse cx="130" cy="199" rx="61" ry="10" fill="#899481" opacity=".35"/><path d="M83 196Q128 179 177 196" fill="#899481" opacity=".7"/>${plant}<g fill="#E07D54"><circle cx="98" cy="196" r="2"/><circle cx="165" cy="198" r="2"/></g><path d="M92 199q-5-11-9-10m79 10q5-13 11-12" stroke="#899481" stroke-width="1.5" fill="none"/></svg>`;
}
// Sort a copy so filtering and presentation never rewrite saved journal data.
function journalTime(entry) {
  const timestamp = Number(String(entry.id || '').split('-')[0]);
  const created = Number.isFinite(timestamp) && timestamp > 100000000000 ? new Date(timestamp) : null;
  const match = String(entry.time || '').match(/(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?\s*(AM|PM)?/i);
  if(!match) return created ? created.getHours()*3600+created.getMinutes()*60+created.getSeconds() : 0;
  let hour = Number(match[1]);
  if(match[4]) hour = hour % 12 + (match[4].toUpperCase() === 'PM' ? 12 : 0);
  return hour * 3600 + Number(match[2]) * 60 + Number(match[3] || 0);
}
function groupJournalEntries(entries, date = '') {
  const groups = new Map();
  entries.filter(entry => !date || entry.date === date)
    .sort((a,b) => b.date.localeCompare(a.date) || journalTime(b) - journalTime(a) || Number(String(b.id || '').split('-')[0]) - Number(String(a.id || '').split('-')[0]))
    .forEach(entry => {
      if(!groups.has(entry.date)) groups.set(entry.date, []);
      groups.get(entry.date).push(entry);
    });
  return [...groups].map(([date, entries]) => ({date, entries}));
}
const MOOD_EMOJIS={Happy:'\u{1F60A}',Grateful:'\u{1F970}',Calm:'\u{1F60C}',Excited:'\u{1F929}',Neutral:'\u{1F610}'};
// Read-only compatibility for archived moods; these are never offered for new check-ins.
const LEGACY_MOOD_EMOJIS={Sad:'\u{1F614}',Stressed:'\u{1F623}',Angry:'\u{1F620}',Difficult:'\u{1F614}'};
function moodEmoji(mood) { return MOOD_EMOJIS[mood] || LEGACY_MOOD_EMOJIS[mood] || MOOD_EMOJIS.Neutral; }
function calendarCells(year, month) {
  const first = new Date(year,month,1,12);
  const offset = (first.getDay()+6)%7;
  const days = new Date(year,month+1,0,12).getDate();
  const count = Math.ceil((offset+days)/7)*7;
  return Array.from({length:count},(_,index)=>{
    const day=index-offset+1;
    return day<1 || day>days ? null : localDateKey(new Date(year,month,day,12));
  });
}
if(typeof module!=='undefined') module.exports={defaultState,validateState,addReflection,calculatePoints,getStageIndex,treeSVG,localDateKey,POSITIVE,analyzeWords,tokenizeWords,groupJournalEntries,calendarCells,MOOD_EMOJIS,monthlyTarget,monthKey,ensureMonthlyTree,MOODS,moodEmoji};
if(typeof document!=='undefined') initApp();
function initApp() {
  const $=id=>document.getElementById(id);let storageWarning='';let state;let needsMigrationSave=false;let legacyBackupRaw=null;let offerRestore=false;
  try {const raw=localStorage.getItem(STORAGE_KEY);const saved=raw?JSON.parse(raw):null;state=validateState(saved);offerRestore=raw===null;needsMigrationSave=!!saved&&(saved.version!==4||saved.activeMonth!==state.activeMonth);if(saved&&saved.version!==4)legacyBackupRaw=raw;}catch(error){state=defaultState();storageWarning='Browser storage is unavailable or unreadable. Use Download backup to keep a copy of this session.';}
  let mood='';
  const persist=()=>{try{if(legacyBackupRaw&&!localStorage.getItem(STORAGE_KEY+'BeforeMonthlyV4'))localStorage.setItem(STORAGE_KEY+'BeforeMonthlyV4',legacyBackupRaw);localStorage.setItem(STORAGE_KEY,JSON.stringify(state));legacyBackupRaw=null;storageWarning='';return true;}catch(error){storageWarning='The browser could not save your changes. Use Download backup to keep a copy of this session.';return false;}};
  const node=(tag,text,className)=>{const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;};
  // This help dialog is presentation-only; legacy guide preferences remain untouched.
  const guideDialog=$('growthGuideDialog');
  const guideButton=$('openGrowthGuide');
  let guidePreviousOverflow='';
  guideButton.addEventListener('click',()=>{
    if(guideDialog.open) return;
    guidePreviousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    guideDialog.showModal();
    $('closeGrowthGuide').focus();
  });
  function closeGrowthGuide() { if(guideDialog.open) guideDialog.close(); }
  $('closeGrowthGuide').addEventListener('click',closeGrowthGuide);
  guideDialog.addEventListener('click',event=>{if(event.target===guideDialog) closeGrowthGuide();});
  guideDialog.addEventListener('cancel',event=>{event.preventDefault();closeGrowthGuide();});
  guideDialog.addEventListener('close',()=>{
    document.body.style.overflow=guidePreviousOverflow;
    guideButton.focus();
  });
  let calendarMonth = new Date(new Date().getFullYear(),new Date().getMonth(),1,12);
  let selectedDateButton = null;
  let previousOverflow = '';
  const dialog=$('journalDialog');
  const formatJournalDate=date=>new Date(date+'T12:00:00').toLocaleDateString(undefined,
    {weekday:'long',month:'long',day:'numeric',year:'numeric'});
  function addReflectionEditor(card,entry,reflection) {
    const edit=node('button','Edit reflection','quiet');
    edit.type='button';
    const form=node('form','','reflection-editor');
    const text=node('textarea','');
    text.setAttribute('aria-label','Reflection text');
    text.required=true;
    const save=node('button','Save changes','quiet');
    save.type='submit';
    const cancel=node('button','Cancel','quiet');
    cancel.type='button';
    const actions=node('div','','header-actions');
    actions.append(save,cancel);
    const feedback=node('p','','reflection-edit-feedback');
    feedback.setAttribute('role','status');
    form.append(text,actions);
    form.hidden=true;
    card.append(edit,form,feedback);

    function finishEdit() {
      form.hidden=true;
      edit.hidden=entry.date!==localDateKey();
      reflection.hidden=false;
      (edit.hidden?$('closeJournalDialog'):edit).focus();
    }
    edit.addEventListener('click',()=>{
      if(entry.date!==localDateKey()){
        finishEdit();
        feedback.textContent='Only today’s reflections can be edited.';
        return;
      }
      text.value=entry.journal;
      feedback.textContent='';
      reflection.hidden=true;
      edit.hidden=true;
      form.hidden=false;
      text.focus();
    });
    cancel.addEventListener('click',()=>{
      feedback.textContent='';
      finishEdit();
    });
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(entry.date!==localDateKey()){
        finishEdit();
        feedback.textContent='Only today’s reflections can be edited.';
        return;
      }
      const revised=text.value.trim();
      if(!revised){
        feedback.textContent='Enter some text to save your reflection.';
        text.focus();
        return;
      }
      const original=entry.journal;
      if(revised!==original){
        entry.journal=revised;
        if(!persist()){
          entry.journal=original;
          feedback.textContent='The browser could not save your edit. Your original reflection is unchanged.';
          return;
        }
        $('storageNotice').textContent='';
        reflection.textContent=[entry.journal,entry.words].filter(Boolean).join('\n\n');
        feedback.textContent='Reflection updated.';
      }
      finishEdit();
    });
  }
  function openJournal(date, button) {
    const group=groupJournalEntries(state.entries,date)[0];
    if(!group) return;
    selectedDateButton=button;
    $('journalDialogTitle').textContent=formatJournalDate(date);
    const container=$('journalDialogEntries');container.replaceChildren();
    group.entries.forEach(entry=>{
      const card=node('article','','calendar-reflection');
      const meta=node('div','','calendar-reflection-meta');
      const icon=node('span',moodEmoji(entry.mood),'calendar-reflection-emoji');icon.setAttribute('aria-hidden','true');
      meta.append(icon,node('strong',entry.mood),node('span',entry.time || 'Time not recorded','calendar-entry-time'),node('span',`${entry.points} HP earned when saved`,'calendar-entry-hp'));
      card.append(meta);
      // textContent keeps both current reflections and legacy word-only entries safe.
      const reflection=node('p',[entry.journal,entry.words].filter(Boolean).join('\n\n'),'calendar-reflection-text');
      card.append(reflection);
      if(entry.date===localDateKey()&&entry.journal.trim()) addReflectionEditor(card,entry,reflection);
      container.append(card);
    });
    previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    dialog.showModal();
    $('journalDialogEntries').scrollTop=0;
    $('closeJournalDialog').focus();
  }
  function closeJournal() { if(dialog.open) dialog.close(); }
  $('closeJournalDialog').addEventListener('click',closeJournal);
  dialog.addEventListener('click',event=>{if(event.target===dialog) closeJournal();});
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeJournal();});
  dialog.addEventListener('close',()=>{
    document.body.style.overflow=previousOverflow;
    if(selectedDateButton && selectedDateButton.isConnected) selectedDateButton.focus();
    selectedDateButton=null;
  });
  function renderCalendar() {
    $('calendarMonth').textContent=calendarMonth.toLocaleDateString(undefined,{month:'long',year:'numeric'});
    const container=$('calendarDays');container.replaceChildren();
    const groups=new Map(groupJournalEntries(state.entries).map(group=>[group.date,group.entries]));
    let reflectionDays=0;
    calendarCells(calendarMonth.getFullYear(),calendarMonth.getMonth()).forEach(date=>{
      if(!date){const blank=node('div','','calendar-blank');blank.setAttribute('aria-hidden','true');container.append(blank);return;}
      const entries=groups.get(date)||[];
      const cell=node(entries.length?'button':'div','','calendar-day');
      cell.dataset.date=date;
      cell.append(node('span',String(Number(date.slice(-2))),'calendar-day-number'));
      if(date===localDateKey()){cell.classList.add('is-today');cell.setAttribute('aria-current','date');}
      if(entries.length){
        reflectionDays++;
        cell.type='button';cell.classList.add('has-reflections');cell.setAttribute('aria-haspopup','dialog');
        const moods=[...new Set(entries.map(entry=>entry.mood))];
        cell.setAttribute('aria-label',`${formatJournalDate(date)}: ${entries.length} reflection${entries.length===1?'':'s'}, ${moods.join(', ')}. Open journal.`);
        const emojis=node('span','','calendar-moods');emojis.setAttribute('aria-hidden','true');
        moods.slice(0,3).forEach(mood=>emojis.append(node('span',moodEmoji(mood))));
        cell.append(emojis);cell.addEventListener('click',()=>openJournal(date,cell));
      }else cell.setAttribute('aria-label',`${formatJournalDate(date)}: no reflections`);
      container.append(cell);
    });
    $('calendarNote').textContent=reflectionDays
      ? `${reflectionDays} day${reflectionDays===1?'':'s'} of reflection. Choose a mood-filled day to revisit your moments.`
      : 'A fresh page in your story. No reflections this month yet.';
  }
  function changeMonth(step) {
    calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+step,1,12);
    renderCalendar();
    if(graphDialog.open) renderMonthlyGraph();
  }
  $('previousMonth').addEventListener('click',()=>changeMonth(-1));
  $('nextMonth').addEventListener('click',()=>changeMonth(1));
  const graphDialog=$('monthlyGraphDialog'),graphButton=$('openMonthlyGraph');
  function renderMonthlyGraph() {
    const month=monthKey(localDateKey(calendarMonth));
    const dates=calendarCells(calendarMonth.getFullYear(),calendarMonth.getMonth()).filter(Boolean);
    const daily=new Map(dates.map(date=>[date,0]));
    let entries=0;
    for(const entry of state.entries){
      if(!daily.has(entry.date))continue;
      daily.set(entry.date,daily.get(entry.date)+entry.points);
      entries++;
    }
    const values=[...daily.values()];
    const scale=Math.max(100,Math.ceil(Math.max(...values)/10)*10);
    const total=values.reduce((sum,value)=>sum+value,0);
    $('graphMonth').textContent=monthLabel(month);
    $('graphSummary').textContent=entries?`${total} HP earned from check-ins this month`:'No check-ins recorded this month.';
    $('graphScale').replaceChildren(...[scale,scale/2,0].map(value=>node('span',String(value))));
    const bars=$('graphBars'),days=$('graphDays'),details=$('graphDailyPoints');
    bars.replaceChildren();days.replaceChildren();details.replaceChildren();
    const columns=`repeat(${daily.size}, minmax(0, 1fr))`;
    bars.style.gridTemplateColumns=columns;
    days.style.gridTemplateColumns=columns;
    for(const [date,value] of daily){
      const day=Number(date.slice(-2));
      const bar=node('div','','graph-bar');
      bar.style.height=`${value/scale*100}%`;
      bar.title=`Day ${day}: ${value} HP`;
      bars.append(bar);
      days.append(node('span',day===1||day%5===0?String(day):''));
      details.append(node('li',`Day ${day}: ${value} HP`));
    }
  }
  graphButton.addEventListener('click',()=>{
    renderMonthlyGraph();
    graphDialog.showModal();
    $('closeMonthlyGraph').focus();
  });
  $('graphPreviousMonth').addEventListener('click',()=>changeMonth(-1));
  $('graphNextMonth').addEventListener('click',()=>changeMonth(1));
  $('closeMonthlyGraph').addEventListener('click',()=>graphDialog.close());
  graphDialog.addEventListener('click',event=>{if(event.target===graphDialog)graphDialog.close();});
  graphDialog.addEventListener('close',()=>graphButton.focus());
  const backupDialog=$('backupDialog'),backupFile=$('backupFile'),backupFeedback=$('backupFeedback');
  const restoreButton=$('chooseBackup');
  function openBackup(firstVisit=false) {
    $('backupTitle').textContent=firstVisit?'Restore an existing journal?':'Backup & restore';
    $('closeBackup').textContent=firstVisit?'Continue without restoring':'Close';
    $('downloadBackup').hidden=firstVisit;
    backupFeedback.textContent='';
    backupDialog.showModal();
    restoreButton.focus();
  }
  $('backupBtn').addEventListener('click',()=>openBackup());
  $('closeBackup').addEventListener('click',()=>backupDialog.close());
  restoreButton.addEventListener('click',()=>backupFile.click());
  $('downloadBackup').addEventListener('click',()=>{
    const data=JSON.stringify({format:'my-happiness-tracker',version:1,state},null,2);
    const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
    const link=document.createElement('a');
    link.href=url;
    link.download=`My_Happiness_Tracker_Backup_${localDateKey()}.json`;
    document.body.append(link);
    try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
    backupFeedback.textContent='Backup download started. Keep the file somewhere private, such as your cloud drive.';
  });
  backupFile.addEventListener('change',async()=>{
    const file=backupFile.files[0];
    backupFile.value='';
    if(!file)return;
    restoreButton.disabled=true;
    try {
      const restored=readBackup(await file.text());
      if(!backupDialog.open)return;
      if((localStorage.getItem(STORAGE_KEY)!==null||state.entries.length)&&
         !window.confirm('Replace the journal in this browser? Cancel and download a backup first if you want to keep it.'))return;
      localStorage.setItem(STORAGE_KEY,JSON.stringify(restored));
      state=restored;
      legacyBackupRaw=null;
      storageWarning='';
      $('storageNotice').textContent='';
      $('feedback').textContent='';
      calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1,12);
      render();
      backupDialog.close();
      $('restoreFeedback').textContent='Your journal and tree progress were restored.';
    }catch(error){
      backupFeedback.textContent=error instanceof SyntaxError?'This file is not a readable backup.':`Restore failed. ${error.message}`;
    }finally{restoreButton.disabled=false;}
  });
  if(offerRestore)openBackup(true);
  function render(){
    const tree=state.monthlyTrees[state.activeMonth],target=tree.target,stage=getStageIndex(tree.hp,target);
    $('tree').innerHTML=treeSVG(stage);$('tree').setAttribute('aria-label',STAGES[stage]);$('treeStage').textContent=STAGES[stage];
    $('treeNumber').textContent=state.activeMonth;$('treeMonth').textContent=monthLabel(state.activeMonth);
    $('treeMessage').textContent=stage===4?'Your monthly tree is fully grown! A new seed arrives next month.':'A little care, a little wonder. Your monthly garden is growing.';
    $('currentHP').textContent=tree.hp;$('totalHP').textContent=tree.hp;$('targetHP').textContent=target;
    $('progressText').textContent=`${Math.round(tree.hp/target*100)}% grown`;$('progressFill').style.width=`${tree.hp/target*100}%`;
    $('growthProgress').setAttribute('aria-valuenow',tree.hp);$('growthProgress').setAttribute('aria-valuemax',target);
    $('nextStage').textContent=stage<4?`${Math.ceil(target*STAGE_RATIOS[stage+1])-tree.hp} HP until ${STAGES[stage+1].toLowerCase()}.`:`${target} HP - a month of little happy moments.`;
    $('monthlyTargetInfo').textContent=`${monthLabel(state.activeMonth)}: ${target/15} days, ${target} HP to fully grow your tree.`;
    $('totalDays').textContent=new Set(state.entries.map(e=>e.date)).size;$('totalEntries').textContent=state.entries.length;
    $('totalTrees').textContent=state.completedTrees.length+Object.values(state.monthlyTrees).filter(t=>t.hp>=t.target).length;
    document.querySelector('.tree-card').classList.toggle('celebrate',stage===4);
    renderCalendar();const garden=$('completedGarden');garden.replaceChildren();
    const records=Object.values(state.monthlyTrees).filter(t=>t.month!==state.activeMonth||t.hp>=t.target).sort((a,b)=>b.month.localeCompare(a.month));
    if(!records.length&&!state.completedTrees.length)garden.append(node('div','Your monthly trees will gather here, each one a chapter of your story.','empty-message'));
    records.forEach(t=>{
      const card=node('article','','garden-tree');const art=node('div','','monthly-tree-art');art.innerHTML=treeSVG(getStageIndex(t.hp,t.target));
      card.append(art,node('h3',monthLabel(t.month)),node('p',t.hp>=t.target?'Fully grown':'Monthly keepsake'),node('p',`${t.hp} / ${t.target} HP`));garden.append(card);
    });
    state.completedTrees.forEach((t,index)=>{
      const card=node('article','','garden-tree'),img=document.createElement('img');img.src='assets/happiness-tree.svg';img.alt='Legacy flowering happiness tree';
      card.append(img,node('h3',`Legacy happiness tree ${t.id||index+1}`),node('p',`Completed ${t.completedDate}`),node('p',`${t.hp} HP`));garden.append(card);
    });
  }
  function syncMonthlyTree(){if(ensureMonthlyTree(state)){persist();render();}}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncMonthlyTree();});
  setInterval(syncMonthlyTree,60000);
  document.querySelectorAll('[data-mood]').forEach(button=>{button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>{mood=button.dataset.mood;document.querySelectorAll('[data-mood]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});});});
  $('reflectionForm').addEventListener('submit',event=>{event.preventDefault();const result=addReflection(state,{mood,journal:$('journalText').value,memory:$('happyMemory').checked,gratitude:$('gratitude').checked});if(result.error){$('feedback').textContent=result.error;return;}persist();render();const moodOnly=!$('journalText').value.trim();$('reflectionForm').reset();mood='';document.querySelectorAll('[data-mood]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});$('feedback').textContent=moodOnly?'Mood saved! A little happy moment remembered.':'Reflection saved! Your tree is growing.';$('storageNotice').textContent=storageWarning;const floating=$('floatingHP');floating.textContent=`+${result.points} HP`;floating.classList.remove('float');void floating.offsetWidth;floating.classList.add('float');});
  const quotes=['You don\'t have to bloom every day. Growing quietly counts, too.','Small moments of joy have a way of becoming a beautiful life.','Where you give a little care, something beautiful can grow.','There is no hurry. Your happiness grows at its own pace.'];$('quote').textContent=quotes[Math.floor(Math.random()*quotes.length)];if(needsMigrationSave)persist();render();if(storageWarning)$('storageNotice').textContent=storageWarning;else if(state.entries.length && (new Date(localDateKey()+'T12:00:00')-new Date(state.entries[0].date+'T12:00:00'))/86400000>=3)$('feedback').textContent='Welcome back. Your tree is right here, ready whenever you are.';
}
