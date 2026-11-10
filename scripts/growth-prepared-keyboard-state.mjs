/** Read-only DOM evidence. A card collision does not set its parent column's isOver flag. */
export function keyboardTargetState({id,column,wait=false},doc=document){
 const card=doc.querySelector(`[data-card-id="${id}"]`),target=doc.querySelector(`[data-testid="growth-column-${column}"]`);
 const rect=node=>{if(!node)return null;const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
 const cardRect=rect(card),targetRect=rect(target),dragging=card?.getAttribute('data-dragging')==='true';
 const center=cardRect?cardRect.left+cardRect.width/2:null;
 const withinTarget=Boolean(dragging&&targetRect&&center!==null&&center>targetRect.left&&center<targetRect.right);
 const state={id,column,dragging,withinTarget,cardRect,targetRect,columnDragOver:target?.getAttribute('data-drag-over')??null,activeElement:doc.activeElement?.getAttribute('data-testid')??null};
 return wait?withinTarget:state;
}
