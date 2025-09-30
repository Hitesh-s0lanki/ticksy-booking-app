import pytest
from unittest.mock import MagicMock
import src.llms.openai_llm as openai_llm_mod  # patch the module symbol
from langchain_core.messages import HumanMessage
from src.nodes.query_parser_route_node import QueryParserRouteNode
from src.states.graph_state import QueryParserRouteState

from datetime import datetime
try:
    from zoneinfo import ZoneInfo  # py>=3.9
    _IST = ZoneInfo("Asia/Kolkata")
except Exception:
    _IST = None


def _today_ddmmyyyy():
    now_ist = datetime.now(_IST) if _IST else datetime.utcnow()
    return now_ist.strftime("%d-%m-%Y")


@pytest.fixture
def patched_openai_llm(monkeypatch):
    """
    Patch OpenAILLM().get_llm_model() → fake LLM with a fake router.
    This prevents any real network calls while preserving your wiring.
    """
    fake_llm = MagicMock(name="llm")
    fake_router = MagicMock(name="router")
    fake_llm.with_structured_output.return_value = fake_router

    class DummyOpenAILLM:
        def get_llm_model(self):
            return fake_llm

    monkeypatch.setattr(openai_llm_mod, "OpenAILLM", DummyOpenAILLM)
    return fake_llm, fake_router


# Build the dynamic 'today' once per module import
TODAY = _today_ddmmyyyy()

# 10 sample inputs spanning sources (movie/event/sport/random) and steps (information/suggestion)
# For simplicity:
# - If the prompt has an explicit ISO date, we map it to DD-MM-YYYY.
# - Otherwise, we default date to today's (per your instruction).
# - location is extracted when clearly present in the text; else None.
CASES = [
    # movie
    ("Suggest a good Hindi action movie in Delhi this weekend", "movie", "suggestion", TODAY, "Delhi"),
    ("Showtimes for 'Jawan' in Andheri tonight", "movie", "information", TODAY, "Andheri"),
    ("3D or IMAX options for 'Inception' in Hyderabad?", "movie", "information", TODAY, "Hyderabad"),
    # event
    ("Any standup comedy shows near Koramangala on Saturday?", "event", "suggestion", TODAY, "Koramangala"),
    ("Timings and prices for Zakir Khan's show on 2025-10-12 in Pune", "event", "information", "12-10-2025", "Pune"),
    ("Popular concerts in Bengaluru this month", "event", "suggestion", TODAY, "Bengaluru"),
    # sport
    ("Recommend IPL matches to watch in Mumbai next week", "sport", "suggestion", TODAY, "Mumbai"),
    ("Ticket prices for FC Goa vs Bengaluru FC this Sunday", "sport", "information", TODAY, None),
    # random / ambiguous
    ("What’s on tonight near me?", "random", "suggestion", TODAY, None),
    ("Suggest something fun this weekend", "random", "suggestion", TODAY, None),
]


@pytest.mark.parametrize("user_input, expected_source, expected_step, expected_date, expected_location", CASES)
def test_query_parser_routing(patched_openai_llm, user_input, expected_source, expected_step, expected_date, expected_location):
    fake_llm, fake_router = patched_openai_llm

    # Deterministic stub based on the test table (returns full schema)
    table = {text: (src, step, date, loc) for text, src, step, date, loc in CASES}

    def fake_invoke(messages):
        # The node should send [SystemMessage(...), HumanMessage(...)]
        human = next((m for m in messages if isinstance(m, HumanMessage)), None)
        content = human.content if human else ""
        source, step, date, location = table.get(content, ("random", "suggestion", TODAY, None))
        return QueryParserRouteState(source=source, step=step, date=date, location=location)

    fake_router.invoke.side_effect = fake_invoke

    # Create node with the (patched) LLM and run
    llm = openai_llm_mod.OpenAILLM().get_llm_model()
    node = QueryParserRouteNode(llm)

    state = {"messages": [{"role": "user", "content": user_input}]}
    new_state = node.execute(state)

    # Assertions
    assert "query_parser_route_state" in new_state
    qprs = new_state["query_parser_route_state"]
    assert isinstance(qprs, QueryParserRouteState)
    assert qprs.source == expected_source
    assert qprs.step == expected_step
    assert qprs.date == expected_date
    assert qprs.location == expected_location

    # Sanity: ensure structured router was used correctly with the updated schema
    fake_llm.with_structured_output.assert_called_once_with(QueryParserRouteState)
    assert fake_router.invoke.called


def test_query_parser_uses_latest_message(patched_openai_llm):
    fake_llm, fake_router = patched_openai_llm

    def fake_invoke(messages):
        human = next((m for m in messages if isinstance(m, HumanMessage)), None)
        # We expect the node to use the latest user message ("latest ask")
        assert human.content == "Popular concerts in Bengaluru this month"
        return QueryParserRouteState(
            source="event",
            step="suggestion",
            date=TODAY,             # defaulted (no explicit day resolution in this stub)
            location="Bengaluru",
        )

    fake_router.invoke.side_effect = fake_invoke

    llm = openai_llm_mod.OpenAILLM().get_llm_model()
    node = QueryParserRouteNode(llm)

    state = {
        "messages": [
            {"role": "user", "content": "Suggest something fun this weekend"},
            {"role": "assistant", "content": "Sure, any preference?"},
            {"role": "user", "content": "Popular concerts in Bengaluru this month"},
        ]
    }

    new_state = node.execute(state)
    qprs = new_state["query_parser_route_state"]
    assert qprs.source == "event"
    assert qprs.step == "suggestion"
    assert qprs.date == TODAY
    assert qprs.location == "Bengaluru"
