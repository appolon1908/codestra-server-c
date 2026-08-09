from abc import ABC, abstractmethod


class EnrichmentProvider(ABC):
    @abstractmethod
    def enrich(self, candidate: dict) -> dict: ...


class DisabledProvider(EnrichmentProvider):
    def enrich(self, candidate: dict) -> dict:
        raise RuntimeError("paid provider integration is disabled")


PROVIDERS = {
    name: DisabledProvider
    for name in ("hunter", "apollo", "twilio", "opencorporates", "openai")
}
