from ..schemas.evidence import EvidenceReference
from .retrieval import RetrievedPassage

GROUNDING_INSTRUCTIONS = (
    "Answer using only the supplied evidence passages. Do not use outside knowledge. "
    "Cite only the document_id, page_number, and chunk_id that appear in the evidence. "
    "If the evidence is missing, contradictory, or insufficient to answer, refuse to answer "
    "and state that the uploaded source does not provide enough evidence."
)


def build_grounded_prompt(question: str, passages: list[RetrievedPassage]) -> str:
    if passages:
        evidence_lines = []
        for passage in passages:
            evidence_lines.append(
                "[document_id={document_id} page_number={page_number} chunk_id={chunk_id}]\n{text}".format(
                    document_id=passage.document_id,
                    page_number=passage.page_number,
                    chunk_id=passage.chunk_id,
                    text=passage.text,
                )
            )
        evidence = "\n\n".join(evidence_lines)
    else:
        evidence = "No evidence passages were retrieved."

    return (
        f"{GROUNDING_INSTRUCTIONS}\n\n"
        f"Question:\n{question}\n\n"
        f"Evidence passages:\n{evidence}\n\n"
        "Return a structured answer with the answer text, evidence references, confidence, and refusal status."
    )


def build_evidence_references(
    passages: list[RetrievedPassage],
    document_titles: dict[str, str],
    excerpt_chars: int = 400,
) -> list[EvidenceReference]:
    references = []
    for passage in passages:
        quote = passage.text.strip()
        if len(quote) > excerpt_chars:
            quote = f"{quote[:excerpt_chars].rstrip()}..."
        references.append(
            EvidenceReference(
                document_id=passage.document_id,
                document_title=document_titles.get(passage.document_id, passage.document_id),
                page_number=passage.page_number,
                chunk_id=passage.chunk_id,
                quote=quote,
                relevance_score=passage.score,
            )
        )
    return references
