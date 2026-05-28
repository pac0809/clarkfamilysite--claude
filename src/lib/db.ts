import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'data', 'clark-family.db')

const globalForDb = global as unknown as { _db: Database.Database | undefined }

export function getDb(): Database.Database {
  if (!globalForDb._db) {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initSchema(db)
    globalForDb._db = db
  }
  return globalForDb._db
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      icon       TEXT    NOT NULL DEFAULT '🔗',
      color      TEXT    NOT NULL DEFAULT '#3B82F6',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS links (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      url         TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  const { count } = db
    .prepare('SELECT COUNT(*) as count FROM categories')
    .get() as { count: number }

  if (count === 0) seed(db)
}

function seed(db: Database.Database): void {
  const cat = db.prepare(
    'INSERT INTO categories (name, icon, color, sort_order) VALUES (?, ?, ?, ?)'
  )
  const link = db.prepare(
    'INSERT INTO links (title, url, category_id, sort_order) VALUES (?, ?, ?, ?)'
  )

  const banking  = cat.run('Banking & Finance',       '🏦', '#10B981', 1).lastInsertRowid
  const utils    = cat.run('Utilities & Services',    '⚡', '#F59E0B', 2).lastInsertRowid
  const edu      = cat.run('Education',               '📚', '#8B5CF6', 3).lastInsertRowid
  const social   = cat.run('Social & Entertainment',  '🎬', '#EF4444', 4).lastInsertRowid
  const tools    = cat.run('Search & News',           '🔍', '#3B82F6', 5).lastInsertRowid
  const property = cat.run('Property',                '🏠', '#06B6D4', 6).lastInsertRowid

  link.run('Bank Australia',           'https://www.bankaust.com.au',           banking,  1)
  link.run('Bendigo Bank',             'https://www.bendigobank.com.au',         banking,  2)
  link.run('Commonwealth Bank',        'https://www.commbank.com.au',            banking,  3)
  link.run('National Bank (NAB)',      'https://www.nab.com.au',                 banking,  4)
  link.run('Australian Super',         'https://www.australiansuper.com',        banking,  5)
  link.run('MyLoan',                   'https://www.myloan.com.au',              banking,  6)
  link.run('ResiMac',                  'https://www.resimac.com.au',             banking,  7)
  link.run('Protect – Income Protect', 'https://www.insuranceline.com.au',       banking,  8)

  link.run('Powercor myEnergy',        'https://myenergy.powercor.com.au',       utils,    1)
  link.run('Aussie Broadband',         'https://www.aussiebroadband.com.au',     utils,    2)
  link.run('VentraIP',                 'https://ventraip.com.au',                utils,    3)
  link.run('Home Lab Dashboard',       'http://homelab.local',                   utils,    4)
  link.run('MYOB Essentials',          'https://www.myob.com',                   utils,    5)

  link.run('Bacchus Marsh Grammar',    'https://www.bmg.vic.edu.au',             edu,      1)
  link.run('BMG Roll Call',            'https://rollcall.bmg.vic.edu.au',        edu,      2)

  link.run('Facebook',                 'https://www.facebook.com',               social,   1)
  link.run('YouTube',                  'https://www.youtube.com',                social,   2)
  link.run('eBay',                     'https://www.ebay.com.au',                social,   3)
  link.run('Honeymoon Diary',          '#',                                      social,   4)

  link.run('Google Search',            'https://www.google.com',                 tools,    1)
  link.run('Google Maps',              'https://maps.google.com',                tools,    2)
  link.run('Gmail',                    'https://mail.google.com',                tools,    3)
  link.run('Herald Sun',               'https://www.heraldsun.com.au',           tools,    4)

  link.run('Real Estate',              'https://www.realestate.com.au',          property, 1)
}
