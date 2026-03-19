FROM python:3.9-slim

ARG CALCULATORS_RELEASE_NAME

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    CALCULATORS_RELEASE_NAME=${CALCULATORS_RELEASE_NAME}

WORKDIR /app

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
