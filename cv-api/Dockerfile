FROM node@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ENV HMAC_SECRET=e2e-test-secret
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "dev"]
