import assert from 'node:assert/strict';
import {keyboardTargetState} from './growth-prepared-keyboard-state.mjs';
function fixture({left=250,dragging=true,columnOver=null,missing=false}={}){
 const target={getBoundingClientRect:()=>({left:240,right:470,top:100,bottom:720,width:230,height:620}),getAttribute:()=>columnOver};
 const card={getBoundingClientRect:()=>({left,right:left+200,top:100,bottom:500,width:200,height:400}),getAttribute:()=>dragging?'true':null};
 return {activeElement:{getAttribute:()=> 'growth-drag-fixture'},querySelector:selector=>selector.startsWith('[data-card-id=')?(missing?null:card):target};
}
const args={id:'fixture',column:'shooting'};
// Valid physical placement remains valid when the actual collision is a card, not its column.
assert.equal(keyboardTargetState({...args,wait:true},fixture()),true);
assert.equal(keyboardTargetState(args,fixture()).columnDragOver,null);
assert.equal(keyboardTargetState({...args,wait:true},fixture({columnOver:'true'})),true);
// A stale column flag must not accept a source card which has not moved or is no longer dragging.
assert.equal(keyboardTargetState({...args,wait:true},fixture({left:0,columnOver:'true'})),false);
assert.equal(keyboardTargetState({...args,wait:true},fixture({dragging:false,columnOver:'true'})),false);
assert.equal(keyboardTargetState({...args,wait:true},fixture({missing:true})),false);
assert.equal(keyboardTargetState({...args,wait:true},fixture({left:500})),false);
console.log('PASS prepared keyboard observation guard: card/column collision, wrong target, inactive and absent drag states');
