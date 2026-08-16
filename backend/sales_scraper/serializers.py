from rest_framework import serializers


class CrawlJobRequestSerializer(serializers.Serializer):
    schema_version = serializers.ChoiceField(
        choices=["lead-candidate.v1"], default="lead-candidate.v1"
    )
    campaign_id = serializers.UUIDField()
    start_urls = serializers.ListField(
        child=serializers.URLField(max_length=2048), min_length=1, max_length=10
    )
    extraction_profile = serializers.ChoiceField(
        choices=["public-company-contact-v1"], default="public-company-contact-v1"
    )
    policy = serializers.DictField(required=False, default=dict)

    def validate_policy(self, value):
        limits = {
            "max_depth": (0, 3),
            "max_pages": (1, 100),
            "max_bytes": (1024, 5_000_000),
            "timeout_seconds": (1, 30),
            "max_redirects": (0, 8),
            "max_retries": (0, 5),
            "max_total_duration_seconds": (1, 900),
            "per_domain_delay_seconds": (0.1, 60),
        }
        unknown = set(value) - set(limits)
        if unknown:
            raise serializers.ValidationError(
                f"unsupported policy fields: {sorted(unknown)}"
            )
        for key, raw in value.items():
            low, high = limits[key]
            if not isinstance(raw, (int, float)) or not low <= raw <= high:
                raise serializers.ValidationError(
                    f"{key} must be between {low} and {high}"
                )
        return value

    def validate(self, attrs):
        if "tenant_id" in self.initial_data:
            raise serializers.ValidationError(
                {"tenant_id": "tenant is derived from the authenticated principal"}
            )
        if "idempotency_key" in self.initial_data:
            raise serializers.ValidationError(
                {"idempotency_key": "use the Idempotency-Key header"}
            )
        return attrs
