'use strict'

const { promisify } = require('util')
const tap = require('tap')
const http = require('http')
const fetch = require('../src/fetch')()

const promisifyServerClose = server => promisify(server.close.bind(server))

tap.test('basic get request', t => {
  t.plan(2)
  const wanted = 'undici-fetch'
  const server = http.createServer((req, res) => {
    t.strictEqual(req.method, 'GET')
    res.write(wanted)
    res.end()
  })
  t.tearDown(async () => {
    await fetch.close()
    await promisifyServerClose(server)()
  })
  server.listen(0, async () => {
    const res = await fetch(`http://localhost:${server.address().port}`)
    const found = await res.text()

    t.strictEquals(found, wanted)
  })
})

tap.test('basic post request', t => {
  t.plan(2)
  const wanted = 'undici-fetch'

  const server = http.createServer((req, res) => {
    t.strictEqual(req.method, 'POST')
    req.setEncoding('utf8')
    let found = ''
    req.on('data', d => { found += d })
    req.on('end', () => {
      t.strictEqual(found, wanted)
      res.end()
    })
  })

  t.tearDown(async () => {
    await fetch.close()
    await promisifyServerClose(server)()
  })

  server.listen(0, () => {
    fetch(
      `http://localhost:${server.address().port}`,
      {
        method: 'POST',
        body: wanted
      }
    )
  })
})