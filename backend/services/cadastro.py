import httpx

async def fetch_json(client, url):
    r = await client.get(url, timeout=20)
    r.raise_for_status()
    return r.json()

async def fetch_cnpj(cnpj: str) -> dict:
    urls = [
        f"https://minhareceita.org/{cnpj}",
        f"https://open.cnpja.com/office/{cnpj}",
        f"https://receitaws.com.br/v1/cnpj/{cnpj}"
    ]
    async with httpx.AsyncClient() as client:
        data = {}
        for url in urls:
            try:
                data.update(await fetch_json(client, url))
            except httpx.HTTPError:
                pass
    data["cnpj"] = cnpj
    return data
