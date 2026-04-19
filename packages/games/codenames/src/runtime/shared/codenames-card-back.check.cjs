const assert = require('node:assert/strict')
const path = require('node:path')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

const compiledPath = process.argv[2]

if (!compiledPath) {
  throw new Error('Expected compiled module path as first argument.')
}

const resolvedCompiledPath = path.resolve(process.cwd(), compiledPath)

const { CodenamesCardBackMark } = require(resolvedCompiledPath)

const markup = renderToStaticMarkup(
  React.createElement(CodenamesCardBackMark, {
    rootClassName: 'root',
    compactClassName: 'compact',
    badgeClassName: 'badge',
    emojiClassName: 'emoji',
    labelClassName: 'label',
    density: 'compact',
  }),
)

assert.ok(markup.includes('🕵️'), 'expected the accepted spy motif in the card back')
assert.ok(markup.includes('TAJNIACY'), 'expected the accepted TAJNIACY label in the card back')
assert.ok(markup.includes('SEKTOR 05'), 'expected the top-left field-manual label')
assert.ok(markup.includes('OPERACJA TAJNIACY'), 'expected the bottom-right operation label')
assert.ok(markup.includes('compact'), 'expected compact density support for smaller board cards')
assert.ok(!markup.includes('cardBackMark'), 'expected the legacy card-back marker markup to be gone')

console.log('codenames card back check passed')
