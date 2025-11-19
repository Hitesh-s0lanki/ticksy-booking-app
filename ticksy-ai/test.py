from src.agents.prompt_suggestion_agent import PromptSuggestionAgent

if __name__ == "__main__":
        
    prompt_suggestion_agent = PromptSuggestionAgent()
    result = prompt_suggestion_agent.invoke(
        """
           <<<CONTEXT>>
           Here's what's playing at **INOX — R City Mall** on **November 19, 2025**:

            • **Demon Slayer: Kimetsu no Yaiba - Swordsmith Village Arc**  
            Join Tanjiro and the Hashira as they battle terrifying Upper Rank demons in the Infinity Castle, leading to a climactic showdown against Muzan Kibutsuji.  
            📅 November 19, 2025  
            ⏰ 12:00 PM - 2:50 PM  
            ⏰ 4:45 PM - 7:35 PM  
            ⏰ 8:15 PM - 11:05 PM  
            📍 INOX — R City Mall, R City Mall, Ghatkopar West, Mumbai, Maharashtra, India  

            Enjoy the show!
           <<<CONTEXT>>
        """
        )
    print(result)