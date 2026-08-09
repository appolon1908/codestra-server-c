from __future__ import annotations

import ipaddress
import socket
from dataclasses import dataclass
from urllib.parse import urlsplit, urlunsplit


class UnsafeURL(ValueError):
    pass


@dataclass(frozen=True)
class ResolvedURL:
    url: str
    host: str
    port: int
    addresses: tuple[str, ...]


def is_public_address(value: str) -> bool:
    address = ipaddress.ip_address(value)
    return address.is_global and not any(
        (
            address.is_private,
            address.is_loopback,
            address.is_link_local,
            address.is_multicast,
            address.is_reserved,
            address.is_unspecified,
        )
    )


def validate_public_url(url: str, resolver=socket.getaddrinfo) -> ResolvedURL:
    if not isinstance(url, str) or len(url) > 2048:
        raise UnsafeURL("invalid_url")
    parsed = urlsplit(url)
    if parsed.scheme not in {"http", "https"}:
        raise UnsafeURL("unsupported_scheme")
    if parsed.username is not None or parsed.password is not None:
        raise UnsafeURL("url_credentials_forbidden")
    if not parsed.hostname or parsed.fragment:
        raise UnsafeURL("invalid_url")
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    if port not in {80, 443}:
        raise UnsafeURL("port_forbidden")
    host = parsed.hostname.rstrip(".").lower()
    try:
        literal = ipaddress.ip_address(host.strip("[]"))
        addresses = (str(literal),)
    except ValueError:
        try:
            answers = resolver(host, port, type=socket.SOCK_STREAM)
        except socket.gaierror as exc:
            raise UnsafeURL("dns_resolution_failed") from exc
        addresses = tuple(sorted({answer[4][0] for answer in answers}))
    if not addresses or any(not is_public_address(value) for value in addresses):
        raise UnsafeURL("non_public_address")
    normalized = urlunsplit(
        (parsed.scheme, parsed.netloc.lower(), parsed.path or "/", parsed.query, "")
    )
    return ResolvedURL(normalized, host, port, addresses)


def validate_dns_pin(resolved: ResolvedURL, resolver=socket.getaddrinfo) -> None:
    current = validate_public_url(resolved.url, resolver)
    if current.addresses != resolved.addresses:
        raise UnsafeURL("dns_rebinding_detected")
