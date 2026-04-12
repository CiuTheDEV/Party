const fs = require('node:fs')
const path = require('node:path')

const routeCssPath = path.resolve(__dirname, '../../../../../../apps/hub/src/app/games/charades/present/page.module.css')
const presenterCssPath = path.join(__dirname, 'PresenterScreen.module.css')

const routeCss = fs.readFileSync(routeCssPath, 'utf8')
const presenterCss = fs.readFileSync(presenterCssPath, 'utf8')

const routeShellMatch = routeCss.match(/\.routeShell\s*\{([\s\S]*?)\}/)

if (!routeShellMatch) {
  throw new Error('Missing .routeShell rule in present/page.module.css')
}

if (!/height:\s*var\(--presenter-viewport-height,\s*100dvh\)/.test(routeShellMatch[1])) {
  throw new Error('Presenter route shell must use the presenter viewport height CSS variable fallback')
}

if (!/position:\s*fixed/.test(routeShellMatch[1])) {
  throw new Error('Presenter route shell must be fixed to the viewport')
}

if (!/overflow:\s*hidden/.test(routeShellMatch[1])) {
  throw new Error('Presenter route shell must hide overflow')
}

if (!/overscroll-behavior:\s*none/.test(routeShellMatch[1])) {
  throw new Error('Presenter route shell must disable overscroll chaining')
}

const screenMatch = presenterCss.match(/\.screen\s*\{([\s\S]*?)\}/)

if (!screenMatch) {
  throw new Error('Missing .screen rule in PresenterScreen.module.css')
}

if (!/height:\s*100%/.test(screenMatch[1])) {
  throw new Error('Presenter screen must fill the route shell height')
}

if (!/overflow:\s*hidden/.test(screenMatch[1])) {
  throw new Error('Presenter screen must hide overflow')
}

console.log('presenter route layout checks passed')
