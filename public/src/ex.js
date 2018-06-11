from browser import document as doc, window
from browser import html
import myEditor
# next functions are defined in myEditor.py
doc['run'].bind('click',lambda *args: myEditor.run())