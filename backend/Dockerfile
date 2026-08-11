ARG PYTHON_BUILDER=cgr.dev/chainguard/python@sha256:4c58eb78b47d5a7cee9ffe0d1df16c56778ee40b067d983fb48d677a035abf8c
ARG PYTHON_RUNTIME=cgr.dev/chainguard/python@sha256:69437de912cc3b5d36a2480b8fb0c3f658f151d8bc1978d19a6412be3a4983d5

FROM ${PYTHON_BUILDER} AS builder
USER 0
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /build
COPY requirements.txt requirements.lock ./
RUN python -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir --upgrade pip setuptools wheel \
    && /opt/venv/bin/pip install --no-cache-dir --require-hashes --requirement requirements.lock \
    && /opt/venv/bin/pip uninstall --yes pip setuptools wheel \
    && /opt/venv/bin/python -c "import pathlib, shutil; [shutil.rmtree(path) for path in pathlib.Path('/opt/venv').rglob('__pycache__')]"

FROM ${PYTHON_RUNTIME} AS runtime
ENV PATH=/opt/venv/bin:/usr/bin \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app
USER 0
RUN ["python", "-c", "import os; [os.makedirs(path, exist_ok=True) for path in ('/app/static', '/app/media')]; [os.chown(path, 65532, 65532) for path in ('/app', '/app/static', '/app/media')]"]
COPY --from=builder /opt/venv /opt/venv
COPY --chown=65532:65532 . .
USER 65532:65532
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["python", "container_healthcheck.py"]

ENTRYPOINT ["python", "container_entrypoint.py"]
CMD ["gunicorn", "CORE.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--threads", "2", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-"]
