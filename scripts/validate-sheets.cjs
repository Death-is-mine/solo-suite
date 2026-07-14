const fs = require('fs')
const path = require('path')

// Parse .env.local manually (supports multi-line double-quoted values)
const envRaw = fs.readFileSync(path.resolve(__dirname, '..', '.env.local'), 'utf8')
const env = {}
let currentKey = ''
let currentVal = ''
let inQuoted = false

for (const line of envRaw.split('\n')) {
  if (inQuoted) {
    currentVal += '\n' + line
    if (line.includes('"')) {
      currentVal = currentVal.replace(/\n$/, '').replace(/^"|"$/g, '')
      env[currentKey] = currentVal
      inQuoted = false
    }
    continue
  }
  if (line.startsWith('#') || line.trim() === '') continue
  const eqIdx = line.indexOf('=')
  if (eqIdx < 0) continue
  const k = line.substring(0, eqIdx).trim()
  let v = line.substring(eqIdx + 1).trim()
  if (v.startsWith('"')) {
    if (v.endsWith('"') && v.length > 1) {
      v = v.slice(1, -1)
      env[k] = v
    } else {
      currentKey = k
      currentVal = v
      inQuoted = true
    }
  } else {
    env[k] = v
  }
}

const { google } = require('googleapis')

async function main() {
  console.log('=== Google Sheets Validation ===\n')

  const email = env.GOOGLE_SERVICE_EMAIL
  const key = env.GOOGLE_PRIVATE_KEY
  const sheetId = env.SHEET_ID

  console.log(`Service email: ${email}`)
  console.log(`Sheet ID: ${sheetId}`)
  console.log(`Private key length: ${key?.length} chars`)
  console.log(`Has actual newlines: ${key?.includes('\n')}\n`)

  const auth = new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
  const sheets = google.sheets({ version: 'v4', auth }).spreadsheets

  // Test 1: Read sheet metadata
  console.log('Test 1: Read sheet metadata...')
  try {
    const res = await sheets.get({ spreadsheetId: sheetId, includeGridData: false })
    console.log(`  PASS: Sheet found "${res.data.properties?.title}"`)
    console.log(`  Tabs: ${res.data.sheets?.map(s => s.properties?.title).join(', ')}`)
  } catch (e) {
    console.log(`  FAIL: ${e.message}`)
    if (e.message.includes('403')) {
      console.log('  \u2192 Share the sheet with the service account email')
    }
    process.exit(1)
  }

  // Test 2: Read data from first sheet
  console.log('\nTest 2: Read sheet data...')
  try {
    const res = await sheets.values.get({ spreadsheetId: sheetId, range: 'A1:Z10' })
    console.log(`  PASS: Read ${res.data.values?.length ?? 0} rows`)
    if (res.data.values?.length) {
      console.log(`  Headers: ${res.data.values[0]?.join(', ')}`)
    }
  } catch (e) {
    console.log(`  FAIL: ${e.message}`)
  }

  // Test 3: Write a test row
  console.log('\nTest 3: Write test data...')
  try {
    const ts = new Date().toISOString()
    await sheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:A',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [['Validation', ts, 'write-ok']] },
    })
    console.log('  PASS: Wrote test row at', ts)
  } catch (e) {
    console.log(`  FAIL: ${e.message}`)
    if (e.message.includes('403')) {
      console.log('  \u2192 The service account needs Editor access to this sheet')
    }
  }

  // Test 4: Create a new sheet tab for validation
  console.log('\nTest 4: Create new sheet tab...')
  try {
    await sheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: 'SSECValidation' } } }] },
    })
    console.log('  PASS: Created "SSECValidation" tab')
  } catch (e) {
    console.log(`  FAIL: ${e.message}`)
  }

  // Test 5: Write headers + data to new tab
  console.log('\nTest 5: Write structured data to new tab...')
  try {
    const headers = ['id', 'name', 'email', 'stage', 'createdAt']
    const rows = [
      headers,
      ['LD-2026-0001', 'Alice', 'alice@test.com', 'New', new Date().toISOString()],
      ['LD-2026-0002', 'Bob', 'bob@test.com', 'Qualified', new Date().toISOString()],
    ]
    await sheets.values.update({
      spreadsheetId: sheetId,
      range: 'SSECValidation!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    })
    console.log('  PASS: Wrote 2 rows with headers')
  } catch (e) {
    console.log(`  FAIL: ${e.message}`)
  }

  console.log('\n=== Sheets validation complete ===')
}

main().catch(console.error)
