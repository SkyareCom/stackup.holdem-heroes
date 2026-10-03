import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const failures=[];
const expect=(c,m)=>{if(!c)failures.push(m)};

const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));
expect(!style.includes('sólido'),'CSS must not contain translated solid keyword');
expect(!/\.scenario-cell\s+forte\{/.test(style),'scenario score selector must target strong');
expect(!/\.setting\s+forte\{/.test(style),'setting label selector must target strong');
expect(style.includes('--section-gap:32px'),'global section spacing token must be defined');
expect(style.includes('.scenario-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}'),'scenario cards must use the normalized two-column grid');
expect(style.includes('.scenario-cell{min-width:0;min-height:124px'),'scenario cards must have normalized breathing room');
expect(style.includes('@media (max-width:330px)'),'small-screen fallback must exist');

for(const token of ['#0F0909','#160B0D','#2A1114','#8D5B46','#D8B28E','#EEE1D1']) expect(html.includes(token),`missing HEROES palette token ${token}`);
expect(html.includes('@font-face{font-family:"Roboto Slab"'),'Roboto Slab must be embedded');
expect(html.includes('data:font/ttf;base64,'),'Roboto Slab must be self-contained');
expect(html.includes('--display:"Roboto Slab"'),'display typography must use Roboto Slab');
expect(html.includes('--ui:"Roboto Slab"'),'UI typography must use Roboto Slab');
expect(html.includes('font-style:oblique 12deg'),'Heroes typography must use visible oblique styling');
expect(!html.includes('fonts.googleapis.com'),'external font loading must be removed');
expect(!html.includes('font-family:Dosis'),'legacy Dosis typography must be removed');
for(const label of ['DESCUBRA SEU POKER DNA','SEU POKER DNA','O AGRESSOR CONTROLADO','O QUE ESTÁ CUSTANDO EV?','DNA SOB PRESSÃO','STACKUP ID']) expect(html.includes(label),`missing required Heroes concept: ${label}`);
for(const tab of ['INÍCIO','DNA','LEAKS','ANÁLISE','PERFIL']) expect(html.includes(`<span>${tab}</span>`),`missing bottom navigation item: ${tab}`);
expect((html.match(/data-tab=/g)||[]).length===5,'bottom navigation must contain exactly 5 tabs');
expect(html.includes('data-photo-slot="home"'),'Premium background/photo slot missing');
expect((html.match(/images\.unsplash\.com\/photo-/g)||[]).length >= 5,'expected at least 5 real photographic poker backgrounds');
for(const scenario of ['POR POSIÇÃO','POR STACK','POR STREET','POR FASE DO TORNEIO','POR PRESSÃO','POR TIPO DE OPONENTE']) expect(html.includes(scenario),`missing scenario division: ${scenario}`);
expect(html.includes('data-scenario-filter="position"'),'scenario filters must be data-driven');
expect(html.includes('renderScenarios'),'scenario rendering function missing');
expect(!/neon/i.test(html),'neon styling/reference should not be present');
expect(!/\bXP\b|\bcoins\b|\bstars\b/i.test(html),'childlike gamification terms should not be present');
if(failures.length){console.error('Heroes product-design validation failed:');failures.forEach(f=>console.error('- '+f));process.exit(1)}
console.log('Heroes product-design validation passed.');
