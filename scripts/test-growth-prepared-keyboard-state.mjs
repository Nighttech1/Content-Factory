import assert from 'node:assert/strict';
import {keyboardTargetState} from './growth-prepared-keyboard-state.mjs';
function fixture({left=250,dragging=true,columnOver=null,missing=false}={}){
 const target={getBoundingClientRect:()=>({left:240,right:470,top:100,bottom:720,width:230,height:620}),getAttribute:()=>columnOver};
 const card={getBoundingClientRect:()=>({left,right:left+200,top:100,bottom:500,width:200,height:400}),getAttribute:()=>dragging?'true':null};
 return {activeElement:{getAttribute:()=> 'growth-drag-fixture'},querySelector:selector=>selector.startsWith('[data-card-id=')?(missing?null:card):target};
}
const args={id:'fixture',column:'shooting'};
// Diagnostics must preserve observed flags/focus without creating a readiness verdict from geometry.
for(const input of [{},{columnOver:'true'},{left:0,columnOver:'true'},{dragging:false},{missing:true}]){
 const snapshot=keyboardTargetState(args,fixture(input));assert.equal(typeof snapshot,'object');assert.equal(snapshot.activeElement,'growth-drag-fixture');assert.equal(snapshot.columnDragOver,input.columnOver??null);assert.equal(snapshot.dragging,!input.missing&&input.dragging!==false);assert.equal('withinTarget' in snapshot,false);assert.equal('ready' in snapshot,false);
}
console.log('PASS prepared keyboard diagnostics preserve DOM state and never claim readiness from original-card geometry');
