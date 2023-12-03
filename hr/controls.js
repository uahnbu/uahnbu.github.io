document.getElementById('count').addEventListener('click', (e) => {
  e.stopPropagation()
})
generateEmployee()

function generateEmployee() {
  const data = buildEmployee()
  const result = document.getElementById('result')
  result.innerHTML = ''
  result.appendChild(buildHtmlTable(data))
}

function copyDataframe() {
  if (
    !confirm(
      'Are you sure you want to copy the Dataframe to the Clipboard?'
    )
  )
    return

  const data = []
  const count = document.getElementById('count').valueAsNumber
  for (let i = 0; i < count; ++i) {
    data.push(...buildEmployee())
  }
  data.sort((a, b) => b.date.localeCompare(a.date))

  const table = [Object.keys(data[0])]
  data.forEach((entry) => table.push(table[0].map((key) => entry[key])))
  table[0] = table[0].map(camelToCapital)

  const text = table.map((row) => row.join('\t')).join('\n')
  const input = document.createElement('textarea')
  input.value = text
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  input.remove()
}

function buildHtmlTable(df) {
  const table = document.createElement('table')
  for (const key in df[0]) {
    const tr = document.createElement('tr')
    const th = document.createElement('th')
    th.textContent = key
    tr.appendChild(th)
    df.forEach((row) => {
      const td = document.createElement('td')
      td.textContent = row[key]
      tr.appendChild(td)
    })
    table.appendChild(tr)
  }
  return table
}

function camelToCapital(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
}
