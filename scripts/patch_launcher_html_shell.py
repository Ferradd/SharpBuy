from pathlib import Path

path = Path(r"c:\Users\iliyk\Desktop\SharpBuy\src\launcher\SharpBuy_Launcher\Assets\index.html")
text = path.read_text(encoding="utf-8")

# Remove leftover app-layout wrapper inside launcher-card
text = text.replace(
    "  <!-- Workspace -->\n  <div class=\"app-layout\">\n    \n    <!-- Left Main Panel -->",
    "    <!-- Left Main Panel -->",
    1,
)

path.write_text(text, encoding="utf-8", newline="\n")
print("removed app-layout")
