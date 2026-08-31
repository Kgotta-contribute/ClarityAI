FROM quay-nonprod.EH.com/multiarchitecture-golden-base-images/rhel-python-image-with-certs:python-3.12

 

# Cloud Native Application Security Labels

LABEL maintainer="daksh24kumar@gmail.com"

LABEL applicationname="CLARITY-AI-LISTENER"

 

USER root

 

WORKDIR /app

 

# Install ffmpeg and file-libs (RHEL-based image uses yum/dnf)

RUN curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o /tmp/ffmpeg.tar.xz && \

    tar -xf /tmp/ffmpeg.tar.xz -C /tmp && \

    mv /tmp/ffmpeg-*-amd64-static/ffmpeg /usr/local/bin/ && \

    mv /tmp/ffmpeg-*-amd64-static/ffprobe /usr/local/bin/ && \

    chmod +x /usr/local/bin/ffmpeg /usr/local/bin/ffprobe && \

    rm -rf /tmp/ffmpeg*

 

# Install file-libs for python-magic

RUN yum install -y file-libs && yum clean all

 

# Install dependencies first (better layer caching)

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

 

# Copy the application code

COPY . .

 

# Expose the port

EXPOSE 8080

 

# Run the app test

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]