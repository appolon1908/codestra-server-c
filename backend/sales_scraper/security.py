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
    try:
        address = ipaddress.ip_address(value)
    except ValueError:
        return False
    if isinstance(address, ipaddress.IPv6Address):
        # Disallow scoped and transition mechanisms whose effective IPv4 target
        # can differ from the apparent globally routed IPv6 destination.
        if address.scope_id or address.ipv4_mapped or address.sixtofour or address.teredo:
            return False
        if any(address in network for network in (
            ipaddress.ip_network("64:ff9b::/96"),
            ipaddress.ip_network("64:ff9b:1::/48"),
        )):
            return False
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
    if any(ord(char) <= 32 or ord(char) == 127 for char in url):
        raise UnsafeURL("invalid_url")
    try:
        parsed = urlsplit(url)
        explicit_port = parsed.port
    except ValueError as exc:
        raise UnsafeURL("invalid_url") from exc
    if parsed.scheme not in {"http", "https"}:
        raise UnsafeURL("unsupported_scheme")
    if parsed.username is not None or parsed.password is not None:
        raise UnsafeURL("url_credentials_forbidden")
    if not parsed.hostname or parsed.fragment:
        raise UnsafeURL("invalid_url")
    port = explicit_port if explicit_port is not None else (443 if parsed.scheme == "https" else 80)
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
