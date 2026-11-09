from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    google_api_key: str
    llm_model: str = "gemma-4-26b-a4b-it"
    llm_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai"
    llm_temperature: float = 0.4
    llm_max_output_tokens: int = 8192

    class Config:
        env_file = ".env"


settings = Settings()
