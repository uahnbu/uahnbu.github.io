// cls & deno run jdi_data.js

// import { Chance } from 'npm:chance'

const chance = new Chance()

/**
 * @typedef {Object} JobFlowNode
 * @property {string} label
 * @property {number[]} choices
 * @property {number[]} probabilities
 * @property {string[]} [actions]
 * @property {string[]} [reasons]
 * @property {number[]} [minYears]
 * @property {number[]} [maxYears]
 */
const nodes /** @type {JobFlowNode} */ = [
  /* 0 */ {
    label: 'Start',
    choices: [1, 2, 3],
    probabilities: [0.2, 0.5, 0.3],
    actions: ['Hire', 'Hire', 'Hire'],
    reasons: ['Internship', 'Permanent', 'Contractual']
  },
  /* 1 */ {
    label: 'Internship',
    choices: [2, 9, 10],
    probabilities: [0.6, 0.3, 0.1],
    actions: ['Hire', 'Discontinuance'],
    reasons: ['Internship Conversion', 'Internship End'],
    minYears: [0.5, 0.5],
    maxYears: [0.5, 0.5, 0.5]
  },
  /* 2 */ {
    label: 'Permanent',
    choices: [4, 7, 9, 10],
    probabilities: [0.2, 0.2, 0.1, 0.6],
    minYears: [3],
    maxYears: [5, 2]
  },
  /* 3 */ {
    label: 'Contractual',
    choices: [2, 3, 9, 10],
    probabilities: [0.1, 0.4, 0.2, 0.3],
    actions: ['Hire', 'Hire', 'Discontinuance'],
    reasons: ['Transition to Permanent', 'Recontract', 'Contract End'],
    minYears: [1, 1, 1],
    maxYears: [2, 2, 2, 2]
  },
  /* 4 */ {
    label: 'Promotion',
    choices: [5, 8, 9, 10],
    probabilities: [0.2, 0.1, 0.1, 0.7],
    minYears: [5],
    maxYears: [8, 2]
  },
  /* 5 */ {
    label: 'Promotion',
    choices: [6, 9, 10],
    probabilities: [0.05, 0.05, 0.9],
    minYears: [5],
    maxYears: [8]
  },
  /* 6 */ {
    label: 'Promotion',
    choices: [9, 10],
    probabilities: [0.01, 0.99],
    minYears: [5]
  },
  /* 7 */ {
    label: 'Transfer',
    choices: [4, 8, 9, 10],
    probabilities: [0.1, 0.1, 0.1, 0.7],
    minYears: [3],
    maxYears: [5, 2]
  },
  /* 8 */ {
    label: 'Transfer',
    choices: [6, 9, 10],
    probabilities: [0.05, 0.2, 0.75],
    minYears: [5],
    maxYears: [8]
  },
  /* 9 */ {
    label: 'Discontinuance',
    choices: [10],
    probabilities: [1]
  },
  /* _ */ { label: 'Current' }
]

const PERSONNEL = 1
const employees = []

for (let i = 0; i < PERSONNEL; ++i) employees.push(...buildEmployee())

function buildEmployee() {
  const data = []

  const jobFlow = generateJobFlow()

  const isInternship = jobFlow[0].label === 'Internship'

  let { division, businessUnit, department } = generateUnit({ isInternship })
  let { country, province, city } = generateLocation()
  let salary = choose(['Bi-weekly', 'Monthly'])
  let workingTime = 'Full-time'
  let union = 'No'

  let jobLevel = choose(['Entry', 'Mid', 'Senior'])

  const gender = choose(
    ['Male', 'Female'],
    division === 'Food' ? [0.4, 0.6] : [0.6, 0.4]
  )
  const name = chance.name({
    middle: Math.random() > 0.5,
    nationality: 'en',
    gender: gender.toLowerCase()
  })

  const maxBirthYear = isInternship ? 30 : 50
  const birthDate =
    jobFlow[0].date - 31536e6 * chance.integer({ min: 21, max: maxBirthYear })
  const birthday = chance.birthday({ year: new Date(birthDate).getFullYear() })

  for (let i = 0; i < jobFlow.length; ++i) {
    const { label, date, action, reason } = jobFlow[i]
    const entry = (data[data.length] = { name, gender })

    entry.date = new Date(date).toLocaleDateString()
    entry.birthday = new Date(birthday).toLocaleDateString()
    entry.actionName = action
    entry.actionReason = reason

    if (label === 'Transfer') {
      const changes = generateTransfer({
        division,
        businessUnit,
        department,
        country,
        province,
        city
      })
      entry.actionReason = changes.actionReason
      division = changes.division
      businessUnit = changes.businessUnit
      department = changes.department
      country = changes.country
      province = changes.province
      city = changes.city
    }
    entry.division = division
    entry.businessUnit = businessUnit
    entry.department = department
    entry.country = country
    entry.province = province
    entry.city = city

    if (label === 'Contractual') {
      workingTime = choose(['Full-time', 'Part-time'])
      salary = choose(['Hourly', 'Bi-weekly', 'Monthly'])
    }
    if (label === 'Permanent') union = choose(['Yes', 'No'], [0.9, 0.1])

    if (reason === 'Internship Conversion') jobLevel = 'Entry'
    if (label === 'Internship') jobLevel = 'Internship'
    if (label === 'Promotion') {
      const levels = ['Entry', 'Mid', 'Senior', 'Manager']
      const index = levels.indexOf(jobLevel)
      // Too many promotions there is no going back
      if (index >= levels.length - 1) return buildEmployee()
      jobLevel = levels[index + 1]
    }

    entry.workingTime = workingTime
    entry.salary = salary
    entry.union = union
    entry.jobLevel = jobLevel
    entry.jobPosition = generatePosition(department, jobLevel)
  }

  return data
}

console.log(employees)

function generatePosition(department, level) {
  return switcher(level + ' ' + department, {
    'Internship Sales': ['Sales Clerk Intern', 'Sales Support Intern'],
    'Internship Marketing': ['Research Assistant Intern', 'Marketing Intern'],
    'Internship HR': ['Project Assistant'],
    'Internship IT': ['Software Developer Intern', 'Data Analyst Intern'],
    'Internship Supply Chain': [
      'Supply Chain Intern',
      'Quality Control Intern'
    ],

    'Entry Sales': [
      'Sales Clerk',
      'Sales Support',
      'Sales Analytics Assistant'
    ],
    'Entry Marketing': [
      'Research Assistant',
      'Marketing Assistant',
      'Public Relations Assistant'
    ],
    'Entry HR': ['HR Assistant', 'HR Coordinator', 'HR Analyst Assistant'],
    'Entry Health & Safety': ['Health & Safety Assistant'],
    'Entry IT': ['Software Developer', 'System Analyst', 'Data Analyst'],
    'Entry Supply Chain': ['Supply Chain Analyst', 'Quality Control'],
    'Entry Finance': ['Accounting Assistant'],
    'Entry Corporate': ['Project Assistant', 'Operations Assistant'],

    'Mid Sales': ['Sales Representative', 'Sales Analytics Specialist'],
    'Mid Marketing': ['Marketing Specialist', 'Public Relations Specialist'],
    'Mid HR': ['HR Coordinator', 'HR Analyst'],
    'Mid Health & Safety': ['Health & Safety Coordinator'],
    'Mid IT': ['Software Developer', 'System Analyst', 'Data Analyst'],
    'Mid Supply Chain': [
      'Supply Chain Specialist',
      'Quality Control Specialist',
      'Quality Assurance Specialist'
    ],
    'Mid Finance': ['Accountant', 'Financial Analyst'],
    'Mid Corporate': [
      'Project Management Specialist',
      'Operations Management Specialist',
      'Business Analytics Specialist'
    ],

    'Senior Sales': ['Sales Operations Strategist'],
    'Senior Marketing': [
      'Marketing Strategist',
      'Marketing Consultant',
      'Public Relations Strategist'
    ],
    'Senior HR': ['HR Coordinator', 'HR Analyst'],
    'Senior Health & Safety': ['Health & Safety Coordinator'],
    'Senior IT': ['System Strategist'],
    'Senior Supply Chain': [
      'Supply Chain Management Strategist',
      'Quality Control Strategist',
      'Quality Assurance Strategist'
    ],
    'Senior Finance': ['Accountant', 'Financial Strategist'],
    'Senior Corporate': [
      'Project Manager',
      'Operations Strategist',
      'Business Strategist'
    ],

    'Manager Sales': ['Sales Manager'],
    'Manager Marketing': ['Marketing Manager', 'Brand Manager'],
    'Manager HR': ['HR Manager'],
    'Manager Health & Safety': ['Health & Safety Manager'],
    'Manager IT': ['System Manager', 'IT Manager'],
    'Manager Supply Chain': ['Planning Manager', 'Quality Control Manager'],
    'Manager Finance': ['Finance Manager', 'Treasury Manager'],
    'Manager Corporate': ['Operations Manager', 'Development Manager']
  })
}

function generateTransfer({
  division,
  businessUnit,
  department,
  country,
  province,
  city
} = {}) {
  const targetChoices = [
    'business unit',
    'division',
    'department',
    'city',
    'province',
    'country'
  ]
  const targetProbabilities = [0.2, 0.2, 0.05, 0.3, 0.2, 0.05]

  if (['Food', 'Shipbuilding'].includes(division)) {
    targetChoices.shift()
    targetProbabilities.shift()
  }

  const target = choose(targetChoices, targetProbabilities)
  const actionReason = 'Change of ' + target

  const unit = generateUnit
  const loc = generateLocation
  switcher(target, {
    'division': [
      () => ({ division, businessUnit } = unit({ department }, division))
    ],
    'business unit': [
      () => ({ businessUnit } = unit({ division, department }, businessUnit))
    ],
    'department': [
      () => ({ department } = unit({ division, businessUnit }, department))
    ],
    'city': [() => ({ city } = loc({ country, province }, city))],
    'province': [() => ({ province, city } = loc({ country }, province))],
    'country': [() => ({ country, province, city } = loc({}, country))]
  })()

  return {
    actionReason,
    division,
    businessUnit,
    department,
    country,
    province,
    city
  }
}

function generateUnit(
  { division, businessUnit, department, isInternship } = {},
  original
) {
  while (!division || division === original)
    division = choose(
      [
        'Agriculture',
        'Construction',
        'Consumer Products',
        'Food',
        'Forestry',
        'Retail',
        'Shipbuilding',
        'Transportation'
      ],
      [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.3]
    )

  while (!businessUnit || businessUnit === original)
    businessUnit = switcher(division, {
      'Agriculture': ['Cavendish Agri', 'Juniper'],
      'Construction': ['Wallboard', 'CFM', 'Gulf', 'Kent Homes', 'Pumps'],
      'Consumer Products': ['Tissue', 'Personal Care'],
      'Food': ['Cavendish'],
      'Forestry': ['Woodlands', 'Pulp & Paper', 'Lake Utopia', 'Lumber'],
      'Retail': [
        ['Chandler', 'Kent', 'Truck & Trailer', 'Plasticraft', 'Atlas', 'ICS']
      ],
      'Shipbuilding': ['JDI Shipbuilding'],
      'Transportation': [
        'Midland',
        'RST',
        'Sunbury',
        'NBM',
        'Kent Line',
        'JDI Logistics',
        'Habour Development'
      ]
    })

  const departments = [
    'Sales',
    'Marketing',
    'Supply Chain',
    'IT',
    'HR',
    'Health & Safety',
    'Finance',
    'Corporate'
  ]

  if (isInternship) departments.length -= 4
  while (!department || department === original)
    department = choose(departments)

  return { division, businessUnit, department }
}

function generateLocation({ country, province, city } = {}, original) {
  while (!country || country === original) country = choose(['Canada', 'US'])

  while (!province || province === original)
    province = switcher(country, {
      'Canada': [
        'New Brunswick',
        'Nova Scotia',
        'Ontario',
        'Prince Edward Island'
      ],
      'US': ['Maine', 'New York', 'Georgia', 'California']
    })

  while (!city || city === original)
    city = switcher(province, {
      'New Brunswick': [
        ['Moncton', 'Saint John', 'Fredericton', 'Sussex', 'Utopia'],
        [0.3, 0.3, 0.2, 0.1, 0.1]
      ],
      'Nova Scotia': ['Vanghan', 'Dartmouth', 'Halifax'],
      'Ontario': ['Toronto', 'Ottawa', 'London', 'Sudbury'],
      'Prince Edward Island': ['Charlottetown', 'Summerside'],
      'Maine': ['Portland', 'Bangor'],
      'New York': ['New York City', 'Buffalo'],
      'Georgia': ['Atlanta', 'Savannah'],
      'California': ['Los Angeles', 'San Francisco']
    })

  return { country, province, city }
}

function generateJobFlow() {
  const LIMIT = 20
  const path = [{ label: 'Start', index: 0 }]
  while (path[0].label === 'Start') {
    path.length = 1
    for (let k = 0; k < LIMIT; ++k) {
      const { choices, probabilities } = nodes[path.at(-1).index]
      const index = choose(choices, probabilities)
      const label = nodes[index].label
      path.push({ label, index })
      if (label === 'Current') break
    }
    if (path.at(-1).label !== 'Current') continue
    let date = Date.now()
    for (let j = path.length - 1; j > 0; --j) {
      path[j].date = date

      const prev = nodes[path[j - 1].index]
      const index = prev.choices.indexOf(path[j].index)
      const minYears = prev.minYears?.[index] || 0
      const maxYears = prev.maxYears?.[index] || 20
      const min = 31536e6 * minYears
      const max = 31536e6 * maxYears
      date -= chance.integer({ min, max })

      path[j].action = prev.actions?.[index] || path[j].label
      path[j].reason = prev.reasons?.[index] || ''
      if (path[j].action === 'Discontinuance' && !path[j].reason) {
        path[j].reason = choose(['Termination', 'Resignation'])
      }

      delete path[j].index
    }
    path.shift(), path.pop()
    return path
  }
}

function choose(choices, probabilities) {
  probabilities ||= [...choices].fill(1 / choices.length)
  let sum = probabilities.reduce((a, b) => a + b)
  let random = Math.random() * sum
  for (let i = 0; i < choices.length; ++i) {
    if (random < probabilities[i]) return choices[i]
    random -= probabilities[i]
  }
}

function switcher(group, groups, defaultValue) {
  if (!groups.hasOwnProperty(group)) return defaultValue
  const [choices, probabilities] = Array.isArray(groups[group][0])
    ? groups[group]
    : [groups[group]]
  return choose(choices, probabilities)
}
