FROM node@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920

WORKDIR /workspace

COPY .npmrc ./
RUN npm install -g tsx@4.19.4

COPY server.ts ./

CMD ["tsx", "server.ts"]
