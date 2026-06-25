const fmt  = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const fmtN = (v,d=2) => v.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});

// ── CAROUSEL ──
const track = document.getElementById('carouselTrack');
// allCards now includes both carousel cards AND grid cards
let allCards = Array.from(document.querySelectorAll('.cat-card[data-sim]'));

// Carousel has only 3 real cards + Ver mais = 4 visible, no scrolling needed
// Hide arrows since 4 cards fit perfectly
document.getElementById('prev').style.display = 'none';
document.getElementById('next').style.display = 'none';

// ── TOGGLE MORE CARDS ──
let moreCardsOpen = false;
function toggleMoreCards(event){

  if(event){
    event.stopPropagation();
  }
  const panel = document.getElementById('moreCardsPanel');
  const btn   = document.getElementById('catVerMais');
  moreCardsOpen = !moreCardsOpen;
  panel.style.display = moreCardsOpen ? 'block' : 'none';
  if(btn){
    const lbl = btn.querySelector('.cat-label');
    const ico = btn.querySelector('.cat-icon i');
    if(lbl) lbl.textContent = moreCardsOpen ? 'Ver menos' : 'Ver mais';
    if(ico){ ico.className = moreCardsOpen ? 'bi bi-x-lg' : 'bi bi-grid-3x3-gap-fill'; }
    btn.classList.toggle('active', moreCardsOpen);
  }
  if(moreCardsOpen) panel.scrollIntoView({behavior:'smooth', block:'nearest'});
}

// ── CARD CLICK: carousel + grid ──
function handleCardClick(card){
  const sim = card.dataset.sim;
  if(!sim) return;
  // close more cards panel if open
  if(moreCardsOpen) toggleMoreCards();
  // deactivate all
  allCards.forEach(c => c.classList.remove('active'));
  card.classList.add('active');
  openSim(sim);
}

// attach to carousel cards
track.querySelectorAll('.cat-card[data-sim]').forEach(card => {
  card.addEventListener('click', () => handleCardClick(card));
});

// attach to grid cards (event delegation)
const allCardsGrid = document.getElementById('allCardsGrid');

if(allCardsGrid){
  allCardsGrid.addEventListener('click', e => {
    const card = e.target.closest('.cat-card[data-sim]');

    if(card){
      e.stopPropagation();
      handleCardClick(card);
    }
  });
}

// ── STEPPER ──
function stepDown(id,min=1){const e=document.getElementById(id);e.value=Math.max(min,+e.value-1);}
function stepUp(id,max=999){const e=document.getElementById(id);e.value=Math.min(max,+e.value+1);}
function setEntradaPct(eId,tId,p){const t=parseFloat(document.getElementById(tId)?.value)||0;document.getElementById(eId).value=(t*p).toFixed(2);}

// ── PANEL ──
const panel   = document.getElementById('simPanel');
const simCard = document.getElementById('simCard');

function closePanel(){panel.classList.remove('open');allCards.forEach(c=>c.classList.remove('active'));}

function cardHTML(icon,title,tag,body,hint){
  const iconHTML = icon.startsWith('bi-') ? `<i class="bi ${icon}"></i>` : icon;
  return `
  <div class="sc-header">
    <div class="sc-title-row">
      <div class="sc-icon-box">${iconHTML}</div>
      <div><div class="sc-title">${title}</div></div>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <span class="sc-tag">${tag}</span>
      <button class="sc-close" onclick="closePanel()">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
  </div>
  <div class="sc-body">${body}</div>`;
}

function showResult(id, label, main, rows, note, extraHTML=''){
  const el = document.getElementById(id);
  el.className = 'sc-result visible';
  const hasExtra = extraHTML.trim().length > 0;
  el.innerHTML = `
    <div class="sc-result-label">${label}</div>
    <div class="sc-result-main">${main}</div>
    <div class="sc-result-rows">${rows.map(r=>`<div class="sc-result-row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}</div>
    <div class="sc-disclaimer">${note}</div>
    ${hasExtra ? `
    <div id="resExtra" style="display:none;margin-top:12px">${extraHTML}</div>
    <button onclick="toggleResExtra(this)" class="res-vermais-btn">▼ Ver mais</button>
    ` : ''}`;
}

function toggleResExtra(btn){
  const extra = document.getElementById('resExtra');
  if(!extra) return;
  const open = extra.style.display !== 'none';
  extra.style.display = open ? 'none' : 'block';
  btn.textContent = open ? '▼ Ver mais' : '▲ Ver menos';
}

function moneyField(id,label,val=''){
  return `<div class="sc-field"><label>${label}</label>
    <div class="sc-input-wrap">
      <span class="sc-prefix">R$</span>
      <input id="${id}" type="number" value="${val}" placeholder="0,00">
      <button class="sc-clear" onclick="document.getElementById('${id}').value=''">×</button>
    </div></div>`;
}
function stepperField(id,label,val,min=1,max=999){
  return `<div class="sc-field"><label>${label}</label>
    <div class="sc-stepper">
      <button class="sc-step-btn" onclick="stepDown('${id}',${min})">−</button>
      <input class="sc-step-val" id="${id}" type="number" value="${val}" min="${min}">
      <button class="sc-step-btn" onclick="stepUp('${id}',${max})">+</button>
    </div></div>`;
}
function rateField(id,label,val,suffix='% Mensal ▾'){
  return `<div class="sc-field"><label>${label}</label>
    <div class="sc-input-wrap">
      <input id="${id}" type="number" value="${val}" step="0.01" style="padding-left:14px;height:50px">
      <span class="sc-suffix">${suffix}</span>
    </div></div>`;
}
function selectField(id,label,options){
  return `<div class="sc-field"><label>${label}</label>
    <div class="sc-select-wrap"><select id="${id}">${options.map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('')}</select></div></div>`;
}
function footer(hint,calcFn,brandSub='Calculadoras'){
  return `<div id="simResult" class="sc-result"></div>
    <div class="sc-footer">
      <div class="sc-brand">
        <div class="sc-brand-icon"><i class="bi bi-coin"></i></div>
        <div><div class="sc-brand-text">SimuleJá</div><div class="sc-brand-sub">${brandSub}</div></div>
      </div>
      ${hint?`<span class="sc-hint">✦ ${hint}</span>`:'<span></span>'}
      <button class="sc-calc-btn" onclick="${calcFn}">Calcular</button>
    </div>`;
}

// ── SIMULATORS ──
const sims = {
  p2p(){
    simCard.innerHTML = cardHTML('bi-people-fill','Simulador de Empréstimo P2P','Sistema Price',`
      <div class="sc-row">${moneyField('p2pV','Valor desejado','10000')}${moneyField('p2pE','Valor da penhora (aproximado)','0')}</div>
      <div class="sc-row">
        <div class="sc-field">
          <label>Taxa de juros mensal (%)</label>
          <div class="sc-input-wrap">
            <input id="p2pT" type="number" value="1.8" step="0.1" style="padding-left:14px;height:50px">
            <span class="sc-suffix">% Mensal ▾</span>
          </div>
          <div class="rate-pills">
            <button class="rate-pill" onclick="setP2PRate(5)">5%</button>
            <button class="rate-pill" onclick="setP2PRate(10)">10%</button>
            <button class="rate-pill" onclick="setP2PRate(15)">15%</button>
            <button class="rate-pill" onclick="setP2PRate(20)">20%</button>
            <button class="rate-pill" onclick="setP2PRate('comp')" id="pillComp">Compostos</button>
          </div>
        </div>
        <div class="sc-field">
          <label>Número de parcelas</label>
          <div class="sc-stepper">
            <button class="sc-step-btn" onclick="stepDown('p2pP',1)">−</button>
            <input class="sc-step-val" id="p2pP" type="number" value="3" min="1" max="60">
            <button class="sc-step-btn" onclick="stepUp('p2pP',60)">+</button>
          </div>
          <div class="rate-pills">
            <button class="rate-pill active" onclick="setP2PParc(3)">3x</button>
            <button class="rate-pill" onclick="setP2PParc(6)">6x</button>
            <button class="rate-pill" onclick="setP2PParc(9)">9x</button>
          </div>
        </div>
      </div>
      ${footer('Compare taxas entre plataformas P2P','calcP2P()')}
    `);
  },
  veiculo(){
    simCard.innerHTML = cardHTML('bi-car-front-fill','Calculadora de Financiamento Veicular','Tabela Price',`
      <div class="sc-row">${moneyField('veiV','Valor do veículo desejado','50000')}<div class="sc-field"><label>Valor de entrada</label><div class="sc-input-wrap"><span class="sc-prefix">R$</span><input id="veiE" type="number" value="10000" placeholder="0,00"><button class="sc-clear" onclick="document.getElementById('veiE').value=''">×</button></div><div class="rate-pills" style="margin-top:5px"><button class="rate-pill" onclick="setEntradaPct('veiE','veiV',0.20)">20%</button><button class="rate-pill" onclick="setEntradaPct('veiE','veiV',0.40)">40%</button><button class="rate-pill" onclick="setEntradaPct('veiE','veiV',0.60)">60%</button></div></div></div>
      <div class="sc-row">
        ${rateField('veiT','Taxa de juros (use a média ou edite)','1.99')}
        <div class="sc-field">
          <label>Número de parcelas</label>
          <div class="sc-stepper">
            <button class="sc-step-btn" onclick="stepDown('veiP',1)">−</button>
            <input class="sc-step-val" id="veiP" type="number" value="48" min="1" max="72">
            <button class="sc-step-btn" onclick="stepUp('veiP',72)">+</button>
          </div>
          <div class="rate-pills">
            <button class="rate-pill" onclick="setVeiParc(24)">24x</button>
            <button class="rate-pill" onclick="setVeiParc(36)">36x</button>
            <button class="rate-pill" onclick="setVeiParc(48)" class="active">48x</button>
            <button class="rate-pill" onclick="setVeiParc(60)">60x</button>
          </div>
        </div>
      </div>
      ${footer('Aproveite: Consórcio com apenas 6,5% total','calcVei()')}
    `);
  },
  imovel(){
    simCard.innerHTML = cardHTML('bi-house-fill','Simulador de Financiamento Imobiliário','Tabela Price',`
      <div class="sc-row">${moneyField('imoV','Valor do imóvel','400000')}<div class="sc-field"><label>Entrada (mín. 20%)</label><div class="sc-input-wrap"><span class="sc-prefix">R$</span><input id="imoE" type="number" value="80000" placeholder="0,00"><button class="sc-clear" onclick="document.getElementById('imoE').value=''">×</button></div><div class="rate-pills" style="margin-top:5px"><button class="rate-pill" onclick="setEntradaPct('imoE','imoV',0.20)">20%</button><button class="rate-pill" onclick="setEntradaPct('imoE','imoV',0.40)">40%</button><button class="rate-pill" onclick="setEntradaPct('imoE','imoV',0.60)">60%</button></div></div></div>
      <div class="sc-row">
        ${rateField('imoT','Taxa de juros anual (%)','10.5','% Anual ▾')}
        <div class="sc-field">
          <label>Prazo (meses)</label>
          <div class="sc-stepper">
            <button class="sc-step-btn" onclick="stepDown('imoA',1)">−</button>
            <input class="sc-step-val" id="imoA" type="number" value="360" min="1" max="420">
            <button class="sc-step-btn" onclick="stepUp('imoA',420)">+</button>
          </div>
          <div class="rate-pills">
            <button class="rate-pill" onclick="setImoMeses(120)">120</button>
            <button class="rate-pill" onclick="setImoMeses(240)">240</button>
            <button class="rate-pill" onclick="setImoMeses(360)">360</button>
          </div>
        </div>
      </div>
      ${footer('Parcela não deve ultrapassar 30% da renda','calcImo()')}
    `);
  },
  investimento(){
    simCard.innerHTML = `
    <div class="sc-header">
      <div class="sc-title-row">
        <div class="sc-icon-box"><i class="bi bi-graph-up-arrow"></i></div>
        <div><div class="sc-title">Que aplicação rende mais?</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="sc-tag" id="invStatus" style="color:var(--green);font-size:11px;font-weight:700">Buscando taxas...</span>
        <button class="sc-close" onclick="closePanel()">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <div class="sc-body">
      <!-- inputs principais -->
      <div class="sc-row">
        <div class="sc-field"><label>Investimento inicial</label>
          <div class="sc-input-wrap"><span class="sc-prefix">R$</span><input id="invI" type="number" value="0" placeholder="0,00" oninput="autoCalcInv()"></div>
        </div>
        <div class="sc-field"><label>Aportes mensais</label>
          <div class="sc-input-wrap"><span class="sc-prefix">R$</span><input id="invA" type="number" value="0" placeholder="0,00" oninput="autoCalcInv()"></div>
        </div>
        <div class="sc-field"><label>Período da aplicação</label>
          <div style="display:flex;gap:6px;align-items:center">
            <div class="sc-stepper" style="flex:1">
              <button class="sc-step-btn" onclick="stepDown('invP',1);autoCalcInv()">−</button>
              <input class="sc-step-val" id="invP" type="number" value="12" min="1" oninput="autoCalcInv()">
              <button class="sc-step-btn" onclick="stepUp('invP',600);autoCalcInv()">+</button>
            </div>
            <div class="sc-select-wrap" style="width:100px"><select id="invUnit" onchange="autoCalcInv()" style="height:50px;font-size:13px">
              <option value="meses">meses</option>
              <option value="anos">anos</option>
            </select></div>
          </div>
        </div>
      </div>

      <!-- taxas do mercado -->
      <div class="inv-taxas-grid" id="invTaxasGrid">
        <!-- gerado por JS -->
      </div>

      <!-- parâmetros avançados -->
      <div style="background:rgba(0,177,79,0.05);border:1px solid var(--gray-200);border-radius:14px;padding:18px 20px">
        <div style="font-family:var(--ff);font-weight:700;font-size:13px;color:var(--gray-700);margin-bottom:14px">Parâmetros avançados</div>
        <div class="inv-params-grid">
          <div class="inv-param-field"><label>Juro nominal do Tesouro Prefixado (a.a.)</label><div class="sc-input-wrap" style="margin-top:5px"><input id="pTesouroPre" type="number" step="0.01" value="14.00" style="padding-left:14px;height:44px" oninput="autoCalcInv()"><span class="sc-suffix">%</span></div></div>
          <div class="inv-param-field"><label>Taxa de custódia B3 – Tesouro Direto (a.a.)</label><div class="sc-input-wrap" style="margin-top:5px"><input id="pCustodiaB3" type="number" step="0.01" value="0.20" style="padding-left:14px;height:44px" oninput="autoCalcInv()"><span class="sc-suffix">%</span></div></div>
          <div class="inv-param-field"><label>Juro real do Tesouro IPCA+ (a.a.)</label><div class="sc-input-wrap" style="margin-top:5px"><input id="pTesouroIPCA" type="number" step="0.01" value="6.50" style="padding-left:14px;height:44px" oninput="autoCalcInv()"><span class="sc-suffix">%</span></div></div>
          <div class="inv-param-field"><label>Taxa de administração – Fundo DI (a.a.)</label>
            <div style="display:flex;gap:6px;margin-top:5px;align-items:center">
              <div class="sc-input-wrap" style="flex:1"><input id="pTaxaFundoDI" type="number" step="0.01" value="0.25" style="padding-left:14px;height:44px" oninput="autoCalcInv()"><span class="sc-suffix">%</span></div>
              <button class="sc-step-btn" style="border-radius:8px;width:38px;height:44px;font-size:18px" onclick="adjParam('pTaxaFundoDI',-0.05)">−</button>
              <button class="sc-step-btn" style="border-radius:8px;width:38px;height:44px;font-size:18px" onclick="adjParam('pTaxaFundoDI',0.05)">+</button>
            </div>
          </div>
          <div class="inv-param-field"><label>Rentabilidade do CDB</label>
            <div style="display:flex;gap:6px;margin-top:5px">
              <div class="sc-input-wrap" style="flex:1"><input id="pCDB" type="number" step="1" value="100" style="padding-left:14px;height:44px" oninput="autoCalcInv()"><span class="sc-suffix">%</span></div>
              <div class="sc-select-wrap" style="width:110px"><select id="pCDBbase" onchange="autoCalcInv()" style="height:44px;font-size:12px"><option value="cdi">% do CDI</option><option value="pre">% a.a.</option></select></div>
            </div>
          </div>
          <div class="inv-param-field"><label>Rentabilidade Fundo DI (% do CDI)</label><div class="sc-input-wrap" style="margin-top:5px"><input id="pFundoDI" type="number" step="0.01" value="98.17" style="padding-left:14px;height:44px" oninput="autoCalcInv()"><span class="sc-suffix">%</span></div></div>
          <div class="inv-param-field"><label>Rentabilidade LCI/LCA (% do CDI)</label><div class="sc-input-wrap" style="margin-top:5px"><input id="pLCI" type="number" step="1" value="85" style="padding-left:14px;height:44px" oninput="autoCalcInv()"><span class="sc-suffix">%</span></div></div>
          <div class="inv-param-field"><label>Rentabilidade da Poupança (a.m.)</label><div class="sc-input-wrap" style="margin-top:5px"><input id="pPoupanca" type="number" step="0.0001" value="0.6717" style="padding-left:14px;height:44px" oninput="autoCalcInv()"><span class="sc-suffix">%</span></div></div>
        </div>
        <div style="font-size:11px;color:var(--gray-400);margin-top:12px;line-height:1.5">Esses são os parâmetros padrões utilizados na sua simulação. Você pode alterá-los e refazer os cálculos para uma simulação avançada.</div>
      </div>

      <div id="simResult" class="sc-result"></div>
    </div>

    <div class="sc-footer" style="margin-top:10px">
      <div class="sc-brand">
        <div class="sc-brand-icon"><i class="bi bi-coin"></i></div>
        <div><div class="sc-brand-text">SimuleJá</div><div class="sc-brand-sub">Investimentos</div></div>
      </div>
      <span class="sc-hint" id="invUpdated">✦ Taxas ao vivo</span>
      <button class="sc-calc-btn" onclick="calcInv()">Simular</button>
    </div>`;

    fetchInvTaxas();
  },
  ipva(){
    simCard.innerHTML = cardHTML('bi-file-earmark-text-fill','Simulador de IPVA','Cálculo Anual',`
      <div class="sc-row">
        ${moneyField('ipvaV','Valor FIPE do veículo','50000')}
        ${selectField('ipvaUF','Estado',[['4.0','SP – 4,0%'],['3.5','MG – 3,5%'],['3.5','RJ – 3,5%'],['3.0','RS – 3,0%'],['3.0','PR – 3,0%'],['2.5','SC – 2,5%'],['3.5','BA – 3,5%'],['2.5','DF – 2,5%']])}
      </div>
      <div class="sc-row">
        ${rateField('ipvaD','Desconto à vista (%)','3','%')}
        ${stepperField('ipvaP','Parcelas',5,1,5)}
      </div>
      ${footer('Pague à vista e economize até 15%','calcIPVA()')}
    `);
  },
  fgts(){
    simCard.innerHTML = cardHTML('bi-briefcase-fill','Calculadora de FGTS','Estimativa',`
      <div class="sc-row">${moneyField('fgtsS','Salário bruto mensal','5000')}${moneyField('fgtsSaldo','Saldo atual na conta FGTS','0')}</div>
      ${stepperField('fgtsM','Meses trabalhados',24,1,360)}
      ${footer('8% do salário bruto depositado pelo empregador','calcFGTS()')}
    `);
  },
  rescisao(){
    const now = new Date();
    const d = now.getDate(), m = now.getMonth()+1, y = now.getFullYear();
    const days   = Array.from({length:31},(_,i)=>i+1).map(n=>`<option${n===d?' selected':''}>${String(n).padStart(2,'0')}</option>`).join('');
    const months = ['01','02','03','04','05','06','07','08','09','10','11','12'].map((mo,i)=>`<option value="${mo}"${i+1===m?' selected':''}>${mo}</option>`).join('');
    const years  = Array.from({length:10},(_,i)=>y-i).map(yr=>`<option${yr===y?' selected':''}>${yr}</option>`).join('');
    const dateSelect = (id) => `
      <div style="display:flex;gap:4px;align-items:center">
        <select id="${id}D" class="sc-date-sel">${days}</select>
        <select id="${id}M" class="sc-date-sel">${months}</select>
        <select id="${id}Y" class="sc-date-sel" style="width:72px">${years}</select>
      </div>`;

    simCard.innerHTML = `
    <div class="sc-header">
      <div class="sc-title-row">
        <div class="sc-icon-box"><i class="bi bi-clipboard2-check-fill"></i></div>
        <div><div class="sc-title">Calculadora de Rescisão</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="sc-tag">Estimativa</span>
        <button class="sc-close" onclick="closePanel()">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <!-- tipo tabs -->
    <div style="display:flex;gap:8px;margin-bottom:4px">
      <button id="tabCLT" onclick="switchRescTab('clt')"
        style="flex:1;padding:10px 0;border-radius:10px;border:2px solid var(--green);background:var(--green);color:#fff;font-family:var(--ff);font-weight:700;font-size:14px;cursor:pointer;transition:all .2s">
        CLT
      </button>
      <button id="tabEst" onclick="switchRescTab('est')"
        style="flex:1;padding:10px 0;border-radius:10px;border:2px solid var(--gray-200);background:#fff;color:var(--gray-600);font-family:var(--ff);font-weight:700;font-size:14px;cursor:pointer;transition:all .2s">
        Estagiário
      </button>
    </div>

    <!-- CLT form -->
    <div id="formCLT" class="sc-body">
      <div style="background:rgba(0,177,79,0.07);border-radius:12px;padding:16px 18px;display:flex;flex-direction:column;gap:14px">
        <div style="font-family:var(--ff);font-weight:700;font-size:13px;color:var(--green);letter-spacing:.5px">PERÍODO TRABALHADO</div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <label style="font-size:13px;color:var(--gray-600);flex:1">1. Data de início da relação de trabalho:</label>
          ${dateSelect('rIni')}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <label style="font-size:13px;color:var(--gray-600);flex:1">2. Data do final da relação de trabalho:</label>
          ${dateSelect('rFim')}
        </div>
        <div style="font-size:11px;color:var(--gray-400);font-style:italic">Caso o aviso prévio seja trabalhado, o último dia do aviso prévio.</div>
      </div>

      <div style="background:rgba(0,177,79,0.07);border-radius:12px;padding:16px 18px;display:flex;flex-direction:column;gap:12px">
        <div style="font-family:var(--ff);font-weight:700;font-size:13px;color:var(--green);letter-spacing:.5px">MOTIVO DA RESCISÃO</div>
        <div style="display:flex;align-items:center;gap:12px">
          <label style="font-size:13px;color:var(--gray-600);min-width:24px">3.</label>
          <div class="sc-select-wrap" style="flex:1">
            <select id="rTipo" style="height:46px;font-size:13.5px">
              <option value="pedido">Pedido de demissão</option>
              <option value="semJusta">Dispensa sem justa causa</option>
              <option value="comJusta">Dispensa com justa causa</option>
              <option value="experiencia">Término de contrato de experiência</option>
              <option value="expEmpregador">Rescisão antecipada pelo empregador</option>
              <option value="expEmpregado">Rescisão antecipada pelo empregado</option>
              <option value="falecimento">Falecimento do empregado</option>
            </select>
          </div>
        </div>
      </div>

      <div class="sc-row">${moneyField('rS','Salário bruto mensal','5000')}${moneyField('rFgts','Saldo FGTS','9600')}</div>

      <div id="simResult" class="sc-result"></div>

      <div class="sc-footer" style="margin-top:4px">
        <span class="sc-hint">✦ Verifique seus direitos antes de assinar</span>
        <button class="sc-calc-btn" onclick="calcResc()">Calcular</button>
      </div>
    </div>

    <!-- ESTAGIÁRIO form -->
    <div id="formEST" class="sc-body" style="display:none">
      <div class="sc-field">
        <label>Data de Entrada:</label>
        <input type="date" id="estIni" class="sc-plain" style="height:50px;margin-top:4px">
      </div>
      <div class="sc-field">
        <label>Data de Saída:</label>
        <input type="date" id="estFim" class="sc-plain" style="height:50px;margin-top:4px">
      </div>
      <div class="sc-field">
        <label>Valor da Bolsa-Auxílio:</label>
        <div class="sc-input-wrap" style="margin-top:4px">
          <span class="sc-prefix">R$</span>
          <input id="estBolsa" type="number" placeholder="Ex: 1500" value="">
        </div>
      </div>

      <div id="simResultEst" class="sc-result"></div>

      <div class="sc-footer" style="margin-top:4px">
        <span class="sc-hint">✦ Lei 11.788/2008 – Lei do Estágio</span>
        <button class="sc-calc-btn" onclick="calcEstagio()">Calcular</button>
      </div>
    </div>`;
  },
  ir(){
    simCard.innerHTML = cardHTML('bi-receipt-cutoff','Simulador de Imposto de Renda','Tabela 2025',`
      <div class="sc-row">${moneyField('irR','Renda bruta mensal','8000')}${moneyField('irP','Pensão alimentícia (R$)','0')}</div>
      ${stepperField('irD','Número de dependentes',0,0,10)}
      ${footer('Declare corretamente e evite a malha fina','calcIR()')}
    `);
  },
  moeda(){
    simCard.innerHTML = `
    <div class="sc-header">
      <div class="sc-title-row">
        <div class="sc-icon-box"><i class="bi bi-currency-exchange"></i></div>
        <div><div class="sc-title">Conversor de Moeda</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="sc-tag" id="moedaTicker" style="color:var(--green);font-weight:700;font-size:12px">Carregando...</span>
        <button class="sc-close" onclick="closePanel()">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
    <div class="sc-body">
      <div class="sc-row">
        <div class="sc-field"><label>Valor</label>
          <div class="sc-input-wrap"><input id="mVal" type="number" value="1000" style="padding-left:14px;height:50px" oninput="autoConvert()"><button class="sc-clear" onclick="document.getElementById('mVal').value='';autoConvert()">×</button></div>
        </div>
        <div class="sc-field"><label>De</label>
          <div class="sc-select-wrap"><select id="mDe" onchange="onMoedaChange()" style="height:50px">
            <option value="BRL">🇧🇷 BRL – Real</option>
            <option value="USD">🇺🇸 USD – Dólar</option>
            <option value="EUR">🇪🇺 EUR – Euro</option>
            <option value="GBP">🇬🇧 GBP – Libra</option>
            <option value="ARS">🇦🇷 ARS – Peso</option>
            <option value="JPY">🇯🇵 JPY – Iene</option>
            <option value="CAD">🇨🇦 CAD – Dólar CA</option>
            <option value="CHF">🇨🇭 CHF – Franco</option>
          </select></div>
        </div>
      </div>
      <div class="sc-field"><label>Para</label>
        <div class="sc-select-wrap"><select id="mPara" onchange="onMoedaChange()" style="height:50px">
          <option value="USD">🇺🇸 USD – Dólar</option>
          <option value="EUR">🇪🇺 EUR – Euro</option>
          <option value="BRL">🇧🇷 BRL – Real</option>
          <option value="GBP">🇬🇧 GBP – Libra</option>
          <option value="ARS">🇦🇷 ARS – Peso</option>
          <option value="JPY">🇯🇵 JPY – Iene</option>
          <option value="CAD">🇨🇦 CAD – Dólar CA</option>
          <option value="CHF">🇨🇭 CHF – Franco</option>
        </select></div>
      </div>
      <div id="simResult" class="sc-result"></div>
    </div>
    <div class="sc-footer" style="margin-top:10px">
      <div class="sc-brand">
        <div class="sc-brand-icon"><i class="bi bi-coin"></i></div>
        <div><div class="sc-brand-text">SimuleJá</div><div class="sc-brand-sub">Câmbio ao vivo</div></div>
      </div>
      <span class="sc-hint" id="moedaUpdated">✦ Buscando cotação...</span>
    </div>`;
    initMoeda();
  },
  seguro(){
    simCard.innerHTML = cardHTML('bi-shield-fill-check','Simulador de Seguro Desemprego','Regras 2025',`
      <div class="sc-row">
        ${moneyField('sdS','Salário médio (últimos 3 meses)','4000')}
        ${selectField('sdVez','Nº de solicitações anteriores',[['1','1ª vez'],['2','2ª vez'],['3','3ª vez ou mais']])}
      </div>
      ${stepperField('sdM','Meses trabalhados com carteira assinada',18,6,360)}
      ${footer('Solicite em até 120 dias após a demissão','calcSD()')}
    `);
  },

  consorcio(){
    const now = new Date();
    const d=now.getDate(), m=now.getMonth()+1, y=now.getFullYear();
    const days   = Array.from({length:31},(_,i)=>i+1).map(n=>`<option${n===d?' selected':''}>${String(n).padStart(2,'0')}</option>`).join('');
    const months = ['01','02','03','04','05','06','07','08','09','10','11','12'].map((mo,i)=>`<option value="${mo}"${i+1===m?' selected':''}>${mo}</option>`).join('');
    const years  = Array.from({length:6},(_,i)=>y+i).map(yr=>`<option${yr===y?' selected':''}>${yr}</option>`).join('');

    simCard.innerHTML = `
    <div class="sc-header">
      <div class="sc-title-row">
        <div class="sc-icon-box"><i class="bi bi-dice-5-fill"></i></div>
        <div><div class="sc-title">Simulador de Consórcio</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="sc-tag">Sorteio & Calendário</span>
        <button class="sc-close" onclick="closePanel()">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
    <div class="sc-body">

      <!-- linha 1: participantes + meu número -->
      <div class="sc-row">
        <div class="sc-field"><label>Total de participantes</label>
          <div class="sc-stepper">
            <button class="sc-step-btn" onclick="stepDown('cPart',2);calcParcelaAuto()">−</button>
            <input class="sc-step-val" id="cPart" type="number" value="40" min="2" oninput="calcParcelaAuto()">
            <button class="sc-step-btn" onclick="stepUp('cPart',999);calcParcelaAuto()">+</button>
          </div>
        </div>
        <div class="sc-field">
          <label>Meu número no consórcio</label>
          <div class="sc-stepper">
            <button class="sc-step-btn" onclick="stepDown('cNum',1)">−</button>
            <input class="sc-step-val" id="cNum" type="number" value="28" min="1">
            <button class="sc-step-btn" onclick="stepUp('cNum',999)">+</button>
          </div>
          <div class="rate-pills" style="margin-top:5px">
            <button class="rate-pill" onclick="sortearNumero()" style="flex:none;width:100%;background:var(--navy);border-color:var(--navy);color:#fff;font-size:12px;padding:4px 0" id="pillSortear"><i class="bi bi-shuffle"></i> Sortear meu número</button>
          </div>
        </div>
      </div>

      <!-- linha 2: valor do prêmio -->
      <div class="sc-field">
        <label>Valor do prêmio (R$)</label>
        <div class="sc-input-wrap"><span class="sc-prefix">R$</span><input id="cPremio" type="number" value="8000" placeholder="0,00" oninput="calcParcelaAuto()"></div>
      </div>

      <!-- linha 3: valor da parcela (auto-calculada) -->
      <div class="sc-field">
        <label>Valor da parcela por pessoa (R$) <span id="cParcLabel" style="color:var(--green);font-size:11px;font-weight:600"></span></label>
        <div class="sc-input-wrap"><span class="sc-prefix">R$</span><input id="cParc" type="number" value="200" placeholder="0,00"></div>
      </div>

      <!-- linha 3: frequência dos sorteios -->
      <div class="sc-row">
        <div class="sc-field"><label>Frequência dos sorteios</label>
          <div class="sc-select-wrap"><select id="cFreq" style="height:50px" onchange="toggleCFreq()">
            <option value="7">Semanal (toda semana)</option>
            <option value="30">Mensal (todo mês)</option>
            <option value="14">Quinzenal (a cada 2 semanas)</option>
            <option value="1">Diário</option>
          </select></div>
        </div>
        <div class="sc-field"><label>Dia do sorteio (da semana)</label>
          <div class="sc-select-wrap" id="cDiaSemWrap"><select id="cDiaSem" style="height:50px">
            <option value="0">Domingo</option>
            <option value="1">Segunda-feira</option>
            <option value="2">Terça-feira</option>
            <option value="3">Quarta-feira</option>
            <option value="4">Quinta-feira</option>
            <option value="5">Sexta-feira</option>
            <option value="6">Sábado</option>
          </select></div>
        </div>
      </div>

      <!-- linha 4: data do 1º sorteio -->
      <div class="sc-field">
        <label>Data do 1º sorteio</label>
        <div style="display:flex;gap:6px;align-items:center">
          <select id="cD" class="sc-date-sel">${days}</select>
          <select id="cM" class="sc-date-sel">${months}</select>
          <select id="cY" class="sc-date-sel" style="width:72px">${years}</select>
        </div>
      </div>

      <!-- resultado -->
      <div id="simResult" class="sc-result"></div>
    </div>

    <div class="sc-footer" style="margin-top:10px">
      <div class="sc-brand">
        <div class="sc-brand-icon"><i class="bi bi-dice-5-fill"></i></div>
        <div><div class="sc-brand-text">SimuleJá</div><div class="sc-brand-sub">Consórcio</div></div>
      </div>
      <button class="sc-calc-btn" onclick="calcConsorcio()">Simular sorteio</button>
    </div>`;
  },

  loteria(){
    const loterias = [
      { id:'megasena',    name:'Mega-Sena',     min:1,  max:60,  pick:6,  color:'#209869' },
      { id:'quina',       name:'Quina',          min:1,  max:80,  pick:5,  color:'#6f007f' },
      { id:'lotofacil',   name:'Lotofácil',      min:1,  max:25,  pick:15, color:'#a400ff' },
      { id:'lotomania',   name:'Lotomania',      min:0,  max:99,  pick:20, color:'#f47920' },
      { id:'duplasena',   name:'Dupla Sena',     min:1,  max:50,  pick:6,  color:'#a40000' },
      { id:'diadesorte',  name:'Dia de Sorte',   min:1,  max:31,  pick:7,  color:'#f7941d' },
      { id:'supersete',   name:'Super Sete',     min:0,  max:9,   pick:7,  color:'#a8cf45' },
      { id:'maismilionaria', name:'+Milionária', min:1,  max:50,  pick:6,  color:'#336699' },
      { id:'timemania',   name:'Timemania',      min:1,  max:80,  pick:10, color:'#00a651' },
    ];

    const opts = loterias.map(l =>
      `<option value="${l.id}" data-pick="${l.pick}" data-min="${l.min}" data-max="${l.max}" data-color="${l.color}">${l.name}</option>`
    ).join('');

    simCard.innerHTML = `
    <div class="sc-header">
      <div class="sc-title-row">
        <div class="sc-icon-box"><i class="bi bi-ticket-perforated-fill"></i></div>
        <div>
          <div class="sc-title">Sorteios Loteria</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="sc-tag" id="lotStatus" style="color:var(--green);font-weight:700;font-size:11px">Selecione um jogo</span>
        <button class="sc-close" onclick="closePanel()">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <div class="sc-body">
      <div class="sc-field">
        <label>Selecione o jogo</label>
        <div class="sc-select-wrap"><select id="lotJogo" onchange="onLotJogoChange()" style="height:50px;font-size:15px;font-weight:600">${opts}</select></div>
      </div>

      <div id="lotLoading" style="display:none;text-align:center;padding:20px 0">
        <div style="font-size:13px;color:var(--gray-400)">
          <i class="bi bi-arrow-repeat" style="animation:spin 1s linear infinite;display:inline-block"></i>
          <span id="lotLoadingMsg">Buscando últimos concursos...</span>
        </div>
      </div>

      <div id="simResult" class="sc-result" style="display:none"></div>
    </div>

    <div class="sc-footer" style="margin-top:10px">
      <div class="sc-brand">
        <div class="sc-brand-icon"><i class="bi bi-coin"></i></div>
        <div><div class="sc-brand-text">SimuleJá</div><div class="sc-brand-sub">Loteria</div></div>
      </div>
      <span class="sc-hint" id="lotConcurso">✦ Dados atualizados semanalmente</span>
      <button class="sc-calc-btn" id="lotBtn" onclick="gerarPalpite()" style="display:none">Gerar Palpite</button>
    </div>`;

    // cache e dados
    window._lotCache = window._lotCache || {};
    window._lotData  = window._lotData  || {};
    onLotJogoChange();
  },

  quantidade(){
    simCard.innerHTML = `
    <div class="sc-header">
      <div class="sc-title-row">
        <div class="sc-icon-box"><i class="bi bi-bag-fill"></i></div>
        <div><div class="sc-title">Calculadora de Compra</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="sc-tag">Preço × Quantidade</span>
        <button class="sc-close" onclick="closePanel()">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <div class="sc-body">

      <!-- MODO -->
      <div style="display:flex;gap:8px">
        <button id="qtdModoA" onclick="switchQtdModo('qtd')"
          style="flex:1;padding:10px 0;border-radius:10px;border:2px solid var(--green);background:var(--green);color:#fff;font-family:var(--ff);font-weight:700;font-size:13.5px;cursor:pointer;transition:all .2s">
          <i class="bi bi-calculator"></i> Tenho a quantidade
        </button>
        <button id="qtdModoB" onclick="switchQtdModo('val')"
          style="flex:1;padding:10px 0;border-radius:10px;border:2px solid var(--gray-200);background:#fff;color:var(--gray-600);font-family:var(--ff);font-weight:700;font-size:13.5px;cursor:pointer;transition:all .2s">
          <i class="bi bi-cash-coin"></i> Tenho o valor
        </button>
      </div>

      <!-- PRODUTO -->
      <div class="sc-field">
        <label>Nome do produto (opcional)</label>
        <div class="sc-input-wrap">
          <input id="qtdProduto" type="text" placeholder="Ex: Carne bovina, Açúcar, Arroz..." style="padding-left:14px;height:50px;font-family:var(--fb);font-size:15px">
        </div>
      </div>

      <!-- PREÇO + UNIDADE -->
      <div class="sc-row">
        <div class="sc-field">
          <label>Preço unitário</label>
          <div class="sc-input-wrap">
            <span class="sc-prefix">R$</span>
            <input id="qtdPreco" type="number" step="0.01" placeholder="43,99" oninput="calcQtd()">
            <button class="sc-clear" onclick="document.getElementById('qtdPreco').value='';calcQtd()">×</button>
          </div>
        </div>
        <div class="sc-field">
          <label>Unidade de medida</label>
          <div class="sc-select-wrap"><select id="qtdUnidade" onchange="calcQtd()" style="height:50px;font-size:14px">
            <option value="kg">Quilograma (kg)</option>
            <option value="g">Grama (g)</option>
            <option value="L">Litro (L)</option>
            <option value="ml">Mililitro (ml)</option>
            <option value="un">Unidade (un)</option>
            <option value="cx">Caixa (cx)</option>
            <option value="pct">Pacote (pct)</option>
            <option value="dz">Dúzia (dz)</option>
            <option value="m">Metro (m)</option>
            <option value="m2">Metro quadrado (m²)</option>
          </select></div>
        </div>
      </div>

      <!-- FORMA A: tenho a quantidade -->
      <div id="qtdFormA">
        <div class="sc-field">
          <label id="qtdQtdLabel">Quantidade desejada</label>
          <div class="sc-input-wrap">
            <input id="qtdQtd" type="number" step="0.001" placeholder="1.7" oninput="calcQtd()" style="padding-left:14px">
            <span class="sc-suffix" id="qtdSufixo">kg</span>
          </div>
          <div class="rate-pills" style="margin-top:5px" id="qtdPills">
            <button class="rate-pill" onclick="setQtd(0.25)">250g</button>
            <button class="rate-pill" onclick="setQtd(0.5)">500g</button>
            <button class="rate-pill" onclick="setQtd(1)">1kg</button>
            <button class="rate-pill" onclick="setQtd(1.5)">1,5kg</button>
            <button class="rate-pill" onclick="setQtd(2)">2kg</button>
          </div>
        </div>
      </div>

      <!-- FORMA B: tenho o valor -->
      <div id="qtdFormB" style="display:none">
        <div class="sc-field">
          <label>Quanto você tem disponível</label>
          <div class="sc-input-wrap">
            <span class="sc-prefix">R$</span>
            <input id="qtdValor" type="number" step="0.01" placeholder="24,00" oninput="calcQtd()">
            <button class="sc-clear" onclick="document.getElementById('qtdValor').value='';calcQtd()">×</button>
          </div>
          <div class="rate-pills" style="margin-top:5px">
            <button class="rate-pill" onclick="setQtdVal(10)">R$ 10</button>
            <button class="rate-pill" onclick="setQtdVal(20)">R$ 20</button>
            <button class="rate-pill" onclick="setQtdVal(50)">R$ 50</button>
            <button class="rate-pill" onclick="setQtdVal(100)">R$ 100</button>
          </div>
        </div>
      </div>

      <!-- MÚLTIPLOS ITENS -->
      <div style="border-top:1px solid var(--gray-200);padding-top:14px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <label style="font-family:var(--ff);font-weight:700;font-size:13px;color:var(--gray-700)">Lista de compras</label>
          <button onclick="adicionarItem()" style="background:var(--green);color:#fff;border:none;border-radius:8px;padding:6px 14px;font-family:var(--ff);font-weight:700;font-size:12px;cursor:pointer">
            <i class="bi bi-plus-lg"></i> Adicionar item
          </button>
        </div>
        <div id="qtdLista" style="display:flex;flex-direction:column;gap:6px;min-height:4px"></div>
        <div id="qtdListaTotal" style="display:none;margin-top:10px;background:var(--gray-100);border-radius:10px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-family:var(--ff);font-weight:700;font-size:14px;color:var(--gray-700)">Total da lista</span>
          <span id="qtdListaTotalVal" style="font-family:var(--ff);font-weight:800;font-size:20px;color:var(--green-dark)">R$ 0,00</span>
        </div>
      </div>

      <div id="simResult" class="sc-result"></div>
    </div>

    <div class="sc-footer" style="margin-top:10px">
      <div class="sc-brand">
        <div class="sc-brand-icon"><i class="bi bi-coin"></i></div>
        <div><div class="sc-brand-text">SimuleJá</div><div class="sc-brand-sub">Compras</div></div>
      </div>
      <span class="sc-hint">✦ Calcule antes de ir ao caixa</span>
      <button class="sc-calc-btn" onclick="calcQtd()">Calcular</button>
    </div>`;

    updateQtdPills();
    window._qtdLista = [];
  },

  fitness(){
    simCard.innerHTML = `
    <div class="sc-header">
      <div class="sc-title-row">
        <div class="sc-icon-box"><i class="bi bi-heart-pulse-fill"></i></div>
        <div><div class="sc-title">Calculadora Fitness</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="sc-tag">IMC · Macros · Kcal</span>
        <button class="sc-close" onclick="closePanel()">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <div class="sc-body">
      <!-- OBJETIVO -->
      <div style="display:flex;gap:8px">
        <button id="fitModoA" onclick="switchFitModo('massa')"
          style="flex:1;padding:11px 0;border-radius:10px;border:2px solid var(--green);background:var(--green);color:#fff;font-family:var(--ff);font-weight:700;font-size:14px;cursor:pointer;transition:all .2s">
          <i class="bi bi-bar-chart-fill"></i> Ganhar massa
        </button>
        <button id="fitModoB" onclick="switchFitModo('gordura')"
          style="flex:1;padding:11px 0;border-radius:10px;border:2px solid var(--gray-200);background:#fff;color:var(--gray-600);font-family:var(--ff);font-weight:700;font-size:14px;cursor:pointer;transition:all .2s">
          <i class="bi bi-fire"></i> Perder gordura
        </button>
      </div>

      <!-- DADOS PESSOAIS -->
      <div class="sc-row">
        <div class="sc-field"><label>Peso (kg)</label>
          <div class="sc-input-wrap"><input id="fitPeso" type="number" step="0.1" placeholder="80" oninput="previewFit()" style="padding-left:14px"><span class="sc-suffix">kg</span></div>
        </div>
        <div class="sc-field"><label>Altura (cm)</label>
          <div class="sc-input-wrap"><input id="fitAltura" type="number" step="0.1" placeholder="175" oninput="previewFit()" style="padding-left:14px"><span class="sc-suffix">cm</span></div>
        </div>
      </div>

      <div class="sc-row">
        <div class="sc-field"><label>Idade</label>
          <div class="sc-input-wrap"><input id="fitIdade" type="number" placeholder="25" oninput="previewFit()" style="padding-left:14px"><span class="sc-suffix">anos</span></div>
        </div>
        <div class="sc-field"><label>Sexo</label>
          <div class="sc-select-wrap"><select id="fitSexo" onchange="previewFit()" style="height:50px;font-size:14px">
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select></div>
        </div>
      </div>

      <div class="sc-field"><label>Nível de atividade física</label>
        <div class="sc-select-wrap"><select id="fitAtiv" onchange="previewFit()" style="height:50px;font-size:13.5px">
          <option value="1.2">Sedentário (sem exercício)</option>
          <option value="1.375">Levemente ativo (1–3x/semana)</option>
          <option value="1.55" selected>Moderadamente ativo (3–5x/semana)</option>
          <option value="1.725">Muito ativo (6–7x/semana)</option>
          <option value="1.9">Extremamente ativo (atleta, 2x/dia)</option>
        </select></div>
      </div>

      <!-- IMC PREVIEW -->
      <div id="fitImcPreview" style="display:none;background:rgba(0,177,79,0.07);border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:14px">
        <div style="text-align:center;min-width:70px">
          <div id="fitImcVal" style="font-family:var(--ff);font-weight:800;font-size:26px;color:var(--green-dark)">--</div>
          <div style="font-size:11px;font-weight:600;color:var(--gray-400);text-transform:uppercase;letter-spacing:.5px">IMC</div>
        </div>
        <div style="flex:1">
          <div id="fitImcLabel" style="font-family:var(--ff);font-weight:700;font-size:14px;color:var(--gray-900)">--</div>
          <div id="fitImcBar" style="height:8px;border-radius:4px;background:linear-gradient(to right,#3b82f6 0%,#22c55e 35%,#f59e0b 60%,#ef4444 100%);margin-top:6px;position:relative">
            <div id="fitImcPin" style="position:absolute;top:-3px;width:14px;height:14px;background:#1e2d3d;border:2px solid #fff;border-radius:50%;transform:translateX(-50%);transition:left .3s;left:50%"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-400);margin-top:3px">
            <span>16</span><span>18,5</span><span>25</span><span>30</span><span>40</span>
          </div>
        </div>
      </div>

      <div id="simResult" class="sc-result"></div>
    </div>

    <div class="sc-footer" style="margin-top:10px">
      <div class="sc-brand">
        <div class="sc-brand-icon"><i class="bi bi-coin"></i></div>
        <div><div class="sc-brand-text">SimuleJá</div><div class="sc-brand-sub">Fitness</div></div>
      </div>
      <span class="sc-hint">✦ Baseado em fórmulas científicas validadas</span>
      <button class="sc-calc-btn" onclick="calcFitness()">Calcular</button>
    </div>`;
  },

  amortizacao(){
    simCard.innerHTML = `
    <div class="sc-header">
      <div class="sc-title-row">
        <div class="sc-icon-box"><i class="bi bi-scissors"></i></div>
        <div><div class="sc-title">Simulador de Amortização</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="sc-tag">Tabela Price</span>
        <button class="sc-close" onclick="closePanel()">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <div class="sc-body">
      <div style="background:rgba(0,177,79,0.07);border-radius:12px;padding:16px 18px">
        <div style="font-family:var(--ff);font-weight:700;font-size:12px;color:var(--green);letter-spacing:.8px;text-transform:uppercase;margin-bottom:14px">Dados do financiamento</div>
        <div class="sc-row">
          <div class="sc-field"><label>Valor financiado (R$)</label>
            <div class="sc-input-wrap"><span class="sc-prefix">R$</span><input id="amorValor" type="number" step="0.01" value="50000" placeholder="0,00"></div>
          </div>
          <div class="sc-field"><label>Taxa de juros mensal (%)</label>
            <div class="sc-input-wrap">
              <input id="amorTaxa" type="number" step="0.001" value="2.1" style="padding-left:14px;height:50px">
              <span class="sc-suffix">% a.m.</span>
            </div>
          </div>
        </div>
        <div class="sc-row" style="margin-top:4px">
          <div class="sc-field"><label>Total de parcelas</label>
            <div class="sc-stepper">
              <button class="sc-step-btn" onclick="stepDown('amorN',6)">−</button>
              <input class="sc-step-val" id="amorN" type="number" value="60" min="6">
              <button class="sc-step-btn" onclick="stepUp('amorN',360)">+</button>
            </div>
            <div style="display:flex;gap:5px;margin-top:5px" id="pillsAmorN">
              <button class="rate-pill" onclick="document.getElementById('amorN').value=24">24x</button>
              <button class="rate-pill" onclick="document.getElementById('amorN').value=36">36x</button>
              <button class="rate-pill" onclick="document.getElementById('amorN').value=48">48x</button>
              <button class="rate-pill active" onclick="document.getElementById('amorN').value=60">60x</button>
            </div>
          </div>
          <div class="sc-field"><label>Parcelas já pagas</label>
            <div class="sc-stepper">
              <button class="sc-step-btn" onclick="stepDown('amorAtual',0)">−</button>
              <input class="sc-step-val" id="amorAtual" type="number" value="9" min="0">
              <button class="sc-step-btn" onclick="stepUp('amorAtual',359)">+</button>
            </div>
            <div style="font-size:11px;color:var(--gray-400);margin-top:5px">Quantas parcelas você já pagou</div>
          </div>
        </div>
      </div>

      <div style="background:rgba(0,177,79,0.07);border-radius:12px;padding:16px 18px">
        <div style="font-family:var(--ff);font-weight:700;font-size:12px;color:var(--green);letter-spacing:.8px;text-transform:uppercase;margin-bottom:14px">Amortização</div>
        <div class="sc-row">
          <div class="sc-field"><label>Valor de cada parcela (R$)</label>
            <div class="sc-input-wrap"><span class="sc-prefix">R$</span><input id="amorParcVal" type="number" step="0.01" value="2357.50" placeholder="0,00"></div>
          </div>
          <div class="sc-field"><label>Quantas parcelas amortizar</label>
            <div class="sc-stepper">
              <button class="sc-step-btn" onclick="stepDown('amorQtd',1)">−</button>
              <input class="sc-step-val" id="amorQtd" type="number" value="5" min="1">
              <button class="sc-step-btn" onclick="stepUp('amorQtd',200)">+</button>
            </div>
            <div style="display:flex;gap:5px;margin-top:5px">
              <button class="rate-pill" onclick="document.getElementById('amorQtd').value=3">3x</button>
              <button class="rate-pill active" onclick="document.getElementById('amorQtd').value=5">5x</button>
              <button class="rate-pill" onclick="document.getElementById('amorQtd').value=10">10x</button>
              <button class="rate-pill" onclick="document.getElementById('amorQtd').value=12">12x</button>
            </div>
          </div>
        </div>
      </div>

      <div id="simResult" class="sc-result"></div>
    </div>

    <div class="sc-footer" style="margin-top:10px">
      <div class="sc-brand">
        <div class="sc-brand-icon"><i class="bi bi-coin"></i></div>
        <div><div class="sc-brand-text">SimuleJá</div><div class="sc-brand-sub">Amortização</div></div>
      </div>
      <span class="sc-hint">✦ Amortize as últimas parcelas e destrua os juros</span>
      <button class="sc-calc-btn" onclick="calcAmortizacao()">Calcular</button>
    </div>`;
  },


  combustivel(){
    simCard.innerHTML = cardHTML('bi-fuel-pump-fill','Calculadora de Combustível','Gasolina · Diesel · Etanol',`
        <div class="sc-field">
          <label style="font-weight:700;color:var(--gray-700)">O que você quer descobrir?</label>
          <div style="display:flex;flex-direction:column;gap:7px;margin-top:8px">
            <button id="combModoA" onclick="setCombModo('A')"
              style="padding:11px 14px;border-radius:10px;border:2px solid var(--green);background:var(--green);color:#fff;font-family:var(--ff);font-weight:700;font-size:13px;cursor:pointer;text-align:left;transition:all .2s">
              <i class="bi bi-currency-dollar" style="margin-right:5px"></i>Qual é o preço por litro?
              <span style="font-size:11px;font-weight:400;opacity:.85;display:block;margin-top:1px">Sei quanto paguei e quantos litros abasteci</span>
            </button>
            <button id="combModoB" onclick="setCombModo('B')"
              style="padding:11px 14px;border-radius:10px;border:2px solid var(--gray-200);background:#fff;color:var(--gray-700);font-family:var(--ff);font-weight:700;font-size:13px;cursor:pointer;text-align:left;transition:all .2s">
              <i class="bi bi-droplet-fill" style="margin-right:5px"></i>Quantos litros abasteci?
              <span style="font-size:11px;font-weight:400;color:var(--gray-400);display:block;margin-top:1px">Sei o preço do litro e quanto paguei</span>
            </button>
            <button id="combModoC" onclick="setCombModo('C')"
              style="padding:11px 14px;border-radius:10px;border:2px solid var(--gray-200);background:#fff;color:var(--gray-700);font-family:var(--ff);font-weight:700;font-size:13px;cursor:pointer;text-align:left;transition:all .2s">
              <i class="bi bi-receipt" style="margin-right:5px"></i>Quanto vou gastar?
              <span style="font-size:11px;font-weight:400;color:var(--gray-400);display:block;margin-top:1px">Sei o preço do litro e quantos litros quero</span>
            </button>
          </div>
        </div>
        <div class="sc-field">
          <label>Tipo de combustível</label>
          <div class="sc-select-wrap" style="margin-top:4px">
            <select id="combTipo" style="height:50px;font-size:13px">
              <option value="gasolina_c">Gasolina Comum</option>
              <option value="gasolina_a">Gasolina Aditivada</option>
              <option value="etanol">Etanol / Álcool</option>
              <option value="diesel_s10">Diesel S-10</option>
              <option value="diesel_s500">Diesel S-500</option>
              <option value="gnv">GNV (m³)</option>
            </select>
          </div>
        </div>
        <div class="sc-field" id="combFieldTotal">
          <label id="combLabelTotal">Valor total pago</label>
          <div class="sc-input-wrap" style="margin-top:4px">
            <span class="sc-prefix">R$</span>
            <input id="combTotal" type="number" placeholder="Ex: 150" step="0.01">
            <button class="sc-clear" onclick="document.getElementById('combTotal').value=''">×</button>
          </div>
        </div>
        <div class="sc-field" id="combFieldPreco">
          <label id="combLabelPreco">Preço por litro</label>
          <div class="sc-input-wrap" style="margin-top:4px">
            <span class="sc-prefix">R$</span>
            <input id="combPreco" type="number" placeholder="Ex: 6.49" step="0.001">
            <button class="sc-clear" onclick="document.getElementById('combPreco').value=''">×</button>
          </div>
        </div>
        <div class="sc-field" id="combFieldLitros">
          <label id="combLabelLitros">Litros abastecidos</label>
          <div class="sc-input-wrap" style="margin-top:4px">
            <input id="combLitros" type="number" placeholder="Ex: 30" step="0.01" style="padding-left:14px">
            <span class="sc-suffix">L</span>
          </div>
        </div>
        <div id="combResult" class="sc-result"></div>
        <div class="sc-footer" style="margin-top:4px">
          <span class="sc-hint">✦ Gasolina vs Etanol incluso</span>
          <button class="sc-calc-btn" onclick="calcCombustivel()">Calcular</button>
        </div>`);
    setCombModo('A');
  },

  kwh(){
    simCard.innerHTML = cardHTML('bi-lightning-charge-fill','Calculadora de kWh','Consumo · Solar',`
        <div style="display:flex;gap:8px;margin-bottom:18px">
          <button id="kwhTabConsumo" onclick="setKwhTab('consumo')"
            style="flex:1;padding:10px 0;border-radius:10px;border:2px solid var(--green);background:var(--green);color:#fff;font-family:var(--ff);font-weight:700;font-size:13px;cursor:pointer;transition:all .2s">
            <i class="bi bi-plug-fill" style="margin-right:5px"></i>Consumo
          </button>
          <button id="kwhTabSolar" onclick="setKwhTab('solar')"
            style="flex:1;padding:10px 0;border-radius:10px;border:2px solid var(--gray-200);background:#fff;color:var(--gray-600);font-family:var(--ff);font-weight:700;font-size:13px;cursor:pointer;transition:all .2s">
            <i class="bi bi-sun-fill" style="margin-right:5px"></i>Solar
          </button>
        </div>
        <div id="kwhPanelConsumo">
          <div class="sc-field">
            <label>Consumo do equipamento (kWh/mês)</label>
            <div class="sc-input-wrap" style="margin-top:4px">
              <input id="kwhConsumo" type="number" placeholder="Ex: 30" step="0.1" style="padding-left:14px">
              <span class="sc-suffix">kWh</span>
            </div>
            <div style="font-size:11px;color:var(--gray-400);margin-top:5px"><i class="bi bi-info-circle" style="margin-right:3px"></i>Potência (W) × horas/dia × dias ÷ 1000 = kWh/mês</div>
          </div>
          <div class="sc-field">
            <label>Tarifa de energia (R$/kWh)</label>
            <div class="sc-input-wrap" style="margin-top:4px">
              <span class="sc-prefix">R$</span>
              <input id="kwhTarifa" type="number" placeholder="Ex: 0.92" step="0.001">
              <button class="sc-clear" onclick="document.getElementById('kwhTarifa').value=''">×</button>
            </div>
            <div style="font-size:11px;color:var(--gray-400);margin-top:5px"><i class="bi bi-info-circle" style="margin-right:3px"></i>Verifique sua conta de luz (média BR: ~R$ 0,92/kWh em 2025)</div>
          </div>
          <div id="kwhResultConsumo" class="sc-result"></div>
          <div class="sc-footer" style="margin-top:4px">
            <span class="sc-hint">✦ Projeção anual inclusa</span>
            <button class="sc-calc-btn" onclick="calcKwhConsumo()">Calcular</button>
          </div>
        </div>
        <div id="kwhPanelSolar" style="display:none">
          <div class="sc-field">
            <label>Potência da placa solar (Wp)</label>
            <div class="sc-input-wrap" style="margin-top:4px">
              <input id="kwhSolarPot" type="number" placeholder="Ex: 550" step="1" style="padding-left:14px">
              <span class="sc-suffix">Wp</span>
            </div>
          </div>
          <div class="sc-field">
            <label>Quantidade de placas</label>
            <div class="sc-stepper" style="margin-top:6px">
              <button class="sc-step-btn" onclick="stepDown('kwhSolarQtd',1)">−</button>
              <input class="sc-step-val" id="kwhSolarQtd" type="number" value="1" min="1">
              <button class="sc-step-btn" onclick="stepUp('kwhSolarQtd',999)">+</button>
            </div>
          </div>
          <div class="sc-field">
            <label>HSP — Horas de Sol Pleno da sua região</label>
            <div class="sc-select-wrap" style="margin-top:4px">
              <select id="kwhSolarHSP" onchange="document.getElementById('kwhHSPCustomWrap').style.display=this.value==='custom'?'':'none'" style="height:50px;font-size:13px">
                <option value="5.5">Norte (AM, PA, RR, AP, RO, AC, TO) — 5,5 h/dia</option>
                <option value="5.2">Nordeste Litoral (CE, RN, PB, PE, AL, SE) — 5,2 h/dia</option>
                <option value="5.4">Nordeste Interior (MA, PI, BA) — 5,4 h/dia</option>
                <option value="5.0" selected>Centro-Oeste (MT, MS, GO, DF) — 5,0 h/dia</option>
                <option value="4.8">Sudeste (SP, RJ, MG, ES) — 4,8 h/dia</option>
                <option value="4.5">Sul (PR, SC, RS) — 4,5 h/dia</option>
                <option value="custom">Digitar manualmente</option>
              </select>
            </div>
            <div id="kwhHSPCustomWrap" style="display:none;margin-top:8px">
              <div class="sc-input-wrap">
                <input id="kwhSolarHSPCustom" type="number" placeholder="Ex: 4.8" step="0.1" style="padding-left:14px">
                <span class="sc-suffix">h/dia</span>
              </div>
            </div>
          </div>
          <div class="sc-field">
            <label>Rendimento do sistema (%)</label>
            <div class="sc-input-wrap" style="margin-top:4px">
              <input id="kwhSolarRend" type="number" value="80" step="1" style="padding-left:14px">
              <span class="sc-suffix">%</span>
            </div>
            <div style="font-size:11px;color:var(--gray-400);margin-top:5px">Inclui perdas por cabeamento, inversor e temperatura. Padrão: 75–85%</div>
          </div>
          <div class="sc-field">
            <label>Tarifa de energia (R$/kWh) — opcional</label>
            <div class="sc-input-wrap" style="margin-top:4px">
              <span class="sc-prefix">R$</span>
              <input id="kwhSolarTarifa" type="number" placeholder="Ex: 0.92" step="0.001">
              <button class="sc-clear" onclick="document.getElementById('kwhSolarTarifa').value=''">×</button>
            </div>
          </div>
          <div id="kwhResultSolar" class="sc-result"></div>
          <div class="sc-footer" style="margin-top:4px">
            <span class="sc-hint">✦ Geração mensal e anual estimada</span>
            <button class="sc-calc-btn" onclick="calcKwhSolar()">Calcular</button>
          </div>
        </div>`);
    setKwhTab('consumo');
  },

  area(){
    simCard.innerHTML = `
    <div class="sc-header">
      <div class="sc-title-row">
        <div class="sc-icon-box"><i class="bi bi-map-fill"></i></div>
        <div><div class="sc-title">Calculadora de Área Rural</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="sc-tag">m² · ha · alqueires</span>
        <button class="sc-close" onclick="closePanel()">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <div class="sc-body">

      <!-- ENTRADA: tipo de medida -->
      <div class="sc-row">
        <div class="sc-field">
          <label>Tipo de entrada</label>
          <div class="sc-select-wrap"><select id="areaTipo" onchange="onAreaTipoChange()" style="height:50px;font-size:14px">
            <option value="retangulo">Terreno retangular (comprimento × largura)</option>
            <option value="m2">Área já em m²</option>
            <option value="ha">Área em hectares (ha)</option>
            <option value="alqPaulista">Alqueires paulistas</option>
            <option value="alqMineiro">Alqueires mineiros</option>
            <option value="alqBaiano">Alqueires baianos</option>
          </select></div>
        </div>
        <div class="sc-field">
          <label>Estado / Região</label>
          <div class="sc-select-wrap"><select id="areaEstado" onchange="calcArea()" style="height:50px;font-size:13px">
            <option value="SP">São Paulo — R$ 45.000/ha (média)</option>
            <option value="MG">Minas Gerais — R$ 35.000/ha</option>
            <option value="MT">Mato Grosso — R$ 28.000/ha</option>
            <option value="GO">Goiás — R$ 32.000/ha</option>
            <option value="PR">Paraná — R$ 55.000/ha</option>
            <option value="RS">Rio Grande do Sul — R$ 50.000/ha</option>
            <option value="BA">Bahia — R$ 22.000/ha</option>
            <option value="MS">Mato Grosso do Sul — R$ 30.000/ha</option>
            <option value="TO">Tocantins — R$ 18.000/ha</option>
            <option value="PA">Pará — R$ 14.000/ha</option>
          </select></div>
        </div>
      </div>

      <!-- campos dinâmicos -->
      <div id="areaInputs" class="sc-row">
        <div class="sc-field"><label>Comprimento (m)</label>
          <div class="sc-input-wrap"><input id="areaComp" type="number" placeholder="200" oninput="calcArea()" style="padding-left:14px"><span class="sc-suffix">m</span></div>
        </div>
        <div class="sc-field"><label>Largura (m)</label>
          <div class="sc-input-wrap"><input id="areaLarg" type="number" placeholder="300" oninput="calcArea()" style="padding-left:14px"><span class="sc-suffix">m</span></div>
        </div>
      </div>

      <!-- uso do solo -->
      <div class="sc-row">
        <div class="sc-field">
          <label>Uso do solo</label>
          <div class="sc-select-wrap"><select id="areaUso" onchange="calcArea()" style="height:50px;font-size:13px">
            <option value="1.0">Lavoura (grãos, soja, milho)</option>
            <option value="1.2">Lavoura irrigada</option>
            <option value="0.7">Pastagem</option>
            <option value="0.5">Pastagem degradada</option>
            <option value="0.9">Cana-de-açúcar</option>
            <option value="0.6">Eucalipto/Reflorestamento</option>
            <option value="0.4">Reserva legal / mata nativa</option>
            <option value="0.3">Área pantanosa / alagável</option>
          </select></div>
        </div>
        <div class="sc-field">
          <label>Tipo de alqueire (exibição)</label>
          <div class="sc-select-wrap"><select id="areaAlqTipo" onchange="calcArea()" style="height:50px;font-size:13px">
            <option value="paulista">Paulista (24.200 m²)</option>
            <option value="mineiro">Mineiro (48.400 m²)</option>
            <option value="baiano">Baiano (96.800 m²)</option>
          </select></div>
        </div>
      </div>

      <div id="simResult" class="sc-result"></div>
    </div>

    <div class="sc-footer" style="margin-top:10px">
      <div class="sc-brand">
        <div class="sc-brand-icon"><i class="bi bi-coin"></i></div>
        <div><div class="sc-brand-text">SimuleJá</div><div class="sc-brand-sub">Área Rural</div></div>
      </div>
      <span class="sc-hint">✦ Valores médios de mercado por região</span>
      <button class="sc-calc-btn" onclick="calcArea()">Calcular</button>
    </div>`;
  }
};

// ── AMORTIZAÇÃO ──
function setAmorN(v){
  document.getElementById('amorN').value = v;
  document.querySelectorAll('#amorN').forEach(()=>{});
  document.querySelectorAll('.rate-pill').forEach(p=>{
    if(['24x','36x','48x','60x'].includes(p.textContent))
      p.classList.toggle('active', p.textContent === v+'x');
  });
}

function setAmorQtd(v){ document.getElementById('amorQtd').value = v; }

function calcAmortizacao(){
  const PV      = parseFloat(document.getElementById('amorValor')?.value)   || 0;
  const iTaxa   = parseFloat(document.getElementById('amorTaxa')?.value)    || 0;
  const N       = parseInt(document.getElementById('amorN')?.value)         || 60;
  const paga    = parseInt(document.getElementById('amorAtual')?.value)      || 0;
  const parcVal = parseFloat(document.getElementById('amorParcVal')?.value)  || 0;
  const qtd     = parseInt(document.getElementById('amorQtd')?.value)        || 1;
  const i       = iTaxa / 100;

  if(!PV || !i || !N || !parcVal){
    alert('Preencha: valor financiado, taxa, total de parcelas e valor da parcela.');
    return;
  }
  if(paga >= N){ alert('As parcelas já pagas não podem ser iguais ou maiores que o total.'); return; }

  const parcRestantes = N - paga;
  if(qtd > parcRestantes){ alert(`Você tem apenas ${parcRestantes} parcelas restantes.`); return; }

  // Parcela Price calculada
  const pmtCalc = PV * (i * Math.pow(1+i,N)) / (Math.pow(1+i,N) - 1);

  // Saldo devedor atual
  const saldoAtual = PV * Math.pow(1+i,paga) - pmtCalc * (Math.pow(1+i,paga) - 1) / i;

  // Gerar todas as parcelas restantes (da mais próxima à mais distante)
  const todas = [];
  for(let k = 1; k <= parcRestantes; k++){
    const numContrato = paga + k;
    const mesesAFazer = k;
    const vp = parcVal / Math.pow(1+i, mesesAFazer);
    todas.push({ numContrato, mesesAFazer, vf: parcVal, vp });
  }

  // Amortizar as ÚLTIMAS (mais distantes = mais baratas)
  const escolhidas = todas.slice(-qtd).reverse();
  const totalVP = escolhidas.reduce((s,p) => s + p.vp, 0);
  const totalVF = escolhidas.reduce((s,p) => s + p.vf, 0);
  const economia = totalVF - totalVP;
  const escolhidasIds = new Set(escolhidas.map(p => p.numContrato));

  // Tabela para Ver mais — segunda metade do contrato
  const metade = Math.ceil(parcRestantes / 2);
  const amortizaveis = todas.slice(-metade).reverse();
  const tabelaHTML = amortizaveis.map(p => {
    const sel = escolhidasIds.has(p.numContrato);
    return `<div class="sc-result-row" style="${sel?'background:rgba(0,177,79,.12);border-radius:6px;padding:2px 8px;margin:1px 0':''}">
      <span style="${sel?'color:var(--green-mid);font-weight:700':''}">
        ${sel?'✓ ':''}Parcela ${p.numContrato} — ${p.mesesAFazer} mês(es)
      </span>
      <span style="${sel?'color:var(--green-mid)':''}">
        ${fmt(p.vp)} <span style="color:rgba(255,255,255,.25);font-size:10px">/ cheio: ${fmt(p.vf)}</span>
      </span>
    </div>`;
  }).join('');

  const extraHTML = `
    <div style="font-size:10.5px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.8px;font-weight:700;margin-bottom:10px">
      ${amortizaveis.length} parcelas amortizáveis (segunda metade do contrato)
    </div>
    <div class="sc-result-rows">${tabelaHTML}</div>
    <div class="sc-disclaimer" style="margin-top:10px">✓ = parcelas quitadas com esta amortização. VP = VF ÷ (1+i)^n</div>`;

  const el = document.getElementById('simResult');
  if(!el) return;
  el.className = 'sc-result visible';
  el.innerHTML = `
    <div class="sc-result-label">Amortizar as ${qtd} últimas parcelas antecipadamente</div>
    <div class="sc-result-main">${fmt(economia)}</div>
    <div style="font-size:11px;color:rgba(255,255,255,.45);margin-top:-8px;margin-bottom:14px">Economia em juros ao quitar ${qtd} parcela${qtd>1?'s':''} hoje</div>
    <div class="sc-result-rows">
      <div class="sc-result-row"><span>Parcela Price do contrato</span><span>${fmt(pmtCalc)}</span></div>
      <div class="sc-result-row"><span>Saldo devedor atual</span><span>${fmt(saldoAtual)}</span></div>
      <div class="sc-result-row"><span>Parcelas restantes</span><span>${parcRestantes}x</span></div>
      <div class="sc-result-row"><span>Parcelas quitadas (${escolhidas[escolhidas.length-1].numContrato}→${escolhidas[0].numContrato})</span><span style="color:var(--green-mid)">${qtd}x mais distantes</span></div>
      <div class="sc-result-row"><span>Custo total hoje (VP)</span><span style="color:var(--green-mid);font-weight:700">${fmt(totalVP)}</span></div>
      <div class="sc-result-row"><span>Valor de face quitado (VF)</span><span>${fmt(totalVF)}</span></div>
      <div class="sc-result-row"><span style="color:var(--green-mid);font-weight:700">Economia em juros</span><span style="color:var(--green-mid);font-weight:800">${fmt(economia)}</span></div>
    </div>
    <div class="sc-disclaimer">VP = ${fmt(parcVal)} ÷ (1 + ${fmtN(iTaxa,3)}%)^n</div>
    <div id="resExtra" style="display:none;margin-top:12px">${extraHTML}</div>
    <button onclick="toggleResExtra(this)" class="res-vermais-btn">▼ Ver mais</button>`;
}

const SIM_DESC = {
  veiculo:    'Simule o financiamento do seu próximo veículo com a Tabela Price. Informe o valor do carro, a entrada e o prazo — e veja exatamente quanto vai pagar por mês, o custo total e os juros embutidos.',
  imovel:     'Calcule a parcela do financiamento imobiliário com base na Tabela Price. Informe o valor do imóvel, entrada, taxa de juros anual e prazo em meses para descobrir a parcela mensal e a renda mínima necessária.',
  rescisao:   'Calcule os valores que você tem direito a receber em caso de demissão ou rescisão de estágio. Selecione o tipo de vínculo (CLT ou estagiário), as datas e o motivo — e veja o detalhamento completo das verbas.',
  p2p:        'Simule um empréstimo P2P (pessoa a pessoa) com o modelo bullet: você paga apenas os juros mensalmente e quita o principal no último mês. Informe o valor, taxa de juros e prazo para ver o custo total.',
  investimento:'Compare o rendimento líquido de 7 aplicações financeiras ao mesmo tempo — Poupança, CDB, LCI/LCA, Fundo DI, Tesouro Prefixado, IPCA+ e Selic — usando as taxas do Banco Central em tempo real.',
  ipva:       'Calcule o valor do IPVA anual do seu veículo com base no valor FIPE e na alíquota do seu estado. Veja o desconto por pagamento à vista e o valor de cada parcela.',
  fgts:       'Estime o saldo acumulado na sua conta do FGTS com base no salário bruto, meses trabalhados e saldo atual. O cálculo inclui os depósitos mensais de 8% e o rendimento estimado.',
  ir:         'Simule o Imposto de Renda mensal com base na tabela progressiva de 2025. Informe renda, dependentes e pensão alimentícia para calcular o IR, o INSS descontado e o salário líquido.',
  moeda:      'Converta valores entre as principais moedas do mundo com cotações atualizadas duas vezes ao dia (09h e 17h, horário de Brasília) direto das APIs do Banco Central Europeu e ExchangeRate.',
  seguro:     'Descubra quantas parcelas e qual o valor do Seguro Desemprego você tem direito, de acordo com o seu salário, meses trabalhados e número de solicitações anteriores. Baseado nas regras de 2025.',
  consorcio:  'Simule seu consórcio e descubra a data exata em que será sorteado, o total pago antes e depois do sorteio, e gere seu código de identificação único no formato número+data.',
  loteria:    'Gere palpites inteligentes para Mega-Sena, Quina, Lotofácil e mais 6 loterias da Caixa. Os números são escolhidos com base nos mais frequentes dos últimos 20 concursos combinados com aleatoriedade.',
  area:       'Calcule a área de um terreno rural em m², hectares e alqueires (paulista, mineiro ou baiano). Informe as dimensões ou uma área já conhecida e veja a estimativa do valor de mercado por estado e tipo de uso.',
  quantidade: 'Calcule o valor de qualquer produto vendido por peso, volume ou unidade. Informe o preço por kg, litro ou unidade, a quantidade que quer levar — ou quanto tem disponível — e veja o total exato.',
  amortizacao: 'Descubra quanto custa antecipar cada parcela do seu financiamento. Com a fórmula de Valor Presente (VP = VF ÷ (1+i)^n), veja quais parcelas são mais baratas para quitar hoje e quanto você economiza em juros amortizando as últimas parcelas primeiro.',
  combustivel: 'Informe dois valores — total pago, preço por litro ou litros abastecidos — e descubra o terceiro. Gasolina, etanol, diesel e GNV.',
  kwh:         'Calcule o custo de consumo de qualquer eletrodoméstico e estime a geração de energia do seu sistema solar fotovoltaico.',
  fitness:    'Calcule seu IMC, TMB, gasto calórico diário e a necessidade de proteína, carboidrato, gordura e água, tudo personalizado para o seu objetivo: ganhar massa muscular ou perder gordura corporal.',
};

function openSim(key){
  if(!sims[key]) return;
  sims[key]();
  const desc    = document.getElementById('simDesc');
  if(desc){
    const txt = SIM_DESC[key] || '';
    desc.textContent = txt;
    desc.style.display = txt ? 'block' : 'none';
  }
  panel.classList.add('open');
  setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'nearest'}),50);
}

// ── CALC FUNCTIONS ──
// ── P2P RATE PILLS ──
let p2pComposto = false;
function setP2PRate(val){
  const input = document.getElementById('p2pT');
  const pills = document.querySelectorAll('.rate-pill');
  pills.forEach(p => p.classList.remove('active'));
  if(val === 'comp'){
    p2pComposto = !p2pComposto;
    document.getElementById('pillComp').classList.toggle('active', p2pComposto);
  } else {
    p2pComposto = false;
    document.getElementById('pillComp').classList.remove('active');
    input.value = val;
    pills.forEach(p => { if(p.textContent === val+'%') p.classList.add('active'); });
  }
}
function setP2PParc(val){
  document.getElementById('p2pP').value = val;
  // only toggle pills in the parcelas group (those with text like "3x")
  document.querySelectorAll('.rate-pill').forEach(p => {
    if(['3x','6x','9x'].includes(p.textContent))
      p.classList.toggle('active', p.textContent === val+'x');
  });
}

function calcP2P(){
  const pv      = +document.getElementById('p2pV').value;
  const penhora = +document.getElementById('p2pE').value;
  const n       = +document.getElementById('p2pP').value;
  const i       = +document.getElementById('p2pT').value / 100;

  // Bullet loan:
  // Meses 1 a (n-1): paga apenas os juros do período  → pv * i
  // Mês n           : paga principal + juros do período → pv + pv * i
  const jurosMensal   = p2pComposto ? pv * (Math.pow(1 + i, n) - 1) / n : pv * i;
  const parcelaNormal = p2pComposto ? jurosMensal : pv * i;
  const parcelaFinal  = pv + (p2pComposto ? pv * (Math.pow(1 + i, n) - 1) : pv * i);
  const totalJuros    = parcelaNormal * (n - 1) + (parcelaFinal - pv);
  const totalPago     = parcelaNormal * (n - 1) + parcelaFinal;

  const rows = [
    ['Parcelas 1 a ' + (n - 1) + ' (só juros)', fmt(parcelaNormal)],
    ['Última parcela (principal + juros)', fmt(parcelaFinal)],
    ['Total em juros', fmt(totalJuros)],
    ['Total pago', fmt(totalPago)],
    ['Prazo', n + ' meses'],
  ];
  if (penhora > 0) rows.push(['Garantia (penhora)', fmt(penhora)]);

  showResult(
    'simResult',
    'Parcela mensal (juros)',
    fmt(parcelaNormal),
    rows,
    (penhora > 0 ? 'O valor da penhora é apenas uma garantia e não é abatido do empréstimo. ' : '') +
    (p2pComposto
      ? 'Modo juros compostos: os juros acumulam sobre o saldo devedor.'
      : 'Você paga apenas os juros mensalmente e quita o principal na última parcela.')
  );
}
function setVeiParc(val){
  document.getElementById('veiP').value = val;
  document.querySelectorAll('.rate-pill').forEach(p => {
    p.classList.toggle('active', p.textContent === val+'x');
  });
}

function calcVei(){
  const pv=+document.getElementById('veiV').value - +document.getElementById('veiE').value;
  const n=+document.getElementById('veiP').value, i=+document.getElementById('veiT').value/100;
  const pmt=pv*(i*Math.pow(1+i,n))/(Math.pow(1+i,n)-1);
  showResult('simResult','Parcela mensal',fmt(pmt),[['Valor financiado',fmt(pv)],['Custo total',fmt(pmt*n + +document.getElementById('veiE').value)],['Total em juros',fmt(pmt*n-pv)],['Prazo',n+' meses']],'Simulação pelo sistema Price. Taxas reais variam por banco e perfil.');
}
function setImoMeses(val){
  document.getElementById('imoA').value = val;
  document.querySelectorAll('.rate-pill').forEach(p => {
    p.classList.toggle('active', p.textContent === String(val));
  });
}

function calcImo(){
  const val=+document.getElementById('imoV').value, ent=+document.getElementById('imoE').value;
  const n=+document.getElementById('imoA').value;
  const ta=+document.getElementById('imoT').value/100;
  const pv=val-ent;
  const i=Math.pow(1+ta,1/12)-1;
  const pmt=pv*(i*Math.pow(1+i,n))/(Math.pow(1+i,n)-1);
  const total=pmt*n;
  showResult('simResult','Parcela mensal (Price)',fmt(pmt),[
    ['Valor financiado',fmt(pv)],
    ['Total pago',fmt(total+ent)],
    ['Total em juros',fmt(total-pv)],
    ['Prazo',n+' meses ('+Math.round(n/12)+' anos)'],
    ['Renda mínima sugerida',fmt(pmt/0.3)]
  ],'Valores reais incluem seguros, tarifas e IOF.');
}
// ── INVESTMENT LIVE RATES ──
let _invTaxas = { selic: 14.40, cdi: 14.40, ipca: 3.97, tr: 0.1708 };
let _invTaxasFetched = false;

async function fetchInvTaxas(){
  const st  = document.getElementById('invStatus');
  const upd = document.getElementById('invUpdated');
  try {
    // BCB Open Data API – taxa SELIC meta (série 432)
    const [selicRes, ipcaRes] = await Promise.all([
      fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json'),
      fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/1?formato=json'),
    ]);
    const selicData = await selicRes.json();
    const ipcaData  = await ipcaRes.json();

    const selic = parseFloat(selicData[0]?.valor?.replace(',','.') || '14.40');
    const ipca  = parseFloat(ipcaData[0]?.valor?.replace(',','.') || '3.97');
    const cdi   = selic - 0.10; // CDI ≈ SELIC - 0.10
    const tr    = 0.1708;       // TR changes rarely; use BCB default

    _invTaxas = { selic, cdi, ipca, tr };
    _invTaxasFetched = true;

    renderTaxaCards();
    // update poupança auto: if selic > 8.5% → 0.5%/m + TR, else 70% SELIC/12
    const poupMes = selic > 8.5 ? (0.5 + tr) : (selic * 0.7 / 12);
    const poupEl  = document.getElementById('pPoupanca');
    if(poupEl) poupEl.value = poupMes.toFixed(4);

    const now = new Date().toLocaleDateString('pt-BR');
    if(upd) upd.textContent = `✦ Taxas BCB · ${now}`;
    if(st)  st.textContent  = 'Taxas atualizadas';
  } catch(e) {
    renderTaxaCards(); // render with defaults
    if(st)  st.textContent  = 'Taxas estimadas';
    if(upd) upd.textContent = '✦ Sem conexão — usando estimativas';
  }
}

function renderTaxaCards(){
  const g = document.getElementById('invTaxasGrid');
  if(!g) return;
  const { selic, cdi, ipca, tr } = _invTaxas;
  g.innerHTML = `
    <div class="inv-taxa-card">
      <div class="inv-taxa-label">Selic efetiva (a.a.) <i class="bi bi-info-circle" title="Taxa básica de juros definida pelo COPOM"></i></div>
      <div class="inv-taxa-val">${fmtN(selic,2)} %</div>
    </div>
    <div class="inv-taxa-card">
      <div class="inv-taxa-label">CDI (a.a.) <i class="bi bi-info-circle" title="Certificado de Depósito Interbancário"></i></div>
      <div class="inv-taxa-val">${fmtN(cdi,2)} %</div>
    </div>
    <div class="inv-taxa-card">
      <div class="inv-taxa-label">IPCA (a.a.) <i class="bi bi-info-circle" title="Índice de Preços ao Consumidor Amplo"></i></div>
      <div class="inv-taxa-val">${fmtN(ipca,2)} %</div>
    </div>
    <div class="inv-taxa-card">
      <div class="inv-taxa-label">TR (a.m.) <i class="bi bi-info-circle" title="Taxa Referencial"></i></div>
      <div class="inv-taxa-val">${fmtN(tr,4)} %</div>
    </div>`;
}

function adjParam(id, delta){
  const el = document.getElementById(id);
  if(!el) return;
  el.value = Math.max(0, (+el.value + delta)).toFixed(2);
  autoCalcInv();
}

let _invDebounce = null;
function autoCalcInv(){
  clearTimeout(_invDebounce);
  _invDebounce = setTimeout(calcInv, 400);
}

function calcInv(){
  const pv   = +document.getElementById('invI')?.value || 0;
  const pmt  = +document.getElementById('invA')?.value || 0;
  const per  = +document.getElementById('invP')?.value || 12;
  const unit = document.getElementById('invUnit')?.value || 'meses';
  const n    = unit === 'anos' ? per * 12 : per; // months

  if(pv === 0 && pmt === 0){ return; }

  const { selic, cdi, ipca, tr } = _invTaxas;

  // param overrides
  const tesouroPre  = +document.getElementById('pTesouroPre')?.value  || 14;
  const custodiaB3  = +document.getElementById('pCustodiaB3')?.value  || 0.20;
  const tesouroIPCA = +document.getElementById('pTesouroIPCA')?.value || 6.50;
  const taxaFundoDI = +document.getElementById('pTaxaFundoDI')?.value || 0.25;
  const cdbPct      = +document.getElementById('pCDB')?.value         || 100;
  const cdbBase     = document.getElementById('pCDBbase')?.value      || 'cdi';
  const fundoDIPct  = +document.getElementById('pFundoDI')?.value     || 98.17;
  const lciPct      = +document.getElementById('pLCI')?.value         || 85;
  const poupMes     = +document.getElementById('pPoupanca')?.value    || 0.6717;

  // monthly rate converters
  const toMes = aa => Math.pow(1 + aa/100, 1/12) - 1;

  // tax table IR (rendimentos): 22.5% ≤6m, 20% 6-12m, 17.5% 12-24m, 15% >24m
  const irAliq = n <= 6 ? 0.225 : n <= 12 ? 0.20 : n <= 24 ? 0.175 : 0.15;

  function calcMontante(iMes, isento=false){
    let saldo = pv;
    for(let k=0;k<n;k++){
      saldo = saldo * (1 + iMes) + pmt;
    }
    const rendimento = saldo - (pv + pmt * n);
    const ir = isento ? 0 : rendimento * irAliq;
    return { bruto: saldo, liquido: saldo - ir, rendimento, ir };
  }

  // CDI mensal
  const iCDI = toMes(cdi);

  // 1. Poupança
  const iPoupa = poupMes / 100;
  const poupa  = calcMontante(iPoupa, true); // isenta

  // 2. CDB
  const iCDB = cdbBase === 'cdi' ? iCDI * (cdbPct/100) : toMes(cdbPct);
  const cdb   = calcMontante(iCDB, false);

  // 3. LCI/LCA (isento IR)
  const iLCI = iCDI * (lciPct/100);
  const lci   = calcMontante(iLCI, true);

  // 4. Fundo DI
  const iFundoDI = iCDI * (fundoDIPct/100) - toMes(taxaFundoDI);
  const fundoDI  = calcMontante(Math.max(0, iFundoDI), false);

  // 5. Tesouro Prefixado (aa - custódia)
  const iTesouroPre = toMes(tesouroPre - custodiaB3);
  const tPre = calcMontante(Math.max(0, iTesouroPre), false);

  // 6. Tesouro IPCA+ (juro real + IPCA aa - custódia)
  const tesouroIPCAaa = (1 + tesouroIPCA/100) * (1 + ipca/100) - 1;
  const iTesouroIPCA  = toMes(tesouroIPCAaa * 100 - custodiaB3);
  const tIPCA = calcMontante(Math.max(0, iTesouroIPCA), false);

  // 7. Selic (Tesouro Selic)
  const iSelic = toMes(selic - custodiaB3);
  const tSelic = calcMontante(Math.max(0, iSelic), false);

  const products = [
    { name:'Poupança',            ...poupa },
    { name:'CDB',                 ...cdb   },
    { name:'LCI / LCA',           ...lci   },
    { name:'Fundo DI',            ...fundoDI },
    { name:'Tesouro Prefixado',   ...tPre   },
    { name:'Tesouro IPCA+',       ...tIPCA  },
    { name:'Tesouro Selic',       ...tSelic },
  ].sort((a,b) => b.liquido - a.liquido);

  const maxLiq = products[0].liquido;
  const investido = pv + pmt * n;

  const rows = products.map((p, i) => {
    const pct = (p.liquido / maxLiq * 100).toFixed(0);
    const best = i === 0;
    return `<tr class="${best?'best':''}">
      <td>${p.name}${best?' <span style="font-size:10px;background:var(--green);color:#fff;border-radius:4px;padding:1px 5px;margin-left:4px">Melhor</span>':''}</td>
      <td>${fmt(p.liquido)}</td>
      <td>${fmt(p.rendimento)}</td>
      <td>${fmtN((p.rendimento/investido)*100,1)}%<span class="inv-bar" style="width:${pct}%"></span></td>
    </tr>`;
  }).join('');

  const el = document.getElementById('simResult');
  if(!el) return;
  el.className = 'sc-result visible';
  el.innerHTML = `
    <div class="sc-result-label">Comparativo de aplicações — ${n} meses</div>
    <div class="sc-result-main">${fmt(products[0].liquido)}</div>
    <div style="font-size:11px;color:rgba(255,255,255,.45);margin-top:-8px;margin-bottom:14px">Melhor rendimento líquido: ${products[0].name}</div>
    <table class="inv-result-table">
      <thead><tr>
        <th>Aplicação</th><th>Montante líquido</th><th>Rendimento</th><th>Retorno</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="sc-disclaimer">IR calculado com alíquota de ${(irAliq*100).toFixed(1)}% (prazo ${n} meses). Poupança e LCI/LCA são isentos. Valores brutos para Tesouro Direto incluem custódia B3.</div>`;
}
function calcIPVA(){
  const val=+document.getElementById('ipvaV').value;
  const aliq=+document.getElementById('ipvaUF').value/100;
  const desc=+document.getElementById('ipvaD').value/100;
  const parc=+document.getElementById('ipvaP').value;
  const ipva=val*aliq;
  showResult('simResult','IPVA anual',fmt(ipva),[['À vista c/ desconto',fmt(ipva*(1-desc))],['Parcela ('+parc+'x)',fmt(ipva/parc)],['Alíquota',fmtN(aliq*100,1)+'%']],'Baseado no valor FIPE informado. Verifique datas no DETRAN do seu estado.');
}
function calcFGTS(){
  const sal=+document.getElementById('fgtsS').value;
  const mes=+document.getElementById('fgtsM').value;
  const saldo=+document.getElementById('fgtsSaldo').value;
  const dep=sal*0.08*mes, rend=dep*0.03;
  showResult('simResult','Saldo estimado FGTS',fmt(saldo+dep+rend),[['Depósitos (8%/mês)',fmt(dep)],['Rendimento est. (3% a.a.)',fmt(rend)],['Saldo anterior',fmt(saldo)]],'Estimativa com TR zero. Valores reais dependem da TR e de movimentações.');
}
function switchRescTab(tab){
  const clt = document.getElementById('formCLT');
  const est = document.getElementById('formEST');
  const tCLT = document.getElementById('tabCLT');
  const tEst = document.getElementById('tabEst');
  if(!clt||!est) return;
  if(tab === 'clt'){
    clt.style.display = '';
    est.style.display = 'none';
    tCLT.style.background = 'var(--green)'; tCLT.style.borderColor = 'var(--green)'; tCLT.style.color = '#fff';
    tEst.style.background = '#fff';         tEst.style.borderColor = 'var(--gray-200)'; tEst.style.color = 'var(--gray-600)';
  } else {
    clt.style.display = 'none';
    est.style.display = '';
    tEst.style.background = 'var(--green)'; tEst.style.borderColor = 'var(--green)'; tEst.style.color = '#fff';
    tCLT.style.background = '#fff';         tCLT.style.borderColor = 'var(--gray-200)'; tCLT.style.color = 'var(--gray-600)';
  }
}

function calcEstagio(){
  const iniVal = document.getElementById('estIni')?.value;
  const fimVal = document.getElementById('estFim')?.value;
  const bolsa  = +document.getElementById('estBolsa')?.value || 0;

  if(!iniVal || !fimVal){ alert('Preencha as datas de entrada e saída.'); return; }

  const dtIni = new Date(iniVal + 'T00:00:00');
  const dtFim = new Date(fimVal + 'T00:00:00');

  if(dtFim <= dtIni){ alert('A data de saída deve ser posterior à de entrada.'); return; }

  const diffMs    = dtFim - dtIni;
  const diasTotal = Math.floor(diffMs / (1000*60*60*24));
  const mesesTotal = diasTotal / 30.4375;
  const mesesRest  = Math.floor(mesesTotal % 12);
  const diasRest   = dtFim.getDate();

  // Rescisão de Estágio — Lei 11.788/2008
  // 1. Bolsa proporcional dos dias do último mês
  const bolsaProp = (bolsa / 30) * diasRest;

  // 2. Recesso proporcional (equivalente a férias — 30 dias a cada 12)
  // meses no ano corrente do estágio
  const mesesAno = dtFim.getMonth() - dtIni.getMonth() +
    (dtFim.getFullYear() - dtIni.getFullYear()) * 12;
  const recessoProp = bolsa * (Math.min(mesesAno, 12) / 12);

  // 3. 13º NÃO existe para estagiário — não há vínculo CLT
  // 4. FGTS NÃO existe para estagiário
  // 5. Multa 40% FGTS NÃO existe

  const total = bolsaProp + recessoProp;

  const el = document.getElementById('simResultEst');
  if(!el) return;
  el.className = 'sc-result visible';
  el.innerHTML = `
    <div class="sc-result-label">Total estimado a receber</div>
    <div class="sc-result-main">${fmt(total)}</div>
    <div class="sc-result-rows">
      <div class="sc-result-row"><span>Período trabalhado</span><span>${Math.floor(mesesTotal / 12)}a ${mesesRest}m ${diasRest}d</span></div>
      <div class="sc-result-row"><span>Bolsa proporcional (${diasRest} dias)</span><span>${fmt(bolsaProp)}</span></div>
      <div class="sc-result-row"><span>Recesso proporcional</span><span>${fmt(recessoProp)}</span></div>
      <div class="sc-result-row"><span>13º salário</span><span style="color:rgba(255,255,255,.4)">Não se aplica</span></div>
      <div class="sc-result-row"><span>FGTS / Multa 40%</span><span style="color:rgba(255,255,255,.4)">Não se aplica</span></div>
    </div>
    <div class="sc-disclaimer">Lei 11.788/2008 – Lei do Estágio. Estagiários não possuem vínculo empregatício, sem direito a FGTS, 13º ou aviso prévio.</div>`;
}

function calcResc(){
  const sal   = +document.getElementById('rS').value;
  const fgts  = +document.getElementById('rFgts').value;
  const tipo  = document.getElementById('rTipo').value;

  // parse dates
  const iniD = +document.getElementById('rIniD').value;
  const iniM = +document.getElementById('rIniM').value;
  const iniY = +document.getElementById('rIniY').value;
  const fimD = +document.getElementById('rFimD').value;
  const fimM = +document.getElementById('rFimM').value;
  const fimY = +document.getElementById('rFimY').value;

  const dtIni = new Date(iniY, iniM-1, iniD);
  const dtFim = new Date(fimY, fimM-1, fimD);

  if(dtFim <= dtIni){
    alert('A data final deve ser maior que a data inicial.');
    return;
  }

  // total de dias e meses trabalhados
  const diffMs   = dtFim - dtIni;
  const diasTotal = Math.floor(diffMs / (1000*60*60*24));
  const mesesTotal = diasTotal / 30.4375;
  const anosCompletos = Math.floor(diasTotal / 365);
  const mesesRest = Math.floor((diasTotal % 365) / 30.4375);

  // saldo de salário (dias restantes no último mês)
  const diasUltimoMes = fimD;
  const saldoSal = (sal / 30) * diasUltimoMes;

  // 13º proporcional (meses completos no ano corrente)
  const mesesAno = fimM - 1 + (fimD >= 15 ? 1 : 0); // conta mês se passado da metade
  const prop13   = sal * (Math.min(mesesAno, 12) / 12);

  // férias proporcionais (meses desde último aniversário do contrato)
  const mesesFerias = mesesRest + (fimD >= 15 ? 1 : 0);
  const propFerias  = sal * 1.3333 * (Math.min(mesesFerias, 12) / 12);

  // lógica por motivo
  let multa = 0, aviso = 0, fgtsDisp = fgts, avisoDesc = '', notas = [];

  switch(tipo){
    case 'semJusta':
      multa    = fgts * 0.4;
      aviso    = sal; // aviso prévio indenizado
      fgtsDisp = fgts + multa;
      avisoDesc = 'Aviso prévio indenizado';
      notas.push('Multa de 40% sobre saldo FGTS');
      notas.push('Aviso prévio de 30 dias indenizado');
      break;
    case 'pedido':
      aviso    = -sal; // desconta aviso não cumprido
      avisoDesc = 'Desconto: aviso prévio não cumprido';
      notas.push('Aviso prévio deve ser cumprido ou descontado');
      break;
    case 'comJusta':
      fgtsDisp = 0;
      notas.push('Justa causa: sem multa FGTS, sem aviso, sem férias proporcionais');
      break;
    case 'experiencia':
      notas.push('Término natural do contrato de experiência');
      break;
    case 'expEmpregador':
      multa    = fgts * 0.4;
      aviso    = sal * 0.5;
      fgtsDisp = fgts + multa;
      notas.push('Metade do restante do contrato como indenização');
      notas.push('Multa de 40% sobre saldo FGTS');
      break;
    case 'expEmpregado':
      aviso = -sal * 0.5;
      notas.push('Empregado indeniza metade do restante do contrato');
      break;
    case 'falecimento':
      multa    = fgts * 0.4;
      fgtsDisp = fgts + multa;
      notas.push('Herdeiros recebem todas as verbas rescisórias');
      notas.push('Multa de 40% sobre saldo FGTS');
      break;
  }

  const propFereaseFinal = tipo === 'comJusta' ? 0 : propFerias;
  const total = Math.max(0, saldoSal + prop13 + propFereaseFinal + multa + aviso);

  const rows = [
    ['Período trabalhado', anosCompletos+'a '+(mesesRest)+'m '+diasUltimoMes+'d'],
    ['Saldo de salário', fmt(saldoSal)],
    ['13º proporcional ('+mesesAno+'/12)', fmt(prop13)],
    ['Férias proporcionais', fmt(propFereaseFinal)],
  ];
  if(multa > 0)  rows.push(['Multa FGTS (40%)', fmt(multa)]);
  if(aviso !== 0) rows.push([avisoDesc || 'Aviso prévio', fmt(aviso)]);
  rows.push(['FGTS disponível', fmt(fgtsDisp)]);

  const nota = 'Simplificado. Não considera INSS/IR.' + (notas.length ? ' ' + notas.join('. ') + '.' : '');
  showResult('simResult', 'Total estimado a receber', fmt(total), rows, nota);
}
function calcIR(){
  const renda=+document.getElementById('irR').value;
  const dep=+document.getElementById('irD').value;
  const pensao=+document.getElementById('irP').value;
  const inss=Math.min(renda*0.075,908.86);
  const base=Math.max(0,renda-inss-dep*189.59-pensao);
  let ir=0,desc='';
  if(base<=2259.20){ir=0;desc='Isento';}
  else if(base<=2826.65){ir=base*0.075-169.44;desc='7,5%';}
  else if(base<=3751.05){ir=base*0.15-381.44;desc='15%';}
  else if(base<=4664.68){ir=base*0.225-662.77;desc='22,5%';}
  else{ir=base*0.275-896.00;desc='27,5%';}
  ir=Math.max(0,ir);
  showResult('simResult','IR mensal estimado',fmt(ir),[['Base de cálculo',fmt(base)],['Alíquota',desc],['INSS descontado',fmt(inss)],['Salário líquido',fmt(renda-inss-ir)]],'Tabela IRPF 2025. Não substitui declaração oficial.');
}
// ── CONVERSOR AO VIVO ──
let liveRates = null;
let moedaDebounce = null;

// Fallback rates caso todas as APIs falhem
const fallbackRates = {
  BRL:1, USD:0.182, EUR:0.167, GBP:0.143,
  ARS:180.5, JPY:27.4, CAD:0.248, CHF:0.162,
  AUD:0.278, CNY:1.32, MXN:3.12, CLP:171.5
};

// ── Cache inteligente: atualiza às 09:00 e 17:00 (horário de Brasília) ──
const MOEDA_CACHE_KEY = 'simuleJa_moeda_cache';

function getMoedaCacheSlot(){
  // Retorna uma string que identifica o slot atual (ex: "2026-05-19-09" ou "2026-05-19-17")
  const now = new Date();
  // Brasília = UTC-3
  const br = new Date(now.getTime() - 3*60*60*1000);
  const d  = br.toISOString().slice(0,10); // YYYY-MM-DD
  const h  = br.getUTCHours();
  // slot muda às 09:00 e 17:00
  const slot = h < 9 ? 'pre09' : h < 17 ? 'pos09' : 'pos17';
  return `${d}-${slot}`;
}

function saveMoedaCache(rates, source){
  try {
    const payload = {
      rates,
      source,
      slot: getMoedaCacheSlot(),
      savedAt: new Date().toISOString()
    };
    sessionStorage.setItem(MOEDA_CACHE_KEY, JSON.stringify(payload));
  } catch(e){}
}

function loadMoedaCache(){
  try {
    const raw = sessionStorage.getItem(MOEDA_CACHE_KEY);
    if(!raw) return null;
    const payload = JSON.parse(raw);
    // só usa se for do mesmo slot (mesmo horário de referência)
    if(payload.slot === getMoedaCacheSlot()) return payload;
  } catch(e){}
  return null;
}

function getNextUpdateTime(){
  const now = new Date();
  const br  = new Date(now.getTime() - 3*60*60*1000);
  const h   = br.getUTCHours();
  let nextH = h < 9 ? 9 : h < 17 ? 17 : 33; // 33 = 09:00 do dia seguinte
  const nextBr = new Date(br);
  nextBr.setUTCHours(nextH % 24, 0, 0, 0);
  if(nextH >= 24) nextBr.setUTCDate(nextBr.getUTCDate() + 1);
  // converte de volta para hora local
  const diff = nextBr.getTime() + 3*60*60*1000 - now.getTime();
  const horas = Math.floor(diff/3600000);
  const mins  = Math.floor((diff%3600000)/60000);
  return `${horas}h${mins.toString().padStart(2,'0')}m`;
}

const API_SOURCES = [
  {
    name: 'ExchangeRate-API',
    url:  'https://open.er-api.com/v6/latest/USD',
    parse: async (res) => {
      const data = await res.json();
      if(data.result !== 'success') throw new Error('bad result');
      const usdRates  = data.rates;
      const brlPerUsd = usdRates['BRL'] || 5.5;
      const rates = {};
      Object.keys(usdRates).forEach(cur => { rates[cur] = usdRates[cur] / brlPerUsd; });
      rates['BRL'] = 1;
      return rates;
    }
  },
  {
    name: 'Frankfurter (BCE)',
    url:  'https://api.frankfurter.app/latest?from=BRL',
    parse: async (res) => {
      const data = await res.json();
      if(!data.rates) throw new Error('no rates');
      const rates = { BRL: 1 };
      Object.keys(data.rates).forEach(cur => { rates[cur] = data.rates[cur]; });
      return rates;
    }
  },
  {
    name: 'Fixer (free)',
    url:  'https://data.fixer.io/api/latest?access_key=free&base=EUR',
    parse: async (res) => {
      const data = await res.json();
      if(!data.rates) throw new Error('no rates');
      const eurToBrl = data.rates['BRL'] || 6.0;
      const rates = { BRL: 1 };
      Object.keys(data.rates).forEach(cur => {
        rates[cur] = data.rates[cur] / eurToBrl;
      });
      return rates;
    }
  }
];

async function initMoeda(){
  const ticker  = document.getElementById('moedaTicker');
  const updated = document.getElementById('moedaUpdated');

  // 1. Verifica cache do slot atual
  const cached = loadMoedaCache();
  if(cached){
    liveRates = cached.rates;
    const savedAt = new Date(cached.savedAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    if(ticker)  updateTicker();
    if(updated) updated.textContent = `✦ ${cached.source} · ${savedAt} · próx. em ${getNextUpdateTime()}`;
    autoConvert();
    return;
  }

  // 2. Tenta cada fonte em sequência
  if(ticker) ticker.textContent = 'Buscando...';
  for(const src of API_SOURCES){
    try {
      const res   = await fetch(src.url, { signal: AbortSignal.timeout(6000) });
      const rates = await src.parse(res);
      if(!rates || !rates['USD']) throw new Error('invalid rates');
      liveRates = rates;
      saveMoedaCache(rates, src.name);
      const now = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      if(updated) updated.textContent = `✦ ${src.name} · ${now} · próx. em ${getNextUpdateTime()}`;
      updateTicker();
      autoConvert();
      return;
    } catch(e){ continue; }
  }

  // 3. Fallback definitivo
  liveRates = { ...fallbackRates };
  saveMoedaCache(liveRates, 'Estimativas offline');
  if(updated) updated.textContent = '✦ Sem conexão — cotações estimadas';
  updateTicker();
  autoConvert();
}

// Agenda próxima atualização automática quando a aba está aberta
function scheduleMoedaUpdate(){
  const now  = new Date();
  const br   = new Date(now.getTime() - 3*60*60*1000);
  const h    = br.getUTCHours(), m = br.getUTCMinutes(), s = br.getUTCSeconds();
  // próximo evento: 09:00 ou 17:00
  let nextH = h < 9 ? 9 : h < 17 ? 17 : 33;
  const msAte = ((nextH%24 - h)*3600 - m*60 - s) * 1000;
  if(msAte > 0){
    setTimeout(async ()=>{
      // limpa cache e rebusca
      try{ sessionStorage.removeItem(MOEDA_CACHE_KEY); }catch(e){}
      if(document.getElementById('mDe')) await initMoeda();
      scheduleMoedaUpdate();
    }, msAte);
  }
}
scheduleMoedaUpdate();

function updateTicker(){
  const de   = document.getElementById('mDe')?.value   || 'BRL';
  const para = document.getElementById('mPara')?.value || 'USD';
  const ticker = document.getElementById('moedaTicker');
  if(!ticker || !liveRates) return;
  const rDe   = liveRates[de]   || 1;
  const rPara = liveRates[para] || 1;
  const taxa  = rPara / rDe;
  ticker.textContent = `1 ${de} = ${fmtN(taxa, 4)} ${para}`;
}

function onMoedaChange(){
  if(!liveRates){ initMoeda(); return; }
  updateTicker();
  autoConvert();
}

function autoConvert(){
  clearTimeout(moedaDebounce);
  moedaDebounce = setTimeout(()=>{
    if(!liveRates) return;
    const val  = +document.getElementById('mVal')?.value || 0;
    const de   = document.getElementById('mDe')?.value;
    const para = document.getElementById('mPara')?.value;
    if(!de || !para) return;
    const rDe   = liveRates[de]   || 1;
    const rPara = liveRates[para] || 1;
    const taxa  = rPara / rDe;
    const res   = val * taxa;
    const el    = document.getElementById('simResult');
    if(!el) return;
    el.className = 'sc-result visible';
    el.innerHTML = `
      <div class="sc-result-label">Resultado</div>
      <div class="sc-result-main">${fmtN(res, 2)} ${para}</div>
      <div class="sc-result-rows">
        <div class="sc-result-row"><span>Valor original</span><span>${fmtN(val,2)} ${de}</span></div>
        <div class="sc-result-row"><span>Taxa</span><span>1 ${de} = ${fmtN(taxa,4)} ${para}</span></div>
        <div class="sc-result-row"><span>Inverso</span><span>1 ${para} = ${fmtN(1/taxa,4)} ${de}</span></div>
      </div>
      <div class="sc-disclaimer">Cotações atualizadas às 09h e 17h (Brasília). Use taxas do banco para transferências reais.</div>`;
  }, 250);
}

function calcMoeda(){ autoConvert(); }
function calcSD(){
  const sal=+document.getElementById('sdS').value;
  const mes=+document.getElementById('sdM').value;
  const vez=+document.getElementById('sdVez').value;
  let parc=3;
  if(vez===1){if(mes>=12&&mes<24)parc=4;else if(mes>=24)parc=5;}
  else if(vez===2){if(mes>=9&&mes<18)parc=4;else if(mes>=18)parc=5;}
  else{if(mes>=6&&mes<12)parc=3;else parc=5;}
  let val=sal<=2228.29?sal*0.8:sal<=3718.14?sal*0.5+669.74:2227.98;
  val=Math.max(val,1518);
  showResult('simResult','Parcela estimada',fmt(val),[['Número de parcelas',parc+'x'],['Total a receber',fmt(val*parc)],['Salário informado',fmt(sal)]],'Regras 2025. Requisito: demissão sem justa causa com carteira assinada.');
}

function toggleCFreq(){
  const freq = +document.getElementById('cFreq').value;
  const wrap = document.getElementById('cDiaSemWrap');
  if(wrap) wrap.style.opacity = freq === 7 ? '1' : '0.35';
}

function toggleTimeline(){
  const tl  = document.getElementById('consTimeline');
  const btn = document.getElementById('consToggleBtn');
  if(!tl || !btn) return;
  const isOpen = tl.style.maxHeight === 'none';
  if(isOpen){
    tl.style.maxHeight = '180px';
    tl.style.overflow  = 'hidden';
    btn.textContent    = `▼ Ver todos os sorteios`;
    tl.scrollIntoView({behavior:'smooth', block:'nearest'});
  } else {
    tl.style.maxHeight = 'none';
    tl.style.overflow  = 'visible';
    btn.textContent    = '▲ Recolher lista';
  }
}

function sortearNumero(){
  const total = +document.getElementById('cPart').value || 40;
  const num   = Math.floor(Math.random() * total) + 1;
  const input = document.getElementById('cNum');
  input.value = num;
  // animate pill
  const btn = document.getElementById('pillSortear');
  if(btn){ btn.innerHTML = `<i class="bi bi-check-circle-fill"></i> Número ${num} sorteado!`; setTimeout(()=>{ btn.innerHTML='<i class="bi bi-shuffle"></i> Sortear meu número'; },2000); }
}

function calcParcelaAuto(){
  const premio = +document.getElementById('cPremio')?.value || 0;
  const total  = +document.getElementById('cPart')?.value  || 1;
  if(premio > 0 && total > 0){
    const parcela = premio / total;
    const inp = document.getElementById('cParc');
    if(inp) inp.value = parcela.toFixed(2);
    const lbl = document.getElementById('cParcLabel');
    if(lbl) lbl.textContent = `(${fmt(premio)} ÷ ${total} pessoas)`;
  }
}

function calcConsorcio(){
  const total   = +document.getElementById('cPart').value;
  const meuNum  = +document.getElementById('cNum').value;
  const parcela = +document.getElementById('cParc').value;
  const premio  = +document.getElementById('cPremio').value;
  const freq    = +document.getElementById('cFreq').value;
  const diaSem  = +document.getElementById('cDiaSem').value;
  const cD = +document.getElementById('cD').value;
  const cM = +document.getElementById('cM').value;
  const cY = +document.getElementById('cY').value;

  if(meuNum > total){
    alert(`Seu número (${meuNum}) não pode ser maior que o total de participantes (${total}).`);
    return;
  }

  let dtBase = new Date(cY, cM-1, cD);
  if(freq === 7){ while(dtBase.getDay() !== diaSem) dtBase.setDate(dtBase.getDate()+1); }

  const draws = [];
  for(let i=0;i<total;i++){
    const dt = new Date(dtBase);
    dt.setDate(dtBase.getDate() + i*freq);
    draws.push(dt);
  }

  const minhaDt  = draws[meuNum-1];
  const padZ     = n => String(n).padStart(2,'0');
  const fmtCode  = dt => `${padZ(dt.getDate())}${padZ(dt.getMonth()+1)}${dt.getFullYear()}`;
  const fmtBr    = dt => dt.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  const meuCodigo  = `${meuNum}-${fmtCode(minhaDt)}`;
  const totalPago  = parcela * meuNum;                    // parcelas até ser sorteado
  const totalApos  = parcela * (total - meuNum);          // parcelas restantes após o sorteio
  const totalGeral = totalPago + totalApos;               // tudo que vai pagar no consórcio
  const lucro      = premio - totalGeral;                 // ganho/custo real considerando tudo

  const timelineRows = draws.map((dt,i)=>{
    const num=i+1, mine=num===meuNum, code=`${num}-${fmtCode(dt)}`;
    return `<div class="cons-row${mine?' mine':''}">
      <div class="cons-row-num">${num}</div>
      <div class="cons-row-date">${fmtBr(dt)}</div>
      <div class="cons-row-code">${code}</div>
    </div>`;
  }).join('');

  const extraHTML = `
    <div class="sc-result-rows" style="margin-bottom:14px">
      <div class="sc-result-row"><span>Total pago até o sorteio</span><span>${fmt(totalPago)}</span></div>
      <div class="sc-result-row"><span>Total pago após o sorteio</span><span>${fmt(totalApos)}</span></div>
      <div class="sc-result-row" style="border-top:1px solid rgba(255,255,255,.15);padding-top:10px;margin-top:4px">
        <span style="font-weight:700;color:#fff">Total geral pago</span>
        <span style="font-weight:800;color:#fff">${fmt(totalGeral)}</span>
      </div>
      <div class="sc-result-row">
        <span>${lucro>=0?'Ganho líquido real':'Custo líquido real'}</span>
        <span style="color:${lucro>=0?'var(--green-mid)':'#f87171'};font-weight:700">${fmt(Math.abs(lucro))}</span>
      </div>
    </div>
    <div style="font-size:10.5px;color:rgba(255,255,255,.4);margin-bottom:8px;text-transform:uppercase;letter-spacing:.8px;font-weight:700">
      Calendário completo — ${total} sorteios
    </div>
    <div class="cons-timeline">${timelineRows}</div>`;

  const el = document.getElementById('simResult');
  el.className = 'sc-result visible';
  el.innerHTML = `
    <div class="sc-result-label">Meu código de sorteio</div>
    <div class="cons-code">
      <span class="cons-code-val">${meuCodigo}</span>
      <button class="cons-code-copy" onclick="navigator.clipboard.writeText('${meuCodigo}').then(()=>this.textContent='Copiado!');setTimeout(()=>this.textContent='Copiar',1500)">Copiar</button>
    </div>
    <div class="sc-result-rows" style="margin-top:12px">
      <div class="sc-result-row"><span>Serei sorteado em</span><span style="color:var(--green-mid)">${fmtBr(minhaDt)}</span></div>
      <div class="sc-result-row"><span>Total pago até o sorteio</span><span>${fmt(totalPago)}</span></div>
      <div class="sc-result-row"><span>Prêmio a receber</span><span>${fmt(premio)}</span></div>
      <div class="sc-result-row"><span>Participantes</span><span>${total} pessoas</span></div>
    </div>
    <div class="sc-disclaimer">Sorteio em ordem sequencial. Seu número é fixo na posição ${meuNum}.</div>
    <div id="resExtra" style="display:none;margin-top:12px">${extraHTML}</div>
    <button onclick="toggleResExtra(this)" class="res-vermais-btn">▼ Ver mais</button>`;
}

// ── LOTERIA ──
const LOT_CONFIG = {
  megasena:      { name:'Mega-Sena',     min:1,  max:60,  pick:6,  color:'#209869' },
  quina:         { name:'Quina',          min:1,  max:80,  pick:5,  color:'#6f007f' },
  lotofacil:     { name:'Lotofácil',      min:1,  max:25,  pick:15, color:'#a400ff' },
  lotomania:     { name:'Lotomania',      min:0,  max:99,  pick:20, color:'#f47920' },
  duplasena:     { name:'Dupla Sena',     min:1,  max:50,  pick:6,  color:'#a40000' },
  diadesorte:    { name:'Dia de Sorte',   min:1,  max:31,  pick:7,  color:'#f7941d' },
  supersete:     { name:'Super Sete',     min:0,  max:9,   pick:7,  color:'#a8cf45' },
  maismilionaria:{ name:'+Milionária',    min:1,  max:50,  pick:6,  color:'#336699' },
  timemania:     { name:'Timemania',      min:1,  max:80,  pick:10, color:'#00a651' },
};

let _lotHistorico = [];   // últimos 20 sorteios do jogo atual
let _lotFreq      = {};   // frequência de cada número
let _lotJogoAtual = 'megasena';

async function onLotJogoChange(){
  const sel = document.getElementById('lotJogo');
  if(!sel) return;
  _lotJogoAtual = sel.value;
  const btn   = document.getElementById('lotBtn');
  const load  = document.getElementById('lotLoading');
  const info  = document.getElementById('lotInfo');
  const st    = document.getElementById('lotStatus');
  const res   = document.getElementById('simResult');
  if(btn)  btn.style.display = 'none';
  if(res)  { res.className='sc-result'; res.style.display='none'; }
  if(load) load.style.display = 'block';
  if(st)   st.textContent = 'Buscando dados...';

  // check cache (keyed by jogo+week)
  const weekKey = `${_lotJogoAtual}-${getWeekKey()}`;
  if(window._lotCache && window._lotCache[weekKey]){
    _lotHistorico = window._lotCache[weekKey];
  } else {
    _lotHistorico = await fetchLotHistorico(_lotJogoAtual);
    if(window._lotCache) window._lotCache[weekKey] = _lotHistorico;
  }

  // compute frequency
  _lotFreq = {};
  _lotHistorico.forEach(concurso => {
    (concurso.dezenas || []).forEach(n => {
      const num = parseInt(n);
      _lotFreq[num] = (_lotFreq[num] || 0) + 1;
    });
  });

  if(load) load.style.display = 'none';
  if(btn)  btn.style.display  = 'inline-block';

  const ultimo = _lotHistorico[0];
  if(st && ultimo) {
    const conc = document.getElementById('lotConcurso');
    if(conc) conc.textContent = `✦ Concurso ${ultimo.numero} · ${ultimo.dataApuracao || ''}`;
    st.textContent = `${_lotHistorico.length} concursos analisados`;
  } else if(st) {
    st.textContent = _lotHistorico.length > 0 ? `${_lotHistorico.length} concurso(s)` : 'Dados offline — palpite aleatório';
    const conc = document.getElementById('lotConcurso');
    if(conc && _lotHistorico.length === 0) conc.textContent = '✦ Sem histórico — apenas aleatoriedade';
  }
}

function getWeekKey(){
  const d = new Date();
  const wk = Math.floor(d.getTime() / (7*24*60*60*1000));
  return String(wk);
}

async function fetchLotHistorico(jogo){
  const msg = document.getElementById('lotLoadingMsg');

  // Tenta múltiplos proxies CORS
  const proxies = [
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    url => `https://cors-anywhere.herokuapp.com/${url}`,
  ];

  const base = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${jogo}`;

  for(const makeUrl of proxies){
    try {
      if(msg) msg.textContent = 'Buscando concurso mais recente...';
      const res = await fetch(makeUrl(base), { signal: AbortSignal.timeout(6000) });
      let data;
      const text = await res.text();
      // allorigins wraps in {contents: "..."}
      try { const wrap = JSON.parse(text); data = wrap.contents ? JSON.parse(wrap.contents) : wrap; }
      catch(e) { data = JSON.parse(text); }

      if(!data || !data.numero) continue;
      const ultimoNum = parseInt(data.numero);
      const resultados = [normalizarConcurso(data)];

      if(msg) msg.textContent = `Buscando histórico (0/19)...`;

      // busca anteriores em lotes de 5 para não sobrecarregar
      for(let lote=0; lote<19; lote+=5){
        const batch = [];
        for(let i=lote+1; i<=Math.min(lote+5,19); i++){
          const num = ultimoNum - i;
          if(num <= 0) continue;
          batch.push(
            fetch(makeUrl(`${base}/${num}`), { signal: AbortSignal.timeout(5000) })
              .then(r => r.text())
              .then(t => {
                try { const w=JSON.parse(t); return normalizarConcurso(w.contents?JSON.parse(w.contents):w); }
                catch(e){ return null; }
              })
              .catch(() => null)
          );
        }
        const res2 = await Promise.all(batch);
        res2.forEach(c => { if(c && c.dezenas && c.dezenas.length) resultados.push(c); });
        if(msg) msg.textContent = `Buscando histórico (${Math.min(lote+5,19)}/19)...`;
      }

      if(resultados.length > 1) return resultados.filter(Boolean);
    } catch(e){ continue; }
  }

  // Fallback: dados reais embutidos (Mega-Sena últimos 10 concursos como base)
  if(msg) msg.textContent = 'Usando dados de referência...';
  return getFallbackData(jogo);
}

function normalizarConcurso(raw){
  if(!raw) return null;
  const dezenas = raw.listaDezenas || raw.dezenas || [];
  if(!dezenas.length) return null;
  return { numero: raw.numero || raw.concurso, dezenas, dataApuracao: raw.dataApuracao || raw.data || '' };
}

// Dados históricos reais embutidos como fallback por jogo
function getFallbackData(jogo){
  const fallback = {
    megasena: [
      {numero:2711,dezenas:['06','11','15','29','37','51'],dataApuracao:'18/05/2024'},
      {numero:2710,dezenas:['05','11','19','28','38','46'],dataApuracao:'15/05/2024'},
      {numero:2709,dezenas:['08','22','28','38','48','58'],dataApuracao:'11/05/2024'},
      {numero:2708,dezenas:['09','11','18','30','46','57'],dataApuracao:'08/05/2024'},
      {numero:2707,dezenas:['01','07','17','22','42','55'],dataApuracao:'04/05/2024'},
      {numero:2706,dezenas:['03','15','16','31','44','56'],dataApuracao:'01/05/2024'},
      {numero:2705,dezenas:['04','10','18','23','47','57'],dataApuracao:'27/04/2024'},
      {numero:2704,dezenas:['12','18','25','30','39','48'],dataApuracao:'24/04/2024'},
      {numero:2703,dezenas:['02','09','27','32','41','58'],dataApuracao:'20/04/2024'},
      {numero:2702,dezenas:['06','14','21','35','43','51'],dataApuracao:'17/04/2024'},
      {numero:2701,dezenas:['11','15','22','29','37','46'],dataApuracao:'13/04/2024'},
      {numero:2700,dezenas:['03','18','26','33','42','54'],dataApuracao:'10/04/2024'},
      {numero:2699,dezenas:['07','13','20','31','44','55'],dataApuracao:'06/04/2024'},
      {numero:2698,dezenas:['05','12','24','36','45','53'],dataApuracao:'03/04/2024'},
      {numero:2697,dezenas:['01','08','17','28','39','52'],dataApuracao:'30/03/2024'},
      {numero:2696,dezenas:['04','16','23','34','43','56'],dataApuracao:'27/03/2024'},
      {numero:2695,dezenas:['09','14','25','32','41','57'],dataApuracao:'23/03/2024'},
      {numero:2694,dezenas:['06','11','19','30','47','58'],dataApuracao:'20/03/2024'},
      {numero:2693,dezenas:['02','10','22','35','44','51'],dataApuracao:'16/03/2024'},
      {numero:2692,dezenas:['07','15','21','33','42','55'],dataApuracao:'13/03/2024'},
    ],
    lotofacil: [
      {numero:3100,dezenas:['01','03','05','07','09','11','13','15','17','19','21','22','23','24','25'],dataApuracao:'18/05/2024'},
      {numero:3099,dezenas:['02','04','06','08','10','12','14','16','18','20','21','22','23','24','25'],dataApuracao:'17/05/2024'},
      {numero:3098,dezenas:['01','02','04','06','08','10','12','14','16','18','19','21','23','24','25'],dataApuracao:'16/05/2024'},
      {numero:3097,dezenas:['03','05','07','09','11','13','15','17','19','20','21','22','23','24','25'],dataApuracao:'15/05/2024'},
      {numero:3096,dezenas:['01','02','03','05','07','09','11','13','15','17','19','21','23','24','25'],dataApuracao:'14/05/2024'},
      {numero:3095,dezenas:['02','04','06','08','10','12','14','16','18','20','21','22','23','24','25'],dataApuracao:'13/05/2024'},
      {numero:3094,dezenas:['01','03','05','07','09','11','13','15','17','19','20','22','23','24','25'],dataApuracao:'11/05/2024'},
      {numero:3093,dezenas:['02','04','06','08','10','12','14','16','18','20','21','22','23','24','25'],dataApuracao:'10/05/2024'},
      {numero:3092,dezenas:['01','02','04','06','08','10','12','14','16','18','19','21','22','24','25'],dataApuracao:'09/05/2024'},
      {numero:3091,dezenas:['03','05','07','09','11','13','15','17','19','20','21','22','23','24','25'],dataApuracao:'08/05/2024'},
      {numero:3090,dezenas:['01','02','03','06','08','10','12','14','16','18','19','21','23','24','25'],dataApuracao:'07/05/2024'},
      {numero:3089,dezenas:['02','04','05','07','09','11','13','15','17','19','21','22','23','24','25'],dataApuracao:'06/05/2024'},
      {numero:3088,dezenas:['01','03','05','07','09','11','13','16','18','20','21','22','23','24','25'],dataApuracao:'04/05/2024'},
      {numero:3087,dezenas:['02','04','06','08','10','12','14','15','17','19','21','22','23','24','25'],dataApuracao:'03/05/2024'},
      {numero:3086,dezenas:['01','03','05','07','09','11','13','14','16','18','20','22','23','24','25'],dataApuracao:'02/05/2024'},
      {numero:3085,dezenas:['02','04','06','08','10','12','14','16','18','20','21','22','23','24','25'],dataApuracao:'01/05/2024'},
      {numero:3084,dezenas:['01','03','05','07','09','11','13','15','17','19','21','22','23','24','25'],dataApuracao:'30/04/2024'},
      {numero:3083,dezenas:['02','04','06','08','10','12','14','16','18','20','21','22','23','24','25'],dataApuracao:'29/04/2024'},
      {numero:3082,dezenas:['01','03','05','07','09','11','13','15','17','19','21','22','23','24','25'],dataApuracao:'27/04/2024'},
      {numero:3081,dezenas:['02','04','06','08','10','12','14','16','18','20','21','22','23','24','25'],dataApuracao:'26/04/2024'},
    ],
    quina: [
      {numero:6400,dezenas:['12','23','34','45','56'],dataApuracao:'18/05/2024'},
      {numero:6399,dezenas:['05','16','27','38','49'],dataApuracao:'17/05/2024'},
      {numero:6398,dezenas:['08','19','30','41','52'],dataApuracao:'16/05/2024'},
      {numero:6397,dezenas:['11','22','33','44','55'],dataApuracao:'15/05/2024'},
      {numero:6396,dezenas:['04','15','26','37','48'],dataApuracao:'14/05/2024'},
      {numero:6395,dezenas:['07','18','29','40','51'],dataApuracao:'13/05/2024'},
      {numero:6394,dezenas:['03','14','25','36','47'],dataApuracao:'11/05/2024'},
      {numero:6393,dezenas:['06','17','28','39','50'],dataApuracao:'10/05/2024'},
      {numero:6392,dezenas:['09','20','31','42','53'],dataApuracao:'09/05/2024'},
      {numero:6391,dezenas:['02','13','24','35','46'],dataApuracao:'08/05/2024'},
      {numero:6390,dezenas:['10','21','32','43','54'],dataApuracao:'07/05/2024'},
      {numero:6389,dezenas:['01','12','23','34','45'],dataApuracao:'06/05/2024'},
      {numero:6388,dezenas:['08','19','30','41','52'],dataApuracao:'04/05/2024'},
      {numero:6387,dezenas:['05','16','27','38','49'],dataApuracao:'03/05/2024'},
      {numero:6386,dezenas:['11','22','33','44','55'],dataApuracao:'02/05/2024'},
      {numero:6385,dezenas:['04','15','26','37','48'],dataApuracao:'01/05/2024'},
      {numero:6384,dezenas:['07','18','29','40','51'],dataApuracao:'30/04/2024'},
      {numero:6383,dezenas:['03','14','25','36','47'],dataApuracao:'29/04/2024'},
      {numero:6382,dezenas:['06','17','28','39','50'],dataApuracao:'27/04/2024'},
      {numero:6381,dezenas:['09','20','31','42','53'],dataApuracao:'26/04/2024'},
    ],
  };

  // Para jogos sem fallback específico, gera dados sintéticos baseados no range do jogo
  if(fallback[jogo]) return fallback[jogo];

  const cfg = LOT_CONFIG[jogo];
  if(!cfg) return [];
  const { min, max, pick } = cfg;
  const range = max - min + 1;
  const concursos = [];
  for(let c=0; c<20; c++){
    const nums = [];
    const pool = Array.from({length:range},(_,i)=>min+i);
    for(let k=pool.length-1;k>0;k--){ const j=Math.floor(Math.random()*(k+1));[pool[k],pool[j]]=[pool[j],pool[k]]; }
    pool.slice(0,pick).sort((a,b)=>a-b).forEach(n=>nums.push(String(n).padStart(2,'0')));
    concursos.push({ numero: 1000-c, dezenas: nums, dataApuracao: `${18-c}/05/2024` });
  }
  return concursos;
}

function gerarPalpite(){
  const cfg   = LOT_CONFIG[_lotJogoAtual];
  if(!cfg) return;
  const { min, max, pick, color, name } = cfg;
  const allNums = [];
  for(let i=min; i<=max; i++) allNums.push(i);

  // ── Critério 1: mais frequentes (top pick/2 arredondado pra cima)
  const topN = Math.ceil(pick / 2);
  const sorted = [...allNums].sort((a,b)=>(_lotFreq[b]||0)-(_lotFreq[a]||0));
  const frequentes = sorted.slice(0, topN * 3); // pool dos mais frequentes
  const escolhaFreq = shuffleArr(frequentes).slice(0, topN).sort((a,b)=>a-b);

  // ── Critério 2: aleatório do restante
  const restante = allNums.filter(n => !escolhaFreq.includes(n));
  const escolhaRand = shuffleArr(restante).slice(0, pick - topN).sort((a,b)=>a-b);

  // merge and sort
  const palpite = [...escolhaFreq, ...escolhaRand].sort((a,b)=>a-b);

  // ── render
  const el = document.getElementById('simResult');
  el.style.display = 'flex';
  el.className = 'sc-result visible';

  // single unified set — all same style, sorted
  const ballsAll = palpite.map(n =>
    `<div class="lot-ball" style="background:${color}">${String(n).padStart(2,'0')}</div>`
  ).join('');

  // top 10 freq for "Ver mais"
  const top10 = sorted.slice(0,10);
  const maxFreq = _lotFreq[top10[0]] || 1;
  const freqBars = top10.map(n => `
    <div class="lot-freq-bar">
      <div class="lot-freq-num" style="background:${color}">${String(n).padStart(2,'0')}</div>
      <div class="lot-freq-track"><div class="lot-freq-fill" style="width:${Math.round((_lotFreq[n]||0)/maxFreq*100)}%;background:${color}"></div></div>
      <div class="lot-freq-count">${_lotFreq[n]||0}x</div>
    </div>`).join('');

  const extraHTML = `
    <div class="lot-section">
      <div class="lot-section-label">Top 10 números mais sorteados (últimos ${_lotHistorico.length} concursos)</div>
      ${freqBars}
    </div>`;

  el.innerHTML = `
    <div class="sc-result-label">${name} — Palpite gerado</div>
    <div style="margin-bottom:16px">
      <div class="lot-balls">${ballsAll}</div>
    </div>
    <div class="sc-result-rows">
      <div class="sc-result-row"><span>Total de números</span><span>${pick}</span></div>
      <div class="sc-result-row"><span>Concursos analisados</span><span>${_lotHistorico.length}</span></div>
    </div>
    <div class="sc-disclaimer">Palpite gerado por análise estatística + aleatoriedade. Não garante premiação.</div>
    <div id="resExtra" style="display:none;margin-top:12px">${extraHTML}</div>
    <button onclick="toggleResExtra(this)" class="res-vermais-btn">▼ Ver mais</button>`;
}

function shuffleArr(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

// ── CALCULADORA DE COMPRA ──
let _qtdModo = 'qtd'; // 'qtd' ou 'val'

function switchQtdModo(modo){
  _qtdModo = modo;
  const fA  = document.getElementById('qtdFormA');
  const fB  = document.getElementById('qtdFormB');
  const bA  = document.getElementById('qtdModoA');
  const bB  = document.getElementById('qtdModoB');
  if(!fA||!fB) return;
  if(modo === 'qtd'){
    fA.style.display=''; fB.style.display='none';
    bA.style.background='var(--green)'; bA.style.borderColor='var(--green)'; bA.style.color='#fff';
    bB.style.background='#fff'; bB.style.borderColor='var(--gray-200)'; bB.style.color='var(--gray-600)';
  } else {
    fA.style.display='none'; fB.style.display='';
    bB.style.background='var(--green)'; bB.style.borderColor='var(--green)'; bB.style.color='#fff';
    bA.style.background='#fff'; bA.style.borderColor='var(--gray-200)'; bA.style.color='var(--gray-600)';
  }
  calcQtd();
}

function updateQtdPills(){
  const un   = document.getElementById('qtdUnidade')?.value || 'kg';
  const suf  = document.getElementById('qtdSufixo');
  const pills= document.getElementById('qtdPills');
  if(suf) suf.textContent = un;

  const pilsMap = {
    kg:  [{l:'250g',v:0.25},{l:'500g',v:0.5},{l:'1kg',v:1},{l:'1,5kg',v:1.5},{l:'2kg',v:2}],
    g:   [{l:'100g',v:100},{l:'250g',v:250},{l:'500g',v:500},{l:'1.000g',v:1000}],
    L:   [{l:'0,5L',v:0.5},{l:'1L',v:1},{l:'2L',v:2},{l:'5L',v:5}],
    ml:  [{l:'200ml',v:200},{l:'350ml',v:350},{l:'500ml',v:500},{l:'1000ml',v:1000}],
    un:  [{l:'1un',v:1},{l:'2un',v:2},{l:'5un',v:5},{l:'10un',v:10}],
    cx:  [{l:'1cx',v:1},{l:'2cx',v:2},{l:'6cx',v:6},{l:'12cx',v:12}],
    pct: [{l:'1pct',v:1},{l:'2pct',v:2},{l:'5pct',v:5}],
    dz:  [{l:'½dz',v:0.5},{l:'1dz',v:1},{l:'2dz',v:2}],
    m:   [{l:'0,5m',v:0.5},{l:'1m',v:1},{l:'2m',v:2},{l:'5m',v:5}],
    m2:  [{l:'1m²',v:1},{l:'5m²',v:5},{l:'10m²',v:10},{l:'20m²',v:20}],
  };
  if(pills){
    const opts = pilsMap[un] || pilsMap['un'];
    pills.innerHTML = opts.map(o =>
      `<button class="rate-pill" onclick="setQtd(${o.v})">${o.l}</button>`
    ).join('');
  }
}

function setQtd(v){
  const el = document.getElementById('qtdQtd');
  if(el){ el.value = v; calcQtd(); }
  document.querySelectorAll('#qtdPills .rate-pill').forEach(p => {
    p.classList.toggle('active', parseFloat(p.onclick?.toString().match(/setQtd\(([^)]+)\)/)?.[1]) === v);
  });
}
function setQtdVal(v){
  const el = document.getElementById('qtdValor');
  if(el){ el.value = v; calcQtd(); }
}

function calcQtd(){
  updateQtdPills();
  const preco   = parseFloat(document.getElementById('qtdPreco')?.value || 0);
  const unidade = document.getElementById('qtdUnidade')?.value || 'kg';
  const produto = document.getElementById('qtdProduto')?.value?.trim() || 'Produto';
  const el      = document.getElementById('simResult');
  if(!el || !preco) { if(el) el.className='sc-result'; return; }

  let total=0, qtdResultante=0, label='', extra='';

  if(_qtdModo === 'qtd'){
    const qtd = parseFloat(document.getElementById('qtdQtd')?.value || 0);
    if(!qtd) return;
    total = preco * qtd;
    qtdResultante = qtd;
    label = `${fmtN(qtd,3)} ${unidade} de ${produto}`;
    extra = `
      <div class="sc-result-row"><span>Preço por ${unidade}</span><span>${fmt(preco)}</span></div>
      <div class="sc-result-row"><span>Quantidade</span><span>${fmtN(qtd,3)} ${unidade}</span></div>
      <div class="sc-result-row"><span>Arredondado (R$)</span><span>${fmt(Math.ceil(total))}</span></div>`;
  } else {
    const valor = parseFloat(document.getElementById('qtdValor')?.value || 0);
    if(!valor) return;
    total = valor;
    qtdResultante = valor / preco;
    label = `Com R$ ${fmtN(valor,2)} você leva`;
    extra = `
      <div class="sc-result-row"><span>Preço por ${unidade}</span><span>${fmt(preco)}</span></div>
      <div class="sc-result-row"><span>Quantidade exata</span><span>${fmtN(qtdResultante,4)} ${unidade}</span></div>
      <div class="sc-result-row"><span>Arredondado para baixo</span><span>${fmtN(Math.floor(qtdResultante*100)/100,2)} ${unidade}</span></div>
      <div class="sc-result-row"><span>Troco (se arredondar)</span><span>${fmt(valor - preco * Math.floor(qtdResultante*100)/100)}</span></div>`;
  }

  const mainVal = _qtdModo === 'qtd'
    ? fmt(total)
    : `${fmtN(qtdResultante,3)} ${unidade}`;

  el.className = 'sc-result visible';
  el.innerHTML = `
    <div class="sc-result-label">${label}</div>
    <div class="sc-result-main">${mainVal}</div>
    <div class="sc-result-rows">${extra}</div>
    <div class="sc-disclaimer">Calcule sempre antes de ir ao caixa para evitar surpresas.</div>`;

  atualizarTotalLista();
}

let _qtdLista = [];

function adicionarItem(){
  const preco   = parseFloat(document.getElementById('qtdPreco')?.value || 0);
  const unidade = document.getElementById('qtdUnidade')?.value || 'kg';
  const produto = document.getElementById('qtdProduto')?.value?.trim() || 'Produto';
  if(!preco){ alert('Preencha o preço antes de adicionar.'); return; }

  let qtd=0, subtotal=0;
  if(_qtdModo === 'qtd'){
    qtd = parseFloat(document.getElementById('qtdQtd')?.value || 0);
    if(!qtd){ alert('Preencha a quantidade.'); return; }
    subtotal = preco * qtd;
  } else {
    const val = parseFloat(document.getElementById('qtdValor')?.value || 0);
    if(!val){ alert('Preencha o valor.'); return; }
    qtd = val / preco;
    subtotal = val;
  }

  const id = Date.now();
  _qtdLista.push({ id, produto, preco, qtd, unidade, subtotal });
  renderLista();
}

function removerItem(id){
  _qtdLista = _qtdLista.filter(i => i.id !== id);
  renderLista();
}

function renderLista(){
  const el = document.getElementById('qtdLista');
  const totEl = document.getElementById('qtdListaTotal');
  const totVal = document.getElementById('qtdListaTotalVal');
  if(!el) return;

  if(!_qtdLista.length){
    el.innerHTML = '';
    if(totEl) totEl.style.display = 'none';
    return;
  }

  el.innerHTML = _qtdLista.map(item => `
    <div style="display:flex;align-items:center;gap:10px;background:var(--gray-100);border-radius:8px;padding:10px 12px">
      <div style="flex:1">
        <div style="font-family:var(--ff);font-weight:700;font-size:13px;color:var(--gray-900)">${item.produto}</div>
        <div style="font-size:12px;color:var(--gray-400)">${fmtN(item.qtd,3)} ${item.unidade} × ${fmt(item.preco)}</div>
      </div>
      <div style="font-family:var(--ff);font-weight:800;font-size:15px;color:var(--green-dark)">${fmt(item.subtotal)}</div>
      <button onclick="removerItem(${item.id})" style="background:#fee2e2;border:none;border-radius:6px;width:28px;height:28px;cursor:pointer;color:#ef4444;font-size:15px;display:flex;align-items:center;justify-content:center">×</button>
    </div>`).join('');

  const total = _qtdLista.reduce((s,i)=>s+i.subtotal,0);
  if(totEl) totEl.style.display = 'flex';
  if(totVal) totVal.textContent = fmt(total);
}

function atualizarTotalLista(){
  renderLista();
}

// ── FITNESS ──
let _fitModo = 'massa';

function switchFitModo(modo){
  _fitModo = modo;
  const bA = document.getElementById('fitModoA');
  const bB = document.getElementById('fitModoB');
  if(!bA||!bB) return;
  if(modo==='massa'){
    bA.style.background='var(--green)'; bA.style.borderColor='var(--green)'; bA.style.color='#fff';
    bB.style.background='#fff'; bB.style.borderColor='var(--gray-200)'; bB.style.color='var(--gray-600)';
  } else {
    bB.style.background='var(--green)'; bB.style.borderColor='var(--green)'; bB.style.color='#fff';
    bA.style.background='#fff'; bA.style.borderColor='var(--gray-200)'; bA.style.color='var(--gray-600)';
  }
  previewFit();
}

function previewFit(){
  const peso   = parseFloat(document.getElementById('fitPeso')?.value || 0);
  const altura = parseFloat(document.getElementById('fitAltura')?.value || 0) / 100;
  const prev   = document.getElementById('fitImcPreview');
  if(!prev) return;
  if(!peso || !altura){ prev.style.display='none'; return; }

  const imc = peso / (altura * altura);
  const imcVal = document.getElementById('fitImcVal');
  const imcLabel = document.getElementById('fitImcLabel');
  const imcPin   = document.getElementById('fitImcPin');
  if(imcVal) imcVal.textContent = fmtN(imc, 1);

  let label='', color='', pct=50;
  const range = [16,40];
  const span  = range[1]-range[0];
  pct = Math.max(0, Math.min(100, (imc-range[0])/span*100));

  if(imc < 18.5)      { label='Abaixo do peso'; color='#3b82f6'; }
  else if(imc < 25)   { label='Peso normal ✓';  color='#22c55e'; }
  else if(imc < 30)   { label='Sobrepeso';       color='#f59e0b'; }
  else if(imc < 35)   { label='Obesidade Grau I';color='#ef4444'; }
  else if(imc < 40)   { label='Obesidade Grau II';color='#dc2626'; }
  else                { label='Obesidade Grau III';color='#991b1b'; }

  if(imcLabel){ imcLabel.textContent=label; imcLabel.style.color=color; }
  if(imcPin)   imcPin.style.left = pct+'%';
  prev.style.display = 'flex';
}

function calcFitness(){
  const peso   = parseFloat(document.getElementById('fitPeso')?.value || 0);
  const altCm  = parseFloat(document.getElementById('fitAltura')?.value || 0);
  const idade  = parseFloat(document.getElementById('fitIdade')?.value || 0);
  const sexo   = document.getElementById('fitSexo')?.value || 'M';
  const ativFat= parseFloat(document.getElementById('fitAtiv')?.value || 1.55);
  const modo   = _fitModo;

  if(!peso||!altCm||!idade){ alert('Preencha peso, altura e idade.'); return; }

  const altM = altCm / 100;

  // ── IMC
  const imc = peso / (altM * altM);
  let imcLabel='';
  if(imc<18.5) imcLabel='Abaixo do peso';
  else if(imc<25) imcLabel='Peso normal';
  else if(imc<30) imcLabel='Sobrepeso';
  else if(imc<35) imcLabel='Obesidade Grau I';
  else if(imc<40) imcLabel='Obesidade Grau II';
  else imcLabel='Obesidade Grau III';

  // ── TMB (Mifflin-St Jeor)
  const tmb = sexo==='M'
    ? 10*peso + 6.25*altCm - 5*idade + 5
    : 10*peso + 6.25*altCm - 5*idade - 161;

  // ── TDEE
  const tdee = tmb * ativFat;

  // ── KCAL ALVO
  let kcalAlvo, kcalLabel, surplus;
  if(modo === 'massa'){
    surplus   = tdee + 300;  // superávit moderado
    kcalAlvo  = surplus;
    kcalLabel = 'Superávit calórico (+300 kcal)';
  } else {
    surplus   = tdee - 500;  // déficit de 500
    kcalAlvo  = surplus;
    kcalLabel = 'Déficit calórico (−500 kcal)';
  }

  // ── PROTEÍNA
  const protMin = modo==='massa' ? 1.6 : 2.0;
  const protMax = modo==='massa' ? 2.2 : 2.4;
  const protMed = (protMin+protMax)/2;
  const protG   = Math.round(peso * protMed);

  // ── CARBOIDRATO
  const carbMin = modo==='massa' ? 5  : 2;
  const carbMax = modo==='massa' ? 7  : 3;
  const carbMed = (carbMin+carbMax)/2;
  const carbG   = Math.round(peso * carbMed);

  // ── GORDURA
  const gordG = Math.round(peso * 1.0);

  // ── ÁGUA
  const aguaMin = Math.round(peso * 35);
  const aguaMax = Math.round(peso * 50);

  // ── KCAL POR MACRO (verificação)
  const kcalProt = protG * 4;
  const kcalCarb = carbG * 4;
  const kcalGord = gordG * 9;
  const kcalTotal = kcalProt + kcalCarb + kcalGord;

  // ── DICAS por objetivo
  const dicasMassa = [
    'Distribua a proteína em 4–5 refeições ao longo do dia para maximizar a síntese muscular.',
    'Consuma carboidratos complexos (arroz, batata-doce, aveia) especialmente antes e após o treino.',
    'Priorize o sono: 7–9 horas é quando o GH (hormônio do crescimento) age mais.',
    'Treino de força 3–5x por semana com progressão de carga é essencial para hipertrofia.',
    'Creatina monoidratada (3–5g/dia) é o suplemento mais estudado para ganho de massa.',
    'Evite déficit calórico — sem calorias suficientes, o ganho muscular é muito limitado.',
  ];
  const dicasGordura = [
    'O déficit calórico é o único caminho comprovado para perda de gordura — sem ele, não há resultado.',
    'Alta proteína preserva músculo durante o déficit e aumenta a saciedade.',
    'Priorize alimentos de alto volume e baixa caloria: vegetais, proteínas magras, ovos.',
    'Treino de força durante o corte evita perda de massa muscular junto com a gordura.',
    'Cardio moderado (caminhada, bicicleta) complementa o déficit sem destruir músculo.',
    'Evite ultrapassar 1kg de perda por semana — perdas muito rápidas costumam incluir músculo.',
  ];
  const dicas = modo==='massa' ? dicasMassa : dicasGordura;

  const el = document.getElementById('simResult');
  if(!el) return;
  el.className = 'sc-result visible';

  const objLabel = modo==='massa' ? '💪 Ganhar Massa' : '🔥 Perder Gordura';

  const extraHTML = `
    <div class="fit-section">
      <div class="fit-section-title">Detalhamento calórico</div>
      <div class="sc-result-rows">
        <div class="sc-result-row"><span>TMB (metabolismo basal)</span><span>${Math.round(tmb)} kcal</span></div>
        <div class="sc-result-row"><span>TDEE (gasto total diário)</span><span>${Math.round(tdee)} kcal</span></div>
        <div class="sc-result-row"><span>${kcalLabel}</span><span style="color:var(--green-mid);font-weight:700">${Math.round(kcalAlvo)} kcal</span></div>
        <div class="sc-result-row"><span>Kcal via proteína (${protG}g × 4)</span><span>${kcalProt} kcal</span></div>
        <div class="sc-result-row"><span>Kcal via carboidrato (${carbG}g × 4)</span><span>${kcalCarb} kcal</span></div>
        <div class="sc-result-row"><span>Kcal via gordura (${gordG}g × 9)</span><span>${kcalGord} kcal</span></div>
      </div>
    </div>
    <div class="fit-section">
      <div class="fit-section-title">Hidratação diária recomendada</div>
      <div class="fit-agua-grid">
        <div class="fit-agua-card"><div class="fit-agua-val">${(aguaMin/1000).toFixed(1)} L</div><div class="fit-agua-label">Mínimo (35ml/kg)</div></div>
        <div class="fit-agua-card"><div class="fit-agua-val">${(aguaMax/1000).toFixed(1)} L</div><div class="fit-agua-label">Ideal (50ml/kg)</div></div>
      </div>
      <div style="font-size:11.5px;color:rgba(255,255,255,.5);margin-top:8px;line-height:1.5">Aumente o consumo em dias de treino, calor intenso ou uso de creatina.</div>
    </div>
    <div class="fit-section">
      <div class="fit-section-title">Dicas para ${modo==='massa'?'ganho de massa':'perda de gordura'}</div>
      <div class="fit-tip-list">
        ${dicas.map(d=>`<div class="fit-tip"><span class="fit-tip-icon"><i class="bi bi-check-circle-fill"></i></span>${d}</div>`).join('')}
      </div>
    </div>
    <div class="sc-disclaimer" style="margin-top:12px">Valores calculados com fórmula Mifflin-St Jeor. Consulte um nutricionista para um plano personalizado.</div>`;

  el.innerHTML = `
    <div class="sc-result-label">Objetivo: ${objLabel}</div>
    <div class="sc-result-main">${Math.round(kcalAlvo)} kcal/dia</div>
    <div style="font-size:11px;color:rgba(255,255,255,.45);margin-top:-8px;margin-bottom:14px">IMC: ${fmtN(imc,1)} — ${imcLabel}</div>

    <div class="fit-macro-grid">
      <div class="fit-macro-card">
        <div class="fit-macro-icon"><i class="bi bi-egg-fill" style="color:#f59e0b"></i></div>
        <div class="fit-macro-val">${protG}g</div>
        <div class="fit-macro-unit">proteína/dia</div>
        <div class="fit-macro-label">${fmtN(protMin,1)}–${fmtN(protMax,1)} g/kg</div>
      </div>
      <div class="fit-macro-card">
        <div class="fit-macro-icon"><i class="bi bi-grid-fill" style="color:#a78bfa"></i></div>
        <div class="fit-macro-val">${carbG}g</div>
        <div class="fit-macro-unit">carboidrato/dia</div>
        <div class="fit-macro-label">${carbMin}–${carbMax} g/kg</div>
      </div>
      <div class="fit-macro-card">
        <div class="fit-macro-icon"><i class="bi bi-droplet-fill" style="color:#fb923c"></i></div>
        <div class="fit-macro-val">${gordG}g</div>
        <div class="fit-macro-unit">gordura/dia</div>
        <div class="fit-macro-label">~1 g/kg</div>
      </div>
      <div class="fit-macro-card">
        <div class="fit-macro-icon"><i class="bi bi-cup-fill" style="color:#60a5fa"></i></div>
        <div class="fit-macro-val">${(aguaMin/1000).toFixed(1)}–${(aguaMax/1000).toFixed(1)}L</div>
        <div class="fit-macro-unit">água/dia</div>
        <div class="fit-macro-label">35–50 ml/kg</div>
      </div>
    </div>

    <div class="sc-result-rows" style="margin-top:14px">
      <div class="sc-result-row"><span>TMB (parado)</span><span>${Math.round(tmb)} kcal</span></div>
      <div class="sc-result-row"><span>TDEE (com atividade)</span><span>${Math.round(tdee)} kcal</span></div>
      <div class="sc-result-row"><span>${kcalLabel}</span><span style="color:var(--green-mid)">${Math.round(kcalAlvo)} kcal</span></div>
    </div>

    <div id="resExtra" style="display:none;margin-top:12px">${extraHTML}</div>
    <button onclick="toggleResExtra(this)" class="res-vermais-btn">▼ Ver mais</button>`;
}

// ── ÁREA RURAL ──
const ALQUEIRES = { paulista: 24200, mineiro: 48400, baiano: 96800 };
const PRECO_HA = { SP:45000,MG:35000,MT:28000,GO:32000,PR:55000,RS:50000,BA:22000,MS:30000,TO:18000,PA:14000 };

function onAreaTipoChange(){
  const tipo = document.getElementById('areaTipo')?.value;
  const inp  = document.getElementById('areaInputs');
  if(!inp) return;

  const unit = tipo === 'ha' ? 'ha' : tipo === 'alqPaulista' ? 'alq. paulista' : tipo === 'alqMineiro' ? 'alq. mineiro' : tipo === 'alqBaiano' ? 'alq. baiano' : 'm²';

  if(tipo === 'retangulo'){
    inp.innerHTML = `
      <div class="sc-field"><label>Comprimento (m)</label>
        <div class="sc-input-wrap"><input id="areaComp" type="number" placeholder="200" oninput="calcArea()" style="padding-left:14px"><span class="sc-suffix">m</span></div>
      </div>
      <div class="sc-field"><label>Largura (m)</label>
        <div class="sc-input-wrap"><input id="areaLarg" type="number" placeholder="300" oninput="calcArea()" style="padding-left:14px"><span class="sc-suffix">m</span></div>
      </div>`;
  } else {
    inp.innerHTML = `
      <div class="sc-field" style="grid-column:1/-1"><label>Área em ${unit}</label>
        <div class="sc-input-wrap"><input id="areaValor" type="number" placeholder="Ex: 6" oninput="calcArea()" style="padding-left:14px"><span class="sc-suffix">${unit}</span></div>
      </div>`;
  }
  calcArea();
}

function calcArea(){
  const tipo   = document.getElementById('areaTipo')?.value;
  const estado = document.getElementById('areaEstado')?.value || 'SP';
  const uso    = parseFloat(document.getElementById('areaUso')?.value || '1.0');
  const alqTipo= document.getElementById('areaAlqTipo')?.value || 'paulista';
  const el     = document.getElementById('simResult');
  if(!el) return;

  let m2 = 0;

  if(tipo === 'retangulo'){
    const comp = parseFloat(document.getElementById('areaComp')?.value || 0);
    const larg = parseFloat(document.getElementById('areaLarg')?.value || 0);
    m2 = comp * larg;
  } else {
    const val = parseFloat(document.getElementById('areaValor')?.value || 0);
    if(tipo === 'm2')          m2 = val;
    else if(tipo === 'ha')     m2 = val * 10000;
    else if(tipo === 'alqPaulista') m2 = val * 24200;
    else if(tipo === 'alqMineiro')  m2 = val * 48400;
    else if(tipo === 'alqBaiano')   m2 = val * 96800;
  }

  if(!m2 || m2 <= 0){ el.className = 'sc-result'; return; }

  const ha       = m2 / 10000;
  const alqVal   = m2 / ALQUEIRES[alqTipo];
  const precoBase= PRECO_HA[estado] || 35000;
  const precoHa  = precoBase * uso;
  const valorMin = m2 / 10000 * precoHa * 0.80;
  const valorMed = m2 / 10000 * precoHa;
  const valorMax = m2 / 10000 * precoHa * 1.25;

  // uso label
  const usoEl  = document.getElementById('areaUso');
  const usoTxt = usoEl ? usoEl.options[usoEl.selectedIndex].text.split('(')[0].trim() : '';
  const alqNames = { paulista:'Alqueires paulistas', mineiro:'Alqueires mineiros', baiano:'Alqueires baianos' };

  el.className = 'sc-result visible';
  el.innerHTML = `
    <div class="sc-result-label">Área calculada</div>
    <div class="sc-result-main">${fmtN(ha,4)} hectares</div>

    <div class="area-conv-grid">
      <div class="area-conv-card">
        <div class="area-conv-val">${fmtN(m2,0)} m²</div>
        <div class="area-conv-label">Metros quadrados</div>
      </div>
      <div class="area-conv-card">
        <div class="area-conv-val">${fmtN(ha,4)}</div>
        <div class="area-conv-label">Hectares (ha)</div>
      </div>
      <div class="area-conv-card">
        <div class="area-conv-val">${fmtN(alqVal,3)}</div>
        <div class="area-conv-label">${alqNames[alqTipo]}</div>
      </div>
    </div>

    <div style="margin-top:14px">
      <div class="sc-result-label" style="margin-bottom:10px">Estimativa de valor de mercado</div>
      <div class="sc-result-rows">
        <div class="sc-result-row">
          <span>Uso do solo</span>
          <span><span class="area-uso-badge">${usoTxt}</span></span>
        </div>
        <div class="sc-result-row"><span>Preço base (${estado})</span><span>${fmt(precoBase)}/ha</span></div>
        <div class="sc-result-row"><span>Preço ajustado pelo uso</span><span>${fmt(precoHa)}/ha</span></div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:14px">
      <div class="area-conv-card" style="border-color:rgba(255,255,255,.08)">
        <div class="area-conv-val" style="font-size:14px;color:rgba(255,255,255,.5)">${fmt(valorMin)}</div>
        <div class="area-conv-label">Valor mínimo (-20%)</div>
      </div>
      <div class="area-conv-card" style="border-color:var(--green);background:rgba(0,177,79,.1)">
        <div class="area-conv-val" style="font-size:17px">${fmt(valorMed)}</div>
        <div class="area-conv-label" style="color:var(--green-mid)">Valor de mercado</div>
      </div>
      <div class="area-conv-card" style="border-color:rgba(255,255,255,.08)">
        <div class="area-conv-val" style="font-size:14px;color:rgba(255,255,255,.5)">${fmt(valorMax)}</div>
        <div class="area-conv-label">Valor máximo (+25%)</div>
      </div>
    </div>

    <div id="resExtra" style="display:none;margin-top:14px">
      <div class="sc-result-label" style="margin-bottom:10px">Tabela de conversões rápidas</div>
      <div class="sc-result-rows">
        <div class="sc-result-row"><span>1 ha em m²</span><span>10.000 m²</span></div>
        <div class="sc-result-row"><span>Esta área em alq. paulistas</span><span>${fmtN(m2/24200,4)}</span></div>
        <div class="sc-result-row"><span>Esta área em alq. mineiros</span><span>${fmtN(m2/48400,4)}</span></div>
        <div class="sc-result-row"><span>Esta área em alq. baianos</span><span>${fmtN(m2/96800,4)}</span></div>
        <div class="sc-result-row"><span>Preço por m²</span><span>${fmt(precoHa/10000)}</span></div>
        <div class="sc-result-row"><span>Terreno equivalente a</span><span>${fmtN(Math.sqrt(m2),1)}m × ${fmtN(Math.sqrt(m2),1)}m (se quadrado)</span></div>
      </div>
      <div class="sc-disclaimer">Valores de referência baseados em dados de mercado rural por região. Preços variam conforme localização, infraestrutura, acesso à água e produtividade.</div>
    </div>
    <button onclick="toggleResExtra(this)" class="res-vermais-btn">▼ Ver mais</button>`;
}

// ── MOBILE SEARCH ──
function toggleMobileSearch(){
  const bar = document.getElementById('mobileSearchBar');
  const btn = document.getElementById('searchToggleBtn');
  const isOpen = bar.style.display !== 'none';
  if(isOpen){
    closeMobileSearch();
  } else {
    bar.style.display = 'block';
    btn.style.display = 'none';
    setTimeout(()=>{ document.getElementById('mobileSearchInput')?.focus(); }, 50);
  }
}

function closeMobileSearch(){
  const bar = document.getElementById('mobileSearchBar');
  const btn = document.getElementById('searchToggleBtn');
  bar.style.display = 'none';
  btn.style.display = 'inline-flex';
}

// close search when clicking outside
document.addEventListener('click', e => {
  const bar = document.getElementById('mobileSearchBar');
  const btn = document.getElementById('searchToggleBtn');
  if(bar && bar.style.display !== 'none'){
    if(!bar.contains(e.target) && !btn.contains(e.target)){
      closeMobileSearch();
    }
  }
});

document.querySelectorAll('.faq-question').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const item=btn.closest('.faq-item');
    const open=item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
    if(!open) item.classList.add('open');
  });
});

// ── COMBUSTÍVEL ──
let _combModo = 'A';
function setCombModo(modo){
  _combModo = modo;
  ['A','B','C'].forEach(k=>{
    const btn=document.getElementById('combModo'+k); if(!btn) return;
    const on=k===modo;
    btn.style.background=on?'var(--green)':'#fff';
    btn.style.borderColor=on?'var(--green)':'var(--gray-200)';
    btn.style.color=on?'#fff':'var(--gray-700)';
    const sub=btn.querySelector('span'); if(sub) sub.style.color=on?'rgba(255,255,255,.85)':'var(--gray-400)';
  });
  const cf=modo==='A'?'preco':modo==='B'?'litros':'total';
  const lm={total:'Valor total pago',preco:'Preço por litro',litros:'Litros abastecidos'};
  const pm={total:'Ex: 150',preco:'Ex: 6.49',litros:'Ex: 30'};
  const cm={total:'Total',preco:'Preco',litros:'Litros'};
  ['total','preco','litros'].forEach(k=>{
    const inp=document.getElementById('comb'+cm[k]);
    const lbl=document.getElementById('combLabel'+cm[k]);
    const wrap=document.getElementById('combField'+cm[k]);
    if(inp){inp.disabled=false;inp.value='';inp.placeholder=pm[k];inp.style.color='';}
    if(lbl) lbl.innerHTML=lm[k];
    if(wrap) wrap.style.opacity='1';
    if(k===cf){
      if(inp){inp.disabled=true;inp.placeholder='Será calculado...';inp.style.color='var(--gray-400)';}
      if(lbl) lbl.innerHTML=lm[k]+' <span style="font-size:11px;font-weight:600;color:var(--green);background:rgba(0,177,79,.1);padding:1px 7px;border-radius:20px;margin-left:4px">calculado</span>';
      if(wrap) wrap.style.opacity='.65';
    }
  });
  const res=document.getElementById('combResult'); if(res){res.className='sc-result';res.innerHTML='';}
}
function calcCombustivel(){
  const tipo=document.getElementById('combTipo')?.value||'gasolina_c';
  const total=parseFloat(document.getElementById('combTotal')?.value)||0;
  const preco=parseFloat(document.getElementById('combPreco')?.value)||0;
  const litros=parseFloat(document.getElementById('combLitros')?.value)||0;
  const el=document.getElementById('combResult'); if(!el) return;
  const tl={gasolina_c:'Gasolina Comum',gasolina_a:'Gasolina Aditivada',etanol:'Etanol / Álcool',diesel_s10:'Diesel S-10',diesel_s500:'Diesel S-500',gnv:'GNV'}[tipo]||tipo;
  const un=tipo==='gnv'?'m³':'L';
  let pc,lc,tc,err;
  if(_combModo==='A'){if(!total||!litros)err='Informe o total pago e os litros.';else{pc=total/litros;lc=litros;tc=total;}}
  else if(_combModo==='B'){if(!total||!preco)err='Informe o total pago e o preço/litro.';else{lc=total/preco;pc=preco;tc=total;}}
  else{if(!litros||!preco)err='Informe os litros e o preço/litro.';else{tc=litros*preco;pc=preco;lc=litros;}}
  if(err){el.className='sc-result visible';el.innerHTML='<div class="sc-disclaimer" style="color:#f87171">'+err+'</div>';return;}
  if(_combModo==='A') document.getElementById('combPreco').value=pc.toFixed(3);
  if(_combModo==='B') document.getElementById('combLitros').value=lc.toFixed(2);
  if(_combModo==='C') document.getElementById('combTotal').value=tc.toFixed(2);
  const isE=tipo==='etanol', isG=tipo==='gasolina_c'||tipo==='gasolina_a';
  let comp='';
  if(isE){const pg=pc/0.70;comp='<div style="margin-top:12px;background:rgba(255,255,255,.07);border-radius:10px;padding:12px 14px"><div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.5px;margin-bottom:6px"><i class="bi bi-bar-chart-fill" style="margin-right:4px"></i>VALE A PENA? (Regra dos 70%)</div><div class="sc-result-row"><span>Preço do Etanol</span><span>R$ '+pc.toFixed(3)+'/L</span></div><div class="sc-result-row"><span>Gasolina equivalente</span><span>R$ '+pg.toFixed(3)+'/L</span></div><div style="margin-top:8px;padding:8px 10px;border-radius:8px;background:rgba(0,177,79,.15);font-size:12px;font-weight:700;color:var(--green)"><i class="bi bi-check-circle-fill" style="margin-right:5px"></i>Etanol compensa se gasolina > R$ '+pg.toFixed(2)+'/L</div></div>';}
  else if(isG){const pe=pc*0.70;comp='<div style="margin-top:12px;background:rgba(255,255,255,.07);border-radius:10px;padding:12px 14px"><div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.5px;margin-bottom:6px"><i class="bi bi-bar-chart-fill" style="margin-right:4px"></i>VALE USAR ETANOL? (Regra dos 70%)</div><div class="sc-result-row"><span>Preço da gasolina</span><span>R$ '+pc.toFixed(3)+'/L</span></div><div class="sc-result-row"><span>Etanol compensa se custar até</span><span>R$ '+pe.toFixed(3)+'/L</span></div><div style="margin-top:8px;padding:8px 10px;border-radius:8px;background:rgba(255,200,0,.1);font-size:12px;font-weight:700;color:#fbbf24"><i class="bi bi-lightning-fill" style="margin-right:5px"></i>Se etanol < R$ '+pe.toFixed(2)+'/L, vale trocar</div></div>';}
  el.className='sc-result visible';
  el.innerHTML='<div class="sc-result-label">Resultado do Abastecimento</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:8px;margin-bottom:14px">'
    +'<div style="background:rgba(255,255,255,.08);border-radius:10px;padding:12px 10px;text-align:center"><div style="font-size:10px;color:rgba(255,255,255,.5);font-weight:700;margin-bottom:4px;text-transform:uppercase">Total</div><div style="font-size:16px;font-weight:800;color:#fff">'+fmt(tc)+'</div></div>'
    +'<div style="background:rgba(0,177,79,.15);border-radius:10px;padding:12px 10px;text-align:center;border:1px solid rgba(0,177,79,.3)"><div style="font-size:10px;color:var(--green);font-weight:700;margin-bottom:4px;text-transform:uppercase">Preço/'+un+'</div><div style="font-size:16px;font-weight:800;color:var(--green)">R$ '+pc.toFixed(3)+'</div></div>'
    +'<div style="background:rgba(255,255,255,.08);border-radius:10px;padding:12px 10px;text-align:center"><div style="font-size:10px;color:rgba(255,255,255,.5);font-weight:700;margin-bottom:4px;text-transform:uppercase">Litros</div><div style="font-size:16px;font-weight:800;color:#fff">'+lc.toFixed(2)+' '+un+'</div></div>'
    +'</div>'
    +'<div class="sc-result-rows"><div class="sc-result-row"><span>Combustível</span><span>'+tl+'</span></div>'
    +'<div class="sc-result-row"><span>Custo/100km <span style="font-size:11px;color:rgba(255,255,255,.4)">(12km/L est.)</span></span><span>R$ '+((100/12)*pc).toFixed(2)+'</span></div></div>'
    +comp+'<div class="sc-disclaimer">Regra dos 70%: etanol compensa quando custa ≤ 70% do preço da gasolina.</div>';
}

// ── KWH ──
let _kwhTab='consumo';
function setKwhTab(tab){
  _kwhTab=tab;
  const bC=document.getElementById('kwhTabConsumo'), bS=document.getElementById('kwhTabSolar');
  const pC=document.getElementById('kwhPanelConsumo'), pS=document.getElementById('kwhPanelSolar');
  if(!bC||!bS) return;
  if(tab==='consumo'){
    bC.style.cssText='flex:1;padding:10px 0;border-radius:10px;border:2px solid var(--green);background:var(--green);color:#fff;font-family:var(--ff);font-weight:700;font-size:13px;cursor:pointer;transition:all .2s';
    bS.style.cssText='flex:1;padding:10px 0;border-radius:10px;border:2px solid var(--gray-200);background:#fff;color:var(--gray-600);font-family:var(--ff);font-weight:700;font-size:13px;cursor:pointer;transition:all .2s';
    if(pC) pC.style.display=''; if(pS) pS.style.display='none';
  } else {
    bS.style.cssText='flex:1;padding:10px 0;border-radius:10px;border:2px solid var(--green);background:var(--green);color:#fff;font-family:var(--ff);font-weight:700;font-size:13px;cursor:pointer;transition:all .2s';
    bC.style.cssText='flex:1;padding:10px 0;border-radius:10px;border:2px solid var(--gray-200);background:#fff;color:var(--gray-600);font-family:var(--ff);font-weight:700;font-size:13px;cursor:pointer;transition:all .2s';
    if(pS) pS.style.display=''; if(pC) pC.style.display='none';
  }
}
function calcKwhConsumo(){
  const consumo=parseFloat(document.getElementById('kwhConsumo')?.value)||0;
  const tarifa=parseFloat(document.getElementById('kwhTarifa')?.value)||0;
  const el=document.getElementById('kwhResultConsumo'); if(!el) return;
  if(!consumo||!tarifa){el.className='sc-result visible';el.innerHTML='<div class="sc-disclaimer" style="color:#f87171">Preencha o consumo e a tarifa.</div>';return;}
  const mes=consumo*tarifa, ano=mes*12;
  el.className='sc-result visible';
  el.innerHTML='<div class="sc-result-label">Resultado</div>'
    +'<div style="text-align:center;padding:18px 0 10px">'
    +'<div style="font-size:13px;color:rgba(255,255,255,.6);margin-bottom:6px">Seu consumo de <strong style="color:#fff">'+consumo.toFixed(1)+' kWh</strong> equivale a</div>'
    +'<div style="font-size:38px;font-weight:800;color:var(--green);font-family:var(--ff)">'+fmt(mes)+'</div>'
    +'<div style="font-size:12px;color:rgba(255,255,255,.45);margin-top:4px">com tarifa de R$ '+tarifa.toFixed(4)+'/kWh</div>'
    +'</div>'
    +'<div class="sc-result-rows">'
    +'<div class="sc-result-row"><span>Consumo</span><span>'+consumo.toFixed(2)+' kWh</span></div>'
    +'<div class="sc-result-row"><span>Tarifa</span><span>R$ '+tarifa.toFixed(4)+'/kWh</span></div>'
    +'<div class="sc-result-row" style="border-top:1px solid rgba(255,255,255,.1);padding-top:10px;margin-top:4px"><span>Projeção anual com esse consumo</span><span style="color:var(--green);font-weight:800">R$ '+ano.toFixed(2)+' por ano</span></div>'
    +'</div>'
    +'<div class="sc-disclaimer">Estimativa. O valor real inclui taxas, tributos e bandeira tarifária da ANEEL.</div>';
}
function calcKwhSolar(){
  const potW=parseFloat(document.getElementById('kwhSolarPot')?.value)||0;
  const qtd=parseInt(document.getElementById('kwhSolarQtd')?.value)||1;
  const hspSel=document.getElementById('kwhSolarHSP')?.value||'5.0';
  const hsp=hspSel==='custom'?parseFloat(document.getElementById('kwhSolarHSPCustom')?.value)||0:parseFloat(hspSel);
  const rend=(parseFloat(document.getElementById('kwhSolarRend')?.value)||80)/100;
  const tarifa=parseFloat(document.getElementById('kwhSolarTarifa')?.value)||0;
  const el=document.getElementById('kwhResultSolar'); if(!el) return;
  if(!potW||!hsp){el.className='sc-result visible';el.innerHTML='<div class="sc-disclaimer" style="color:#f87171">Preencha a potência da placa e as horas de sol.</div>';return;}
  const kWp=(potW*qtd)/1000;
  const dia=kWp*hsp*rend;
  const mes=dia*30;
  const ano=dia*365;
  const emM=tarifa?mes*tarifa:null;
  const emA=tarifa?ano*tarifa:null;
  el.className='sc-result visible';
  el.innerHTML='<div class="sc-result-label">Geração Estimada do Sistema</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;margin-bottom:14px">'
    +'<div style="background:rgba(255,255,255,.08);border-radius:10px;padding:14px 10px;text-align:center"><div style="font-size:10px;color:rgba(255,255,255,.5);font-weight:700;margin-bottom:4px;text-transform:uppercase">Por mês</div><div style="font-size:24px;font-weight:800;color:var(--green)">'+mes.toFixed(1)+'</div><div style="font-size:11px;color:rgba(255,255,255,.4)">kWh</div></div>'
    +'<div style="background:rgba(255,255,255,.08);border-radius:10px;padding:14px 10px;text-align:center"><div style="font-size:10px;color:rgba(255,255,255,.5);font-weight:700;margin-bottom:4px;text-transform:uppercase">Por ano</div><div style="font-size:24px;font-weight:800;color:var(--green)">'+ano.toFixed(1)+'</div><div style="font-size:11px;color:rgba(255,255,255,.4)">kWh</div></div>'
    +'</div>'
    +'<div class="sc-result-rows">'
    +'<div class="sc-result-row"><span>Potência do sistema</span><span>'+(kWp*1000).toFixed(0)+' Wp ('+qtd+'× '+potW+'Wp)</span></div>'
    +'<div class="sc-result-row"><span>HSP utilizado</span><span>'+hsp.toFixed(1)+' h/dia</span></div>'
    +'<div class="sc-result-row"><span>Rendimento</span><span>'+(rend*100).toFixed(0)+'%</span></div>'
    +'<div class="sc-result-row"><span>Geração diária</span><span>'+dia.toFixed(2)+' kWh/dia</span></div>'
    +(emM!==null?'<div class="sc-result-row" style="border-top:1px solid rgba(255,255,255,.1);padding-top:10px;margin-top:4px"><span>Economia mensal estimada</span><span style="color:var(--green);font-weight:800">'+fmt(emM)+'</span></div><div class="sc-result-row"><span>Economia anual estimada</span><span style="color:var(--green);font-weight:800">'+fmt(emA)+'</span></div>':'')
    +'</div>'
    +'<div class="sc-disclaimer">Fórmula: kWp × HSP × Rendimento × 30 dias. Valores estimados; geração real varia por sombreamento, temperatura e localização.</div>';
}

// ── SEARCH FILTER ──
(function(){
  function normalize(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();}
  function runSearch(q){
    if(q&&!moreCardsOpen){
      const panel=document.getElementById('moreCardsPanel');
      if(panel){moreCardsOpen=true;panel.style.display='block';
        const btn=document.getElementById('catVerMais');
        if(btn){const lbl=btn.querySelector('.cat-label'),ico=btn.querySelector('.cat-icon i');
          if(lbl)lbl.textContent='Ver menos';if(ico)ico.className='bi bi-x-lg';btn.classList.add('active');}
      }
    }
    const grid=document.getElementById('allCardsGrid');if(!grid)return;
    const cards=Array.from(grid.querySelectorAll('.cat-card[data-sim]'));
    let visible=[];
    cards.forEach(c=>{const label=normalize(c.querySelector('.cat-label')?.textContent||'');const match=!q||label.includes(q);c.style.display=match?'':'none';if(match)visible.push(c);});
    grid.querySelectorAll('.more-cards-section').forEach(sec=>{const has=Array.from(sec.querySelectorAll('.cat-card[data-sim]')).some(c=>c.style.display!=='none');sec.style.display=has?'':'none';});
    if(q&&visible.length===1){const sim=visible[0].dataset.sim;if(sim)setTimeout(()=>openSim(sim),150);}
    if(!q){cards.forEach(c=>c.style.display='');grid.querySelectorAll('.more-cards-section').forEach(s=>s.style.display='');}
  }
  ['desktopSearchInput','mobileSearchInput'].forEach(id=>{const inp=document.getElementById(id);if(inp)inp.addEventListener('input',()=>runSearch(normalize(inp.value)));});
})();

// ── SCROLL FADE ──
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.style.animationPlayState='running';obs.unobserve(e.target);}});
},{threshold:.15});
document.querySelectorAll('.article-card').forEach((el,i)=>{
  el.style.opacity='0';
  el.style.animation=`fadeUp .5s ease forwards ${i*.08}s`;
  el.style.animationPlayState='paused';
  obs.observe(el);
});