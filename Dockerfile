# For more information, please refer to https://aka.ms/vscode-docker-python
FROM python:3.11-slim
ARG SENTRY_RELEASE_VERSION=dev

EXPOSE 8000

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

ENV DJANGO_SENTRY_RELEASE_VERSION=${SENTRY_RELEASE_VERSION}

# Install python dependencies
WORKDIR /app
RUN pip install -U pip
RUN pip install poetry==2.1.3
COPY poetry.lock pyproject.toml ./
RUN poetry config virtualenvs.create false && poetry install --no-root

# Copy app code
COPY manage.py .flake8 ./
COPY recipes/ ./recipes/

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-python-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
RUN mkdir -p /app/mediafiles && chown -R appuser:appuser /app/mediafiles
USER appuser

# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "recipes.wsgi"]
