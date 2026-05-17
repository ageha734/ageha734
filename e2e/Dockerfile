FROM mcr.microsoft.com/playwright@sha256:a021500a801bab0611049217ffad6b9697d827205c15babb86a53bc1a61c02d5

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY e2e/package.json e2e/pnpm-lock.yaml e2e/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

CMD ["pnpm", "exec", "playwright", "test"]
