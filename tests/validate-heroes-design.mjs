import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const failures=[];
const expect=(c,m)=>{if(!c)failures.push(m)};
for(const token of ['#0F0909','#160B0D','#2A1114','#8D5B46','#D8B28E','#EEE1D1']) expect(html.includes(token),`missing HEROES palette token ${token}`);
for(const label of ['DISCOVER YOUR POKER DNA','YOUR POKER DNA','THE CONTROLLED AGGRESSOR','WHAT COSTS YOU EV?','PRESSURE DNA','STACKUP ID']) expect(html.includes(label),`missing required Heroes concept: ${label}`);
for(const tab of ['HOME','DNA','LEAKS','ANALYSIS','PROFILE']) expect(html.includes(`<span>${tab}</span>`),`missing bottom navigation item: ${tab}`);
expect((html.match(/data-tab=/g)||[]).length===5,'bottom navigation must contain exactly 5 tabs');
expect(html.includes('data-photo-slot="home"'),'Premium background/photo slot missing');
expect(!/neon/i.test(html),'neon styling/reference should not be present');
expect(!/XP|coins|stars/i.test(html),'childlike gamification terms should not be present');
if(failures.length){console.error('Heroes product-design validation failed:');failures.forEach(f=>console.error('- '+f));process.exit(1)}
console.log('Heroes product-design validation passed.');
