FROM quay-nonprod.EH.com/multiarchitecture-golden-base-images/rhel-python-image-with-certs:python-3.12

 

# Cloud Native Application Security Labels

LABEL maintainer="daksh24kumar@gmail.com"

LABEL applicationname="CLARITY-AI-LISTENER"

 

USER root

 

# Set working directory

WORKDIR /app

 

# Install ffmpeg static binary for x86_64 (amd64)

RUN curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o /tmp/ffmpeg.tar.xz && \

    tar -xf /tmp/ffmpeg.tar.xz -C /tmp && \

    mv /tmp/ffmpeg-*-amd64-static/ffmpeg /usr/local/bin/ && \

    mv /tmp/ffmpeg-*-amd64-static/ffprobe /usr/local/bin/ && \

    chmod +x /usr/local/bin/ffmpeg /usr/local/bin/ffprobe && \

    rm -rf /tmp/ffmpeg*

 

# Install file-libs for python-magic

RUN yum install -y file-libs && yum clean all

 

# Copy requirements first for better caching

COPY requirements.txt .

 

# Install dependencies

RUN pip install --no-cache-dir -r requirements.txt

 

# Copy application code

COPY app/ ./app/

COPY api/ ./api/

COPY main.py run_api.py wrapper_script.sh .

 

# Create logs directory

RUN mkdir -p /logs && chmod 755 /logs

VOLUME /logs

 

# Run as non-root user for security

USER 1001

 

# Run the application

#CMD ["python", "main.py"]

CMD ["/bin/bash", "wrapper_script.sh"]

 
