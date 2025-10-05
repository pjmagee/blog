Title: Reflections on AI, LLMs, and Vibe Coding
Lead: My Journey and Lessons Learned
Published: 2025- 10-05
Tags:
- AI
- Engineering
- Leadership
- Vibe Coding
- LLMs
---

This is a bit of a sporadic post, but I want to share what's been brewing in my mind over the last couple of years about vibe coding, ChatGPT, and my perceptions and experiences. As someone who's led engineering teams through multiple tech shifts, there's a journey here worth unpacking.

### The Initial Revelation

Is it conscious? Some time goes by, and more of us learn about LLMs. It’s not conscious—at least not in any scientific sense. Even intelligent people from programming backgrounds were unsure in the early days. Non-AI experts began to use them and learn. They became a tool for anyone with a browser, later even more accessible through mobile apps.

So, we have training, parameters, and inference. Most technically inclined users now grasp these basics. That’s how I’ve perceived it so far, informed by years of watching similar hype cycles in tech.

## Evolution and Iterations

Back to OpenAI: we were given these products in iterations—GPT-1, 2, 3, 4, and 5 (naming confusion included). Each version improved on safety, reasoning, and context handling, though not without missteps.

Early models were naive and easy to manipulate. People created “jailbreaks” that tricked them into generating harmful or nonsensical content, often by pretending to be role-playing scenarios. It wasn’t real sentience—it was weak guardrails and brittle alignment.

https://www.windowscentral.com/artificial-intelligence/openai-chatgpt/chatgpt-dead-grandma-scam-microsoft-windows-activation-piracy

https://arstechnica.com/ai/2025/04/when-is-4-1-greater-than-4-5-when-its-openais-newest-model/

https://www.reddit.com/r/ChatGPT/comments/12uke8z/the_grandma_jailbreak_is-absolutely-hilarious/

https://jailbreakai.substack.com/p/the-grandma-exploit-explained-prompt

Other players joined the scene—Gemini, Claude, Grok, Qwen, DeepSeek, Kimi, Perplexity, and more. Some of these models write useful code under the right conditions.

From experience leading teams, I’ve seen massive variance in output quality—underscoring the need for review processes and type-safe coding practices.

## Diverging Opinions on AI Adoption

Some call it revolutionary; others dismiss it outright. Many fear job loss or societal decline, while others over-embrace it.

In engineering teams, AI-assisted coding has normalized quickly through IDEs like Cursor and VS Code. Productivity often spikes short-term, but I’ve noticed legitimate questions about long-term skill erosion.

Many engineers remain skeptical; others over-rely and produce low-quality “AI slop.” Overuse can dull problem-solving ability, though evidence so far points to potential cognitive offloading—not brain damage.

https://www.media.mit.edu/articles/a-i-s-effects-on-the-brain/

https://nypost.com/2025/06/19/tech/chatgpt-is-getting-smarter-but-excessive-use-could-destroy-our-brains-study-warns/

Note: Studies cited in popular media (including MIT’s experiment) only show short-term brain-activity changes during AI-assisted writing, not permanent impairment. They shouldn’t be overstated as proof of “brain rot.”

Using AI productively still depends entirely on intent:

Do you use it critically, learning from its output?

Or do you let it replace thought entirely?

AI is a tool, not growth in itself. Delivering faster isn’t becoming better. But when used to explain, research, critique, or analyze code, it amplifies learning.

From experience, some tasks genuinely take longer with agents—when prompts drift or frameworks mismatch—but that’s situational, not universal. Other engineers report the opposite.

## AI Grifters and False Promises

The rise of “AI influencers” has produced a wave of questionable claims..

> I built 10 SaaS products with no code in 10 days!

— zero proof social media user

https://www.reddit.com/r/SaaS/comments/1l5ie6w/when_did_tech_turned_into_a_low_effort_money/

https://artificialintelligencemadesimple.substack.com/p/ai-scams-and-influencers

It’s healthy skepticism. Today, LLMs can scaffold apps, but no model can autonomously deliver fully production-ready, secure, maintainable systems with integrated payments, auth, and infra. They assist developers; they don’t replace them.

Commercial frameworks like LangChain, Semantic Kernel, and tool-calling systems automate parts of this pipeline, but full “0 → deployment without human oversight” remains unreliable.

## Practical Experiences with Vibe Coding and Agents

That brings me to "vibe coding"

When Agent modes emerged (Cursor, Copilot, Replit, etc.), they felt magical and chaotic. The next evolution after chat was essentially structured prompting inside a loop.

I built a small desktop app, Streamer Alerts XPlat, using this approach. It notifies me when channels go live on YouTube, Kick, and Twitch. It's simple, but it works.

My experience: going into Agent mode without a plan produces poor results. Models often write for outdated frameworks or misuse APIs. Prompts sometimes drift; context loss and hallucinated file paths occur.

Yes, prompt engineering helps, but even with clear instructions, the determinism varies. Context window limits and summarization make long sessions flaky.

Modern IDEs improve context handling by filtering prompts per file type, but consistency still fluctuates. The summarization issue is real, too. I’ve seen it cut off critical details, leading to the LLMs then going down a rabbit hole of incorrect assumptions.

## Navigating Models and Their Limitations

I’ve also experimented with "abliterated" uncensored models on Hugging Face. These remove safety layers, producing unrestricted but often lower-quality text.

https://huggingface.co/blog/mlabonne/abliteration

https://www.reddit.com/r/LocalLLaMA/comments/1nq0cp9/important_why_abliterated_models_suck_here_is_a/

They can be interesting for research or exploring restricted topics (e.g., adult related content, horror, creative writing), but they’re rarely suitable for production or enterprise work due to bias, instability, and poor factual accuracy.

My take: they feel like half-lobotomized models... freer but cognitively inconsistent.

As for my SAX (Streamer Alerts XPlat) project, I’d say it was 70 % vibe-coded, 30 % manual. Directing the LLM took longer than writing the code myself, but the iterative brainstorming was valuable. That’s my anecdotal experience, others online seem to have the opposite experience. Maybe it’s a mix of luck, prompt quality, and model stability...

Without AI, I’d have absorbed more framework knowledge by hand, which builds real memory. That’s personal observation, not universal truth—but it matches what I see in lesser experienced engineers who over-rely on LLMs and struggle with basic debugging or problem-solving.

Balancing AI speed with cognitive retention remains the leadership challenge.

## Guidance for Effective Agent Mode and Vibe Coding

The reason for this post is to distill lessons from practice and leadership into tangible advice.

1. Don’t start by coding

Refrain from prompting “make a page” or “hello world React app.” Start with problem definition and design. In sprints, this approach saves later rework.

2. Write clear notes on what problem you’re solving

Define users, platforms, features, feasibility, and desired impact. Consider scalability, maintainability, and platform fit early.

3. Research frameworks and ecosystems

Explore GitHub projects, YouTube walkthroughs, and community discussions. Evaluate security, licensing, and support—enterprise readiness matters.

4. Trim the fat

Narrow down frameworks by popularity, long-term support, and active maintenance. Compare pros and cons (React vs Svelte vs Electron for cross-platform cases).

5. Exercise your brain before Agent mode

Read docs deeply. Understand compatibility and current best practices. Know which tools are current, which are deprecated, and how their CLIs work. This builds institutional knowledge and makes AI output verification easier.

Then, when you finally invoke the Agent:

Specify framework and version.

Incorporate linting, typing, and compiler checks into context.

Constrain the model to today’s patterns, not 2022’s GitHub average.

6. Use MCP and tool calling carefully

- https://modelcontextprotocol.io/
- https://www.anthropic.com/news/model-context-protocol

Model Context Protocol and tool calls improve recency and accuracy by grounding AI outputs in live data. But too many tools degrade performance. Use sparingly and log behavior to detect failures.

## In Summary

If you do this right, you get:

Solid research before vibe coding

Clear Agent instructions

Prompt discipline

IDEs that integrate feedback (lint, type errors) into the model context

My semi-vibed apps work fine, but anyone experienced with LLM-generated software can still spot it.

Common tells include repetitive phrasing, overuse of parentheses or icons, and sometimes stylistic quirks. These are tendencies, not proofs of AI authorship.

https://www.linkedin.com/posts/jessicalynnbrock_weve-discovered-that-an-unnatural-amount-activity-7349204451523534848-uUic

https://www.purplefrogsystems.com/2025/01/11-ways-to-spot-ai-generated-text/

https://www.linkedin.com/pulse/how-spot-chatgpt-generated-content-why-its-hannah-maden-adams-kquie

## Closing Thoughts

In reflecting on this journey, AI tools like LLMs are transformative—but they’re no substitute for human ingenuity and leadership.

As engineering leads, our task is to integrate them ethically, safeguard skills, and ensure people still learn the craft.

If we strike that balance, we’ll build teams that innovate faster and think deeper—a combination that no model can replicate.