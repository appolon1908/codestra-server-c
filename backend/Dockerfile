FROM python@sha256:67a1e1f215ccda113cfc024e8639049257e88f273898f595b61476d128d387e8

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir --requirement requirements.txt \
    && pip uninstall --yes pip setuptools wheel

COPY . .
RUN chmod 0755 docker-entrypoint.sh \
    && mkdir -p /app/static /app/media \
    && chown -R 10001:10001 /app/static /app/media

USER 10001:10001
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import os, urllib.request; request = urllib.request.Request('http://127.0.0.1:8000/healthz/', headers={'Host': os.getenv('HEALTHCHECK_HOST', 'localhost')}); urllib.request.urlopen(request, timeout=4).read()" || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["gunicorn", "CORE.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--threads", "2", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-"]
