/** Diagnostics only: neither original card geometry nor column isOver identifies DragOverlay destination. */
export function keyboardTargetState({id,column},doc=document){
 const card=doc.querySelector(`[data-card-id="${id}"]`),target=doc.querySelector(`[data-testid="growth-column-${column}"]`);
 const rect=node=>{if(!node)return null;const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
 const cardRect=rect(card),targetRect=rect(target),dragging=card?.getAttribute('data-dragging')==='true';
 return {id,column,dragging,originalCardRect:cardRect,columnRect:targetRect,columnDragOver:target?.getAttribute('data-drag-over')??null,activeElement:doc.activeElement?.getAttribute('data-testid')??null};
}
