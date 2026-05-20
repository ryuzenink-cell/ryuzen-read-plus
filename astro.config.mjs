import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://read.ryuzen.ink',
  output: 'static',
  trailingSlash: 'always',
  adapter: cloudflare()
});