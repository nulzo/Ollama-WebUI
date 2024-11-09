from openai import OpenAI
from typing import List, Dict, Any, Generator
from openai.types import Model
import os
import dotenv

dotenv.load_dotenv()


class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def chat_stream(self, model: str, messages: List[Dict[str, Any]]) -> Generator[Dict[str, Any], None, None]:
        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True
        )
        full_content = ""
        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                full_content += chunk.choices[0].delta.content
                yield {"message": {"role": "assistant", "content": full_content}, "done": False}
            if chunk.choices[0].finish_reason:
                yield {"message": {"role": "assistant", "content": full_content}, "done": True}

    def chat(self, model: str, messages: List[Dict[str, Any]], stream: bool = True) -> Any:
        if stream:
            return self.chat_stream(model, messages)
        else:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                stream=False
            )
            content = response.choices[0].message.content
            return {"message": {"role": "assistant", "content": content}, "done": True}

    def model_list(self) -> List[Model]:
        models = self.client.models.list()
        return models
