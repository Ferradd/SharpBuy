import re
from pathlib import Path

path = Path(r"c:\Users\iliyk\Desktop\SharpBuy\src\launcher\SharpBuy_Launcher\Assets\index.html")
text = path.read_text(encoding="utf-8")

text, n = re.subn(
    r"\n  <!-- Workspace -->\n  <div class=\"app-layout\">\n\s*\n",
    "\n",
    text,
    count=1,
)
print("removed app-layout opens:", n)
print("remaining app-layout:", text.count("app-layout"))

path.write_text(text, encoding="utf-8", newline="\n")
