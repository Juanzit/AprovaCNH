from pathlib import Path
import re
import fitz  # PyMuPDF

# Diretório temporário onde os PDFs do MBFT foram baixados
pasta_pdfs = Path("scratch")
arquivo_saida = Path("fichas_mbft_195_196_208.md")

# Busca pelos Artigos 195, 196 e 208 ou pelos códigos de enquadramento do MBFT
padrao_artigos = re.compile(
    r"(Art\.?\s*(195|196|208)\b|583-?50|584-?3[1-4]|605-?0[1-3])", re.IGNORECASE
)

blocos_extraidos = [
    "# Fichas do MBFT — Artigos 195, 196 e 208 (Resolução CONTRAN nº"
    " 985/2022)\n"
]

for pdf_path in sorted(pasta_pdfs.rglob("*.pdf")):
  with fitz.open(pdf_path) as doc:
    for num_pagina, pagina in enumerate(doc, start=1):
      texto = pagina.get_text("text")

      # Filtra páginas que mencionam os artigos e possuem campos de ficha de fiscalização
      if padrao_artigos.search(texto) and (
          "Tipificação" in texto
          or "Enquadramento" in texto
          or "Amparo Legal" in texto
      ):
        blocos_extraidos.append(
            f"## Fonte: {pdf_path.name} (Página {num_pagina})\n"
        )
        blocos_extraidos.append(texto.strip())
        blocos_extraidos.append("\n---\n")

arquivo_saida.write_text("\n".join(blocos_extraidos), encoding="utf-8")
print(
    f"Concluído! {len(blocos_extraidos) // 3} páginas extraídas em"
    f" {arquivo_saida}"
)