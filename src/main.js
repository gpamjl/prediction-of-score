import history from './history.json';
import './style.css';
const STORE='icu-hcu-forecast-v1';
const names=Object.keys(history);
const initial={'佐藤':39520,'加藤':48065,'麻苧':43250,'和田':45925,'西川':47280,'坂口':45610};
let saved={};try{saved=JSON.parse(localStorage.getItem(STORE)||'{}')}catch{}
let state={name:'坂口',points:45610,method:'individual',month:'2026-10',...saved};
const fmt=n=>Math.round(n).toLocaleString('ja-JP');
function increments(name){return (history[name]||[]).filter(([a,b])=>Number.isFinite(a)&&Number.isFinite(b)&&b>=a).map(([a,b])=>b-a)}
function avg(xs){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null}
function coefficient(name,method){if(method==='individual')return avg(increments(name));return avg(names.filter(n=>n!=='佐藤').flatMap(increments))}
function persist(){localStorage.setItem(STORE,JSON.stringify(state))}
function el(id){return document.getElementById(id)}
function render(){
 const k=coefficient(state.name,state.method),p=Number(state.points),valid=state.points!==''&&Number.isFinite(p)&&p>=0;
 el('staff').value=state.name;el('points').value=state.points;el('month').value=state.month;el('method').value=state.method;
 el('prediction').textContent=valid&&k!==null?fmt(p+k)+' 点':'—';
 el('formula').textContent=valid&&k!==null?`${fmt(p)} ＋ ${fmt(k)} = ${fmt(p+k)} 点`:'点数を入力してください';
 el('samples').textContent=state.method==='individual'?`${increments(state.name).length}か月の有効データから算出`:'佐藤を除く5名の有効データから算出';
 el('note').textContent=state.name==='坂口'?'※坂口の2026年7月末「10,400点」は15日時点を下回るため除外しています。':'';
 const ranks=names.map(n=>({name:n,value:(Number(state.month==='2026-10'?(state.name===n?state.points:initial[n]):(state.name===n?state.points:''))||0)+coefficient(n,state.method)})).filter(r=>state.month==='2026-10'||r.name===state.name).sort((a,b)=>b.value-a.value);
 el('ranking').innerHTML=ranks.map((r,i)=>`<div class="rank"><span>${i+1}位　${r.name}</span><strong>${fmt(r.value)} 点</strong></div>`).join('');
 el('rankhint').textContent=state.month==='2026-10'?'※選択中の職員以外は10月15日の初期値を使用。別月では選択職員のみ表示。':'※選択した職員のみ表示。';
 persist();
}
document.querySelector('#app').innerHTML=`<main class="shell"><header><div class="eyebrow">REHABILITATION ANALYTICS</div><h1>ICU・HCU 月末点数予測</h1><p>15日時点の累計点数から、個人別の月末着地を予測します。</p></header><section class="card"><div class="section-title"><h2>予測条件</h2><span class="tag">6〜9月実績に基づく暫定モデル</span></div><div class="fields"><label>対象月<input type="month" id="month"/></label><label>職員名<select id="staff">${names.map(n=>`<option value="${n}">${n}</option>`).join('')}</select></label><label class="wide">15日時点の累計点数<input type="number" id="points" min="0" step="1" inputmode="numeric" placeholder="例：45610"/></label><label class="wide">予測方式<select id="method"><option value="individual">個人別式（推奨）</option><option value="common">共通式（佐藤を除外して算出）</option></select></label></div><div class="result"><div class="muted">月末予測点数</div><div class="big" id="prediction">—</div><div id="formula"></div><small id="samples"></small></div><p class="note" id="note"></p><div class="actions"><button id="copy">結果をコピー</button><button class="secondary" id="reset">入力を初期化</button></div></section><section class="card"><h2>10月の参考ランキング</h2><div id="ranking"></div><p class="note" id="rankhint"></p></section><section class="card"><h2>予測式について</h2><p>個人別式：月末予測 = 15日時点の点数 ＋ その職員の6〜9月の後半増加点数の平均。</p><p>共通式：佐藤を除く5名の有効な月後半増加点数の平均を加算。佐藤本人への適用も比較用として可能です。</p><p class="note">月ごとの実勤務日数・患者重症度・加算の変動は補正していません。予測は保証値ではありません。データはブラウザ内にのみ保存され、サーバーには送信されません。</p></section><footer>職員別の集計点数のみを扱い、患者情報を入力しないでください。</footer></main>`;
el('staff').addEventListener('change',e=>{state.name=e.target.value;state.points=state.month==='2026-10'?initial[state.name]:'';render()});
el('points').addEventListener('input',e=>{state.points=e.target.value;render()});
el('method').addEventListener('change',e=>{state.method=e.target.value;render()});
el('month').addEventListener('change',e=>{state.month=e.target.value;state.points=state.month==='2026-10'?initial[state.name]:'';render()});
el('copy').addEventListener('click',async()=>{const k=coefficient(state.name,state.method);const p=Number(state.points);if(state.points===''||p<0)return;try{await navigator.clipboard.writeText(`${state.month} ${state.name}\n15日時点 ${fmt(p)}点\n月末予測 ${fmt(p+k)}点`);el('copy').textContent='コピーしました';setTimeout(()=>el('copy').textContent='結果をコピー',1800)}catch{alert('コピーできませんでした')}});
el('reset').addEventListener('click',()=>{state={name:'坂口',points:45610,method:'individual',month:'2026-10'};render()});
render();
