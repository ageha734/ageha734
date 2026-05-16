FROM node@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY config.json ./

ENV PATH="/app/node_modules/.bin:$PATH"

WORKDIR /work

ENTRYPOINT ["textlint", "--config", "/app/config.json"]
