import React from 'react'
import type { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: (
    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
      Synclite
    </span>
  ),
  project: {
    link: 'https://github.com/M-IYAAADH/Synclite',
  },
  docsRepositoryBase: 'https://github.com/M-IYAAADH/Synclite/tree/main/apps/docs',
  footer: {
    text: 'MIT License © Synclite',
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Synclite',
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Synclite — offline-first sync for any app" />
    </>
  ),
  sidebar: {
    titleComponent({ title }) {
      return <>{title}</>
    },
  },
  primaryHue: 210,
}

export default config
