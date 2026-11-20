from app.services.grounding import build_evidence_references, build_grounded_prompt
from app.services.retrieval import RetrievedPassage


def test_grounded_prompt_uses_actual_identifiers_and_refusal_instruction() -> None:
    passage = RetrievedPassage(
        chunk_id="chunk-7",
        document_id="doc-42",
        page_number=9,
        text="Photosynthesis converts light energy into chemical energy.",
        score=0.91,
    )

    prompt = build_grounded_prompt("How does photosynthesis work?", [passage])

    assert "doc-42" in prompt
    assert "page_number=9" in prompt
    assert "chunk-7" in prompt
    assert "Do not use outside knowledge" in prompt
    assert "refuse to answer" in prompt

    references = build_evidence_references([passage], {"doc-42": "Biology Basics"})
    assert len(references) == 1
    assert references[0].document_id == "doc-42"
    assert references[0].page_number == 9
    assert references[0].chunk_id == "chunk-7"
    assert references[0].document_title == "Biology Basics"
