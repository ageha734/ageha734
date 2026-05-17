FROM node@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /workspace

RUN pnpm install -g tsx

COPY server.ts ./

CMD ["tsx", "server.ts"]
