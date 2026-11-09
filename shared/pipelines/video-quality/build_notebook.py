"""Rebuild the standalone GPU notebook from the reviewed local source files."""
import json
from pathlib import Path

root = Path(__file__).parent
cells = []
def md(s): cells.append({'cell_type':'markdown','metadata':{},'source':s.splitlines(True)})
def code(s): cells.append({'cell_type':'code','metadata':{},'execution_count':None,'outputs':[], 'source':s.splitlines(True)})

md('''# Улучшение качества видео — бесплатный GPU

Самостоятельный notebook для Kaggle / Google Colab. Никаких API-серверов и платных
ресурсов. CUDA обязательна. Это экспериментальный framewise RealESRGAN, а не
гарантированное восстановление: проверь мерцание, лица и уже вшитые буквы.
GPU-исполнение этого пакета ещё не проверено в реальной GPU-сессии.

1. Выбери бесплатный GPU; на Kaggle включи Internet для установки библиотек/весов.
2. Выполняй ячейки по порядку, загрузи оригинал и подтверди права.
3. Сначала sample 3 секунды, затем просмотри отдельные before/after и comparison.
4. Только после принятия пробы запускай последнюю ячейку для полного видео.

Исходник не перезаписывается. На Kaggle используй **private** notebook и private
input dataset. Не публикуй notebook с личным видео. Для входа/скачивания с телефона
может понадобиться режим браузера «Версия для ПК». Бесплатный GPU не гарантирован.
''')
code('''import subprocess, sys, shutil
import torch
assert torch.cuda.is_available(), 'Бесплатный GPU не выделен. Стоп, платный billing не включать.'
print('GPU:', torch.cuda.get_device_name(0))
assert shutil.which('ffmpeg') and shutil.which('ffprobe'), 'Нужны FFmpeg и FFprobe в среде.'
subprocess.run([sys.executable,'-m','pip','install','spandrel==0.4.1','Pillow==11.3.0'],check=True)
print('torch:', torch.__version__)
''')
code('from pathlib import Path\nWORK = Path("/kaggle/working/video-quality" if Path("/kaggle/working").exists() else "/content/video-quality")\nWORK.mkdir(parents=True, exist_ok=True)\n'+
     '\n'.join(f'(WORK / {name!r}).write_text({(root/name).read_text()!r})' for name in ['run.py','gpu.py'])+'\n')
code('''# Colab: появится выбор файла. Kaggle: загрузи private input через Add Input и укажи путь.
if Path('/content').exists():
    from google.colab import files
    uploaded = files.upload()
    assert len(uploaded)==1, 'Загрузи ровно один видеофайл'
    INPUT = str(Path(next(iter(uploaded))).resolve())
else:
    INPUT = '/kaggle/input/CHANGE_ME/reel_FINAL.mp4'
print('Вход нужно проверить:', Path(INPUT).name)
''')
code('''# Поставь True только если имеешь права/согласия и разрешаешь обработку здесь.
RIGHTS_CONFIRMED = False
JOB_ID = 'VQ-202611-01'
START = 0
WIDTH = 0  # 0 сохраняет исходный размер; 2160 — только если нужен увеличенный файл
STRENGTH = 0.5  # мягкое смешивание с оригиналом
assert RIGHTS_CONFIRMED, 'Нужно подтвердить права'
assert Path(INPUT).is_file(), 'Проверь путь к файлу'
import uuid
RUN = WORK / ('run-' + uuid.uuid4().hex[:8])
COMMON = [sys.executable,str(WORK/'gpu.py'),'--input',INPUT,'--job-id',JOB_ID,
          '--width',str(WIDTH),'--strength',str(STRENGTH),'--rights-confirmed',
          '--weights',str(WORK/'RealESRGAN_x2plus.pth')]
subprocess.run(COMMON + ['--mode','sample','--output',str(RUN/'sample'),'--start',str(START)],check=True)
''')
code('''from IPython.display import display, Video
for name in ['before.mp4','after.mp4','comparison.mp4']:
    print(name, '(comparison: слева исходный baseline, справа кандидат)')
    display(Video(str(RUN/'sample'/name),embed=True,width=360))
''')
md('''## Приёмка пробы

Сравни также видео в полном размере: кожа и лица, сетка/мелкие детали, быстрые
руки, вшитый текст, ореолы и мерцание. Если улучшения нет — оставь оригинал.
Полный файл технически проверяется, но просмотр и прослушивание человеком обязательны.
''')
code('''SAMPLE_ACCEPTED = False  # True только после фактического просмотра
assert SAMPLE_ACCEPTED, 'Проба ещё не принята'
subprocess.run(COMMON + ['--mode','final','--output',str(RUN/'final'),
    '--approval',str(RUN/'sample'/'manifest.json'),'--accept-sample'],check=True)
display(Video(str(RUN/'final'/'final.mp4'),embed=True,width=360))
print('Просмотри весь файл со звуком. manifest:', RUN/'final'/'manifest.json')
if Path('/content').exists():
    from google.colab import files
    files.download(str(RUN/'final'/'final.mp4'))
else:
    print('Скачай файл из Output в Kaggle; не делай notebook публичным.')
''')
nb={'nbformat':4,'nbformat_minor':5,'metadata':{'kernelspec':{'display_name':'Python 3','language':'python','name':'python3'},'language_info':{'name':'python'}},'cells':cells}
for i,c in enumerate(cells): c['id']=f'video-quality-{i:02}'
(root/'free-gpu.ipynb').write_text(json.dumps(nb,ensure_ascii=False,indent=1)+'\n')
