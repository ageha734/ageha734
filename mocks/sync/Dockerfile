FROM debian@sha256:67b30a61dc87758f0caf819646104f29ecbda97d920aaf5edc834128ac8493d3

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates=20230311+deb12u1 \
        curl=7.88.1-10+deb12u14 \
        vsftpd=3.0.3-13+b2 \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y --no-install-recommends nodejs=22.* && \
    npm install -g tsx@4.19.4 && \
    mkdir -p /var/run/vsftpd/empty && \
    useradd -m -d /workspace -s /bin/bash syncuser && \
    echo "syncuser:syncpass" | chpasswd && \
    rm -rf /var/lib/apt/lists/*

COPY vsftpd.conf /etc/vsftpd.conf

WORKDIR /workspace
USER syncuser

COPY server.ts ./

EXPOSE 2121 40000-40010 14000

CMD ["sh", "-c", "vsftpd /etc/vsftpd.conf & tsx server.ts"]
