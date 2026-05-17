FROM mcr.microsoft.com/playwright@sha256:a021500a801bab0611049217ffad6b9697d827205c15babb86a53bc1a61c02d5

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

CMD ["pnpm", "exec", "playwright", "test"]
