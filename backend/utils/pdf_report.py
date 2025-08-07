from fpdf import FPDF
from pathlib import Path
import datetime
import json

def generate_pdf(data: dict) -> str:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, json.dumps(data, ensure_ascii=False, indent=2))
    path = Path("reports")
    path.mkdir(parents=True, exist_ok=True)
    name = f"report_{data.get('cnpj','')}_{datetime.datetime.utcnow().timestamp()}.pdf"
    file = path / name
    pdf.output(str(file))
    return str(file)
