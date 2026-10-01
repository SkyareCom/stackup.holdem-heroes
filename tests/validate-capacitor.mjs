import fs from 'node:fs';

const failures=[];
const expect=(c,m)=>{if(!c)failures.push(m)};

const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const cap=fs.existsSync(new URL('../capacitor.config.ts',import.meta.url))
  ? fs.readFileSync(new URL('../capacitor.config.ts',import.meta.url),'utf8')
  : '';

expect(pkg.dependencies?.['@capacitor/core']==='8.5.2','@capacitor/core must be pinned to 8.5.2');
expect(pkg.dependencies?.['@capacitor/android']==='8.5.2','@capacitor/android must be pinned to 8.5.2');
expect(pkg.devDependencies?.['@capacitor/cli']==='8.5.2','@capacitor/cli must be pinned to 8.5.2');
expect(pkg.scripts?.['android:init'],'android:init script missing');
expect(pkg.scripts?.['cap:sync'],'cap:sync script missing');

expect(cap.includes("appId: 'com.stackupholdem.heroes'"),'Capacitor appId mismatch');
expect(cap.includes("appName: 'StackUp Heroes'"),'Capacitor appName mismatch');
expect(cap.includes("webDir: 'dist'"),'Capacitor webDir must be dist');

if(failures.length){
 console.error('Capacitor validation failed:');
 failures.forEach(f=>console.error('- '+f));
 process.exit(1);
}
console.log('Capacitor validation passed.');
