FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg libmagic1 bash \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY api/ ./api/
COPY main.py run_api.py wrapper_script.sh ./

RUN chmod +x wrapper_script.sh \
    && mkdir -p /logs \
    && chmod 755 /logs

EXPOSE 8080

CMD ["bash", "wrapper_script.sh"]
