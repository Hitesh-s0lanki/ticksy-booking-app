import pytest
from unittest.mock import MagicMock
import src.llms.openai_llm as openai_llm_mod  # import the module, not the class
from src.nodes.user_input_route_node import UserInputRouteNode
from src.states.graph_state import UserInputRouteState


@pytest.fixture
def patched_openai_llm(monkeypatch):
    """Patch OpenAILLM().get_llm_model() to return a fake LLM + router."""
    fake_llm = MagicMock(name="llm")
    fake_router = MagicMock(name="router")
    fake_llm.with_structured_output.return_value = fake_router

    class DummyOpenAILLM:
        def get_llm_model(self):
            return fake_llm

    # Replace the class in the module so any new OpenAILLM() uses our dummy
    monkeypatch.setattr(openai_llm_mod, "OpenAILLM", DummyOpenAILLM)
    return fake_llm, fake_router


@pytest.mark.parametrize(
    "user_input, expected_step",
    [
        ("Book 2 tickets for OG tonight in Hyderabad", "support"),
        ("Cancel my booking TKS-12345", "support"),
        ("Reschedule my tickets for tomorrow", "support"),
        ("Payment failed on my last order", "support"),
        ("Show my bookings", "support"),
        ("Apply coupon SAVE50 to my order", "support"),
        ("Showtimes for 'Jawan' in Andheri?", "query"),
        ("Suggest good Hindi comedy movies this weekend in Delhi.", "query"),
        ("What's on tonight near me?", "query"),
        ("Ticket prices for India vs Pakistan in Ahmedabad", "query"),
    ],
)
def test_main_like_flow_with_pathed_llm(patched_openai_llm, user_input, expected_step):
    fake_llm, fake_router = patched_openai_llm

    # Deterministic responses per input (mirrors simple main scenario)
    lookup = {
        "Book 2 tickets for OG tonight in Hyderabad": "support",
        "Cancel my booking TKS-12345": "support",
        "Reschedule my tickets for tomorrow": "support",
        "Payment failed on my last order": "support",
        "Show my bookings": "support",
        "Apply coupon SAVE50 to my order": "support",
        "Showtimes for 'Jawan' in Andheri?": "query",
        "Suggest good Hindi comedy movies this weekend in Delhi.": "query",
        "What's on tonight near me?": "query",
        "Ticket prices for India vs Pakistan in Ahmedabad": "query",
    }

    def fake_invoke(messages):
        # messages is [SystemMessage(...), HumanMessage(...)] per your node
        from langchain_core.messages import HumanMessage

        human = next((m for m in messages if isinstance(m, HumanMessage)), None)
        text = human.content if human else ""
        return UserInputRouteState(step=lookup.get(text, "query"))

    fake_router.invoke.side_effect = fake_invoke

    # ==== "main" flow (without actually running __main__) ====
    llm = openai_llm_mod.OpenAILLM().get_llm_model()
    node = UserInputRouteNode(llm)
    state = {
        "messages": [{"role": "user", "content": user_input}],
        "state": "initial",
    }
    new_state = node.execute(state)
    # ================================================

    # Assertions
    assert "user_input_route_state" in new_state
    assert isinstance(new_state["user_input_route_state"], UserInputRouteState)
    assert new_state["user_input_route_state"].step == expected_step

    # Sanity: ensure our fake LLM plumbing was used
    fake_llm.with_structured_output.assert_called_once_with(UserInputRouteState)
    assert fake_router.invoke.called
