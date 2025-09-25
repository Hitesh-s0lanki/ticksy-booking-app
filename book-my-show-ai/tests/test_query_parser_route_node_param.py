import pytest
from unittest.mock import MagicMock
import src.llms.openai_llm as openai_llm_mod  # patch the module symbol
from langchain_core.messages import HumanMessage
from src.nodes.query_parser_route_node import QueryParserRouteNode
from src.states.graph_state import QueryParserRouteState


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


# 10 sample inputs spanning sources (movie/event/sport/random) and steps (information/suggestion)
CASES = [
    # movie
    ("Suggest a good Hindi action movie in Delhi this weekend", "movie", "suggestion"),
    ("Showtimes for 'Jawan' in Andheri tonight", "movie", "information"),
    ("3D or IMAX options for 'Inception' in Hyderabad?", "movie", "information"),
    # event
    ("Any standup comedy shows near Koramangala on Saturday?", "event", "suggestion"),
    ("Timings and prices for Zakir Khan's show on 2025-10-12 in Pune", "event", "information"),
    ("Popular concerts in Bengaluru this month", "event", "suggestion"),
    # sport
    ("Recommend IPL matches to watch in Mumbai next week", "sport", "suggestion"),
    ("Ticket prices for FC Goa vs Bengaluru FC this Sunday", "sport", "information"),
    # random / ambiguous
    ("What’s on tonight near me?", "random", "suggestion"),
    ("Suggest something fun this weekend", "random", "suggestion"),
]


@pytest.mark.parametrize("user_input, expected_source, expected_step", CASES)
def test_query_parser_routing(patched_openai_llm, user_input, expected_source, expected_step):
    fake_llm, fake_router = patched_openai_llm

    # Deterministic stub based on the test table
    table = {(text): (src, step) for text, src, step in CASES}

    def fake_invoke(messages):
        # The node should send [SystemMessage(...), HumanMessage(...)]
        human = next((m for m in messages if isinstance(m, HumanMessage)), None)
        content = human.content if human else ""
        source, step = table.get(content, ("random", "suggestion"))
        return QueryParserRouteState(source=source, step=step)

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

    # Sanity: ensure structured router was used correctly
    fake_llm.with_structured_output.assert_called_once_with(QueryParserRouteState)
    assert fake_router.invoke.called


def test_query_parser_uses_latest_message(patched_openai_llm):
    fake_llm, fake_router = patched_openai_llm

    def fake_invoke(messages):
        human = next((m for m in messages if isinstance(m, HumanMessage)), None)
        # We expect the node to use the latest user message ("latest ask")
        assert human.content == "Popular concerts in Bengaluru this month"
        return QueryParserRouteState(source="event", step="suggestion")

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
