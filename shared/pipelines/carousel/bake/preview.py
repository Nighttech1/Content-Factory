from pathlib import Path
import json, math, ctypes, hashlib, html, shutil, argparse
from contract import validate_job, choose_contrast
import cairo, gi
from PIL import Image
gi.require_version('Pango','1.0')
gi.require_version('PangoCairo','1.0')
from gi.repository import Pango

PC=ctypes.CDLL('libpangocairo-1.0.so.0');PL=ctypes.CDLL('libpango-1.0.so.0')
PC.pango_cairo_create_layout.argtypes=[ctypes.c_void_p];PC.pango_cairo_create_layout.restype=ctypes.c_void_p
PC.pango_cairo_show_layout.argtypes=[ctypes.c_void_p,ctypes.c_void_p]
class Rect(ctypes.Structure):_fields_=[('x',ctypes.c_int),('y',ctypes.c_int),('width',ctypes.c_int),('height',ctypes.c_int)]
PL.pango_layout_get_pixel_extents.argtypes=[ctypes.c_void_p,ctypes.POINTER(Rect),ctypes.POINTER(Rect)]
PL.pango_layout_get_unknown_glyphs_count.argtypes=[ctypes.c_void_p];PL.pango_layout_get_unknown_glyphs_count.restype=ctypes.c_int
PL.pango_font_description_new.restype=ctypes.c_void_p
for func,args in [('pango_font_description_set_family',[ctypes.c_void_p,ctypes.c_char_p]),('pango_font_description_set_absolute_size',[ctypes.c_void_p,ctypes.c_double]),('pango_font_description_set_weight',[ctypes.c_void_p,ctypes.c_int]),('pango_font_description_set_variations',[ctypes.c_void_p,ctypes.c_char_p]),('pango_layout_set_font_description',[ctypes.c_void_p,ctypes.c_void_p]),('pango_layout_set_text',[ctypes.c_void_p,ctypes.c_char_p,ctypes.c_int]),('pango_layout_get_pixel_size',[ctypes.c_void_p,ctypes.POINTER(ctypes.c_int),ctypes.POINTER(ctypes.c_int)])]:getattr(PL,func).argtypes=args

def context_ptr(c):return ctypes.c_void_p.from_address(id(c)+ctypes.sizeof(ctypes.c_void_p)*2).value
class Layout:
    def __init__(self,ptr):self.ptr=ptr
    def get_pixel_size(self):
        ink,logical=Rect(),Rect();PL.pango_layout_get_pixel_extents(self.ptr,ctypes.byref(ink),ctypes.byref(logical));self.ink=ink;return max(logical.width,ink.width),ink.height
def show_layout(c,l):
    l.get_pixel_size();c.rel_move_to(-l.ink.x,-l.ink.y);PC.pango_cairo_show_layout(context_ptr(c),l.ptr)

parser=argparse.ArgumentParser(description='Explicit Cairo/Pango PREVIEW replay, never production approval')
parser.add_argument('--job',type=Path,required=True)
parser.add_argument('--asset-root',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args()
CASE=json.loads(args.job.read_text())
INPUT_HASHES=validate_job(CASE,args.asset_root)
ROOT=args.output.resolve();ROOT.mkdir(parents=True,exist_ok=True)
AS=args.asset_root.resolve()
OUT=ROOT/'output';OUT.mkdir(exist_ok=True)
BG=AS
FC=ctypes.CDLL('libfontconfig.so.1')
FC.FcConfigGetCurrent.restype=ctypes.c_void_p
FC.FcConfigAppFontAddFile.argtypes=[ctypes.c_void_p,ctypes.c_char_p]
for fn in [f['path'] for f in CASE['fonts'].values()]:
    assert FC.FcConfigAppFontAddFile(FC.FcConfigGetCurrent(),str(AS/fn).encode())

backgrounds=CASE['backgrounds']
copy={int(k):v for k,v in CASE['copy'].items()}
positions={int(k):v for k,v in CASE['positions'].items()}

def rr(c,x,y,w,h,r):
    c.new_sub_path()
    for cx,cy,a,b in [(x+w-r,y+r,-math.pi/2,0),(x+w-r,y+h-r,0,math.pi/2),(x+r,y+h-r,math.pi/2,math.pi),(x+r,y+r,math.pi,3*math.pi/2)]: c.arc(cx,cy,r,a,b)
    c.close_path()

def text_layout(c,t,family,size,weight):
    lp=PC.pango_cairo_create_layout(context_ptr(c));d=PL.pango_font_description_new()
    PL.pango_font_description_set_family(d,family.encode());PL.pango_font_description_set_absolute_size(d,size*1024);PL.pango_font_description_set_weight(d,int(weight))
    if family=='Noto Serif Display':PL.pango_font_description_set_variations(d,('wght='+str(int(weight))+',wdth=100').encode())
    PL.pango_layout_set_font_description(lp,d);PL.pango_layout_set_text(lp,t.encode(),-1)
    assert PL.pango_layout_get_unknown_glyphs_count(lp)==0,('missing glyph',t)
    return Layout(lp)

def contrast_choice(path,box):
    im=Image.open(path).convert('RGB')
    x,y,w,h=box
    values=[]
    for yy in range(y,y+h,3):
        for xx in range(x,x+w,3):
            px=im.getpixel((min(im.width-1,int(xx*im.width/1080)),min(im.height-1,int(yy*im.height/1350))))
            rgb=[v/255 for v in px];lin=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb]
            values.append(.2126*lin[0]+.7152*lin[1]+.0722*lin[2])
    return choose_contrast(values)

qa=[]; manifests=[]
for n,name in enumerate(backgrounds,1):
    bg_path=BG/name if (BG/name).exists() else AS/f'background-{n:02d}.png'
    surf=cairo.ImageSurface(cairo.FORMAT_ARGB32,1080,1350);c=cairo.Context(surf)
    bg=cairo.ImageSurface.create_from_png(str(bg_path))
    c.save();c.scale(1080/bg.get_width(),1350/bg.get_height());c.set_source_surface(bg,0,0);c.paint();c.restore()
    cards=[]
    for texts,rect in zip(copy.get(n,[]),positions.get(n,[])):
        x,y,w,h=rect
        base=CASE['typography']['large' if h>=130 else 'compact']
        layouts=[]
        for j,t in enumerate(texts):
            size=base[j];family='Noto Sans Armenian' if j==0 else 'Noto Serif Display'
            weight=Pango.Weight.BOLD if j==0 or j==2 else Pango.Weight.SEMIBOLD
            l=text_layout(c,t,family,size,weight)
            while l.get_pixel_size()[0]>w-34 and size>23:
                size-=0.5;l=text_layout(c,t,family,size,weight)
            tw,th=l.get_pixel_size()
            assert tw<=w-30,(n,t,tw,w)
            layouts.append((l,size,tw,th,family,int(weight)))
        total=sum(z[3] for z in layouts)+12
        while total>h-14:
            resized=[]
            for j,(_,size,_,_,family,weight) in enumerate(layouts):
                size-=0.5;l=text_layout(c,texts[j],family,size,weight);tw,th=l.get_pixel_size()
                resized.append((l,size,tw,th,family,weight))
            layouts=resized;total=sum(z[3] for z in layouts)+12
        assert total<=h-10,(n,total,h)
        w=max(z[2] for z in layouts)+34
        rr(c,x,y,w,h,CASE['style']['card_radius']);c.set_source_rgba(*CASE['style']['card_rgba']);c.fill()
        yy=y+(h-total)/2
        lines=[]
        for j,(l,size,tw,th,family,weight) in enumerate(layouts):
            c.set_source_rgba(1,0.98,0.93,1 if j!=1 else 0.87)
            xx=x+17;c.move_to(xx,yy);show_layout(c,l)
            lines.append({'text':texts[j],'family':family,'weight':weight,'size':size,'x':xx,'y':yy,'w':tw,'h':th})
            yy+=th+6
        cards.append({'x':x,'y':y,'w':w,'h':h,'fill':CASE['style']['card_rgba'],'lines':lines})
    # Canonical transparent logo, alpha bounds cropped in the rendering transform.
    logo_choice,logo_contrast=contrast_choice(bg_path,(866,169,160,42))
    logo_name=CASE['style']['logo']['dark_asset' if logo_choice=='black' else 'light_asset']
    logo=cairo.ImageSurface.create_from_png(str(AS/logo_name))
    bounds=Image.open(AS/logo_name).getbbox()
    crop=(bounds[0],bounds[1],bounds[2]-bounds[0],bounds[3]-bounds[1])
    spec=CASE['style']['logo'];lw=spec['width'];lx=1080-spec['right']-lw;ly=spec['top'];lh=lw*crop[3]/crop[2]
    c.save();c.rectangle(lx,ly,lw,lh);c.clip();c.translate(lx,ly);c.scale(lw/crop[2],lw/crop[2]);c.set_source_surface(logo,-crop[0],-crop[1]);c.paint();c.restore()
    arrow_style=None
    if n<7:
        choice,scores=contrast_choice(bg_path,(900,1215,86,40))
        main=(0,0,0) if choice=='black' else (1,1,1)
        edge=(1,1,1) if choice=='black' else (0,0,0)
        arrow_style={'main':choice,'edge':'white' if choice=='black' else 'black','main_width':9,'edge_width':13,'sample_box':[900,1215,86,40],'contrast':scores}
        for color,width in [(edge,13),(main,9)]:
            c.set_source_rgb(*color);c.set_line_width(width);c.set_line_cap(cairo.LINE_CAP_ROUND);c.set_line_join(cairo.LINE_JOIN_ROUND)
            c.move_to(906,1233);c.curve_to(927,1250,955,1244,976,1227);c.stroke()
            c.move_to(957,1224);c.line_to(978,1225);c.line_to(975,1246);c.stroke()
    path=OUT/f'slide-{n:02d}.png';surf.write_to_png(str(path))
    manifests.append({'slide':n,'background':name,'cards':cards,'logo':{'source':logo_name,'x':lx,'y':ly,'w':lw,'h':lh,'alpha_crop':crop,'top_margin':54,'right_margin':54,'contrast':logo_contrast},'arrow':n<7,'arrow_style':arrow_style,'output':path.name})

    # Editable HTML reproducing the exact compositing geometry, with local assets.
    html_assets=ROOT/'assets';html_assets.mkdir(exist_ok=True)
    for filename in [logo_name]+[f['path'] for f in CASE['fonts'].values()]:
        dest=html_assets/Path(filename).name
        if (AS/filename).resolve()!=dest.resolve():shutil.copyfile(AS/filename,dest)
    dst=html_assets/f'background-{n:02d}.png'
    if bg_path.resolve()!=dst.resolve():shutil.copyfile(bg_path,dst)
    parts=[]
    for card in cards:
        lines=''.join(f'<div style="font-family:\'{q["family"]}\';font-size:{q["size"]}px;font-weight:{q["weight"]};height:{q["h"]}px;line-height:{q["h"]}px;white-space:nowrap;opacity:{0.87 if j==1 else 1}">{html.escape(q["text"])}</div>' for j,q in enumerate(card['lines']))
        total=sum(q['h'] for q in card['lines'])+12
        parts.append(f'<div class="card" style="left:{card["x"]}px;top:{card["y"]}px;width:{card["w"]}px;height:{card["h"]}px;padding:{(card["h"]-total)/2}px 17px">{lines}</div>')
    arrow=(f'<svg class="arrow" viewBox="0 0 100 60"><path style="stroke:{arrow_style["edge"]};stroke-width:13" d="M12 25 C35 42 62 36 82 19 M63 16 L84 17 L81 38"/><path style="stroke:{arrow_style["main"]};stroke-width:9" d="M12 25 C35 42 62 36 82 19 M63 16 L84 17 L81 38"/></svg>') if n<7 else ''
    body=''.join(parts)+f'<div class="logo"><img src="assets/{logo_name}"></div>'+arrow
    html_doc='''<!doctype html><html lang="ru"><meta charset="utf-8"><style>
@font-face{font-family:'Noto Serif Display';src:url('assets/NotoSerifDisplay.ttf');font-weight:100 900}
@font-face{font-family:'Noto Sans Armenian';src:url('assets/NotoSansArmenian.ttf');font-weight:100 900}
*{box-sizing:border-box}body{margin:0;width:1080px;height:1350px;overflow:hidden;background:#eee}main{position:relative;width:1080px;height:1350px;background-size:100% 100%}
.card{position:absolute;border-radius:20px;background:rgba(138,56,31,.91);color:#fffaf0}.card>div+div{margin-top:6px}
.logo{position:absolute;left:866px;top:54px;width:160px;height:157.52px;overflow:hidden}.logo img{position:absolute;width:278.80px;height:173.48px;left:-58.08px;top:-4.49px}
.arrow{position:absolute;left:894px;top:1208px;width:100px;height:60px;overflow:visible}.arrow path{fill:none;stroke-linecap:round;stroke-linejoin:round}
</style><main style="background-image:url('assets/background-NN.png')">BODY</main></html>'''.replace('NN',f'{n:02d}').replace('BODY',body)
    (ROOT/f'slide-{n:02d}.html').write_text(html_doc)

# Contact sheet is a rendering of the actual final composite files.
sheet=cairo.ImageSurface(cairo.FORMAT_ARGB32,1440,1000);c=cairo.Context(sheet);c.set_source_rgb(.96,.94,.90);c.paint()
for i in range(7):
    col,row=i%4,i//4;im=cairo.ImageSurface.create_from_png(str(OUT/f'slide-{i+1:02d}.png'))
    c.save();c.translate(col*360+15,row*500+12);c.scale(330/1080,412.5/1350);c.set_source_surface(im,0,0);c.paint();c.restore()
    l=text_layout(c,f'{i+1:02d}', 'Noto Serif Display',23,Pango.Weight.BOLD);c.set_source_rgb(.25,.15,.1);c.move_to(col*360+15,row*500+435);show_layout(c,l)
sheet.write_to_png(str(OUT/'contact-sheet.png'))
manifest={'stage':'4-bake','status':'PREVIEW_RENDERED_CANONICAL_RENDER_BLOCKED','renderer':'Cairo/Pango deterministic compositing; Chromium launch blocked by environment socket permissions','dimensions':[1080,1350],'font_primary':'Noto Serif Display from current repository, variable weight as specified per line','font_armenian':'Noto Sans Armenian from repository','font_contract_sha_mismatch':True,'telegram_url':'https://t.me/mosarmclub','slides':manifests,'technical_checks':['seven PNGs 1080x1350','three cards on each of five middle slides','three nonempty lines per card','all line widths measured before rendering','no text clipping in measured card bounds','canonical logo added on every slide','arrows on slides 1-6 only','no logo contrast panels'],'publication':'not authorized; not performed'}
manifest['version']=CASE['version']
manifest['cta']=CASE['cta']
manifest['font_contract_sha_mismatch']=CASE.get('font_contract_sha_mismatch',False)
manifest['case_id']=CASE['case_id']
manifest['input_hashes']=INPUT_HASHES
manifest['status']='PREVIEW_ONLY'
manifest['renderer']='Cairo/Pango preview; run canonical.py separately for Chromium'
(ROOT/'40-bake-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps({'rendered':7,'renderer':'Cairo/Pango preview','contact_sheet':str(OUT/'contact-sheet.png')}))
