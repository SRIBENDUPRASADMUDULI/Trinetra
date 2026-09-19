import httpx
import json
import re
from settings import settings


def _strip_thinking(text: str) -> str:
    """Strip  tags that Gemma 4 models emit in content."""
    text = text.strip()
    text = re.sub(r"<thought>.*?</thought>", "", text, flags=re.DOTALL)
    return text.strip()


async def generate_response(prompt: str, system_prompt: str = "", json_mode: bool = False) -> str:
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": settings.llm_model,
        "messages": messages,
        "temperature": settings.llm_temperature,
        "max_tokens": settings.llm_max_output_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{settings.llm_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.google_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

        msg = data["choices"][0].get("message", {})
        content = msg.get("content") or ""
        if not content:
            content = msg.get("reasoning") or msg.get("reasoning_content") or ""
        if not content:
            raise ValueError(f"Empty response from LLM: {json.dumps(data)[:500]}")

        return _strip_thinking(content)
