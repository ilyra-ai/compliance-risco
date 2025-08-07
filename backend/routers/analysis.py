from fastapi import APIRouter, HTTPException
from backend.services import cadastro
from backend.utils import pdf_report, validate

router = APIRouter()

@router.get("/analysis/{cnpj}")
async def analyze(cnpj: str):
    if not validate.is_valid_cnpj(cnpj):
        raise HTTPException(status_code=400, detail="invalid cnpj")
    data = await cadastro.fetch_cnpj(cnpj)
    path = pdf_report.generate_pdf(data)
    return {"data": data, "pdf": path}
