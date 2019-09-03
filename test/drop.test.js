'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const rmrf = require('rimraf')
const OrbitDB = require('../src/OrbitDB')

// Include test utilities
const {
  config,
  startIpfs,
  stopIpfs,
  testAPIs,
} = require('orbit-db-test-utils')

const dbPath = './orbitdb/tests/drop'
const ipfsPath = './orbitdb/tests/drop/ipfs'

Object.keys(testAPIs).forEach(API => {
  describe(`orbit-db - Drop Database (${API})`, function() {
    this.timeout(config.timeout)

    let ipfs, orbitdb, db, address
    let localDataPath

    before(async () => {
      config.daemon1.repo = ipfsPath
      rmrf.sync(config.daemon1.repo)
      rmrf.sync(dbPath)
      ipfs = await startIpfs(API, config.daemon1)
      orbitdb = await OrbitDB.createInstance(ipfs, { directory: dbPath })
    })

    after(async () => {
      if(orbitdb)
        await orbitdb.stop()

      if (ipfs)
        await stopIpfs(ipfs)

      rmrf.sync(dbPath)
    })

    describe.skip('Drop', function() {
      before(async () => {
        db = await orbitdb.create('first', 'feed')
        localDataPath = path.join(dbPath)
        assert.equal(fs.existsSync(localDataPath), true)
      })

      it('removes local database cache', async () => {
        await db.drop()
        assert.equal(await db._cache.get(db.localHeadsPath), undefined)
        assert.equal(await db._cache.get(db.remoteHeadsPath), undefined)
        assert.equal(await db._cache.get(db.snapshotPath), undefined)
        assert.equal(await db._cache.get(db.queuePath), undefined)
        assert.equal(await db._cache.get(db.manifestPath), undefined)
      })
    })
  })
})
