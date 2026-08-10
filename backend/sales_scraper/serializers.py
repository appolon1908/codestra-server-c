from rest_framework import serializers


class CrawlJobRequestSerializer(serializers.Serializer):
    schema_version = serializers.ChoiceField(
        choices=["lead-candidate.v1"], default="lead-candidate.v1"
    )
    tenant_id = serializers.UUIDField()
    campaign_id = serializers.UUIDField()
    start_urls = serializers.ListField(
        child=serializers.URLField(max_length=2048), min_length=1, max_length=10
    )
    idempotency_key = serializers.CharField(
        min_length=8, max_length=200, write_only=True
    )
    policy = serializers.DictField(required=False, default=dict)

    def validate_policy(self, value):
        limits = {
            "max_depth": (0, 3),
            "max_pages": (1, 100),
            "max_bytes": (1024, 5_000_000),
            "timeout_seconds": (1, 30),
            "max_redirects": (0, 8),
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
