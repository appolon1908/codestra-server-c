from __future__ import annotations

import hashlib
import json
import re
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit

EMAIL = re.compile(
    r"(?<![\w.+-])([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63})(?![\w.-])", re.IGNORECASE
)
PHONE = re.compile(r"(?<!\w)(\+?[0-9][0-9 .()/-]{6,}[0-9])(?!\w)")


class BoundedHTMLParser(HTMLParser):
    def __init__(self, base_url: str, max_nodes: int = 5000, max_text: int = 200_000):
        super().__init__(convert_charrefs=True)
        self.base_url, self.max_nodes, self.max_text = base_url, max_nodes, max_text
        self.nodes = 0
        self.text_parts: list[str] = []
        self.links: list[str] = []
        self.mailto: list[str] = []
        self.tel: list[str] = []
        self.jsonld: list[str] = []
        self.title = ""
        self._in_title = False
        self._in_jsonld = False
        self._buffer: list[str] = []

    def handle_starttag(self, tag, attrs):
        self.nodes += 1
        if self.nodes > self.max_nodes:
            raise ValueError("html_node_limit")
        values = dict(attrs)
        if tag == "title":
            self._in_title = True
        if tag == "script" and values.get("type", "").lower() == "application/ld+json":
            self._in_jsonld, self._buffer = True, []
        href = values.get("href")
        if href:
            if href.lower().startswith("mailto:"):
                self.mailto.append(href[7:].split("?", 1)[0])
            elif href.lower().startswith("tel:"):
                self.tel.append(href[4:])
            elif not href.lower().startswith(("javascript:", "data:")):
                self.links.append(urljoin(self.base_url, href))

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag == "script" and self._in_jsonld:
            self.jsonld.append("".join(self._buffer)[:100_000])
            self._in_jsonld = False

    def handle_data(self, data):
        if self._in_jsonld:
            self._buffer.append(data)
            return
        cleaned = " ".join(data.split())
        if cleaned and sum(map(len, self.text_parts)) < self.max_text:
            self.text_parts.append(cleaned)
            if self._in_title:
                self.title += (" " if self.title else "") + cleaned


def _values(value):
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def extract_lead(url: str, body: bytes, retrieved_at: str) -> tuple[dict, list[str]]:
    text = body.decode("utf-8", "replace")
    parser = BoundedHTMLParser(url)
    parser.feed(text)
    visible = " ".join(parser.text_parts)
    structured = []
    for raw in parser.jsonld[:20]:
        try:
            value = json.loads(raw)
            structured.extend(value if isinstance(value, list) else [value])
        except (ValueError, TypeError):
            continue
    org = next(
        (
            x
            for x in structured
            if isinstance(x, dict)
            and str(x.get("@type", "")).lower()
            in {"organization", "localbusiness", "corporation", "professionalservice"}
        ),
        {},
    )
    company = org.get("name") or parser.title or None
    emails = list(
        dict.fromkeys(
            [
                *([org.get("email")] if isinstance(org.get("email"), str) else []),
                *parser.mailto,
                *EMAIL.findall(visible),
            ]
        )
    )[:20]
    phones = list(
        dict.fromkeys(
            [
                *(
                    [org.get("telephone")]
                    if isinstance(org.get("telephone"), str)
                    else []
                ),
                *parser.tel,
                *PHONE.findall(visible),
            ]
        )
    )[:20]
    raw_address = org.get("address")
    address = (
        {
            key: str(raw_address[key])[:300]
            for key in (
                "streetAddress",
                "addressLocality",
                "addressRegion",
                "postalCode",
                "addressCountry",
            )
            if raw_address.get(key) is not None
        }
        if isinstance(raw_address, dict)
        else str(raw_address)[:500]
        if isinstance(raw_address, str)
        else None
    )
    services = [
        str(x)
        for x in _values(org.get("knowsAbout") or org.get("makesOffer"))
        if isinstance(x, (str, int, float))
    ][:20]
    contact = next(
        (
            x
            for x in structured
            if isinstance(x, dict)
            and str(x.get("@type", "")).lower() == "person"
            and x.get("name")
        ),
        {},
    )
    evidence = []
    for label, value in (
        ("company_name", company),
        ("email", emails[0] if emails else None),
        ("telephone", phones[0] if phones else None),
    ):
        if value:
            position = visible.lower().find(str(value).lower())
            snippet = (
                visible[max(0, position - 80) : position + len(str(value)) + 80]
                if position >= 0
                else str(value)[:200]
            )
            evidence.append({"field": label, "url": url, "snippet": snippet[:300]})
    contract = {
        "schema_version": "lead-candidate.v1",
        "company": {
            "name": company,
            "domain": urlsplit(url).hostname,
            "website": f"{urlsplit(url).scheme}://{urlsplit(url).netloc}",
            "email": emails[0] if emails else None,
            "telephone": phones[0] if phones else None,
            "address": address,
            "services": services,
        },
        "contact": {
            "name": contact.get("name") or None,
            "title": contact.get("jobTitle") or None,
        },
        "source_urls": [url],
        "evidence": evidence,
        "extracted_values": {"mailto": emails, "tel": phones},
        "confidence": 0.85 if org else 0.55,
        "provenance": {
            "retrieved_at": retrieved_at,
            "parser": "bounded-html-jsonld-v1",
        },
        "validation_results": [],
        "rejection_reasons": [],
        "content_hashes": {url: hashlib.sha256(body).hexdigest()},
    }
    return contract, parser.links
