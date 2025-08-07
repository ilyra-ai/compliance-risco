import re

def is_valid_cnpj(value: str) -> bool:
    return bool(re.fullmatch(r"\d{14}", value))
