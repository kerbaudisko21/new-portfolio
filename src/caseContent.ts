// Content for the "How I work" case study. The feature is made up and uses no real bank data.
import type { Action } from './character'

export const CASE_STEPS: { id: string; label: string; say: string; action: Action }[] = [
  { id: 'need', label: 'Business need', say: "First: what's the real problem?", action: 'think' },
  { id: 'flow', label: 'User flow', say: 'Now every path, not just the good one', action: 'clipboard' },
  { id: 'api', label: 'API spec', say: 'This is what developers build from', action: 'laptop' },
  { id: 'data', label: 'Table design', say: 'One key stops double transfers', action: 'laptop' },
  { id: 'accept', label: 'Acceptance criteria', say: 'Tick them all, I dare you', action: 'clipboard' },
]

export const NEED = {
  problem: 'Finance teams pay the same vendors on the same dates every month, and someone has to log in and send each transfer by hand.',
  goal: 'Let a finance user set a transfer once and have it run on the chosen date.',
  inScope: ['One-time transfer on a future date', 'Monthly repeat', 'Cancel before the run date'],
  outOfScope: ['Bulk upload', 'Foreign currency transfers'],
  questions: [
    { q: 'Does a schedule need a second approver?', a: 'Yes. It follows the same maker and checker rule as a normal transfer.' },
    { q: 'What if the balance is short on the run date?', a: 'Retry once at 15:00, then notify the maker.' },
  ],
}

export const FLOW_NODES: { id: string; label: string; no?: string }[] = [
  { id: 'fill', label: 'Maker fills in the schedule form' },
  { id: 'valid', label: 'Date and amount valid?', no: 'Show the error on the field' },
  { id: 'approve', label: 'Checker approves?', no: 'Back to maker with a note' },
  { id: 'scheduled', label: 'Status becomes Scheduled' },
  { id: 'balance', label: 'Balance enough on run date?', no: 'Retry at 15:00, then notify maker' },
  { id: 'sent', label: 'Transfer sent, receipt stored' },
]

export const FLOW_SCENARIOS: { label: string; reach: string; branch: boolean }[] = [
  { label: 'Everything goes right', reach: 'sent', branch: false },
  { label: 'Wrong input', reach: 'valid', branch: true },
  { label: 'Checker rejects', reach: 'approve', branch: true },
  { label: 'Short balance', reach: 'balance', branch: true },
]

export const ENDPOINTS = [
  {
    label: 'Create',
    method: 'POST',
    path: '/v1/transfer-schedules',
    purpose: 'Maker creates a schedule, which then waits for a checker.',
    request: `{
  "sourceAccount": "1234567890",
  "beneficiaryAccount": "0987654321",
  "amount": 2500000,
  "currency": "IDR",
  "runDate": "2026-12-25",
  "repeat": "MONTHLY"
}`,
    response: `201 Created
{
  "scheduleId": "SCH-1001",
  "status": "PENDING_APPROVAL",
  "nextRunDate": "2026-12-25"
}`,
    errors: [
      ['400', 'RUN_DATE_NOT_ALLOWED', 'Run date is before tomorrow'],
      ['400', 'AMOUNT_LIMIT_EXCEEDED', 'Amount is above the daily limit'],
      ['403', 'NOT_A_MAKER', 'User has no maker role'],
    ],
  },
  {
    label: 'Approve',
    method: 'POST',
    path: '/v1/transfer-schedules/{id}/approval',
    purpose: 'Checker approves or rejects a schedule made by someone else.',
    request: `{
  "decision": "APPROVE",
  "note": null
}`,
    response: `200 OK
{
  "scheduleId": "SCH-1001",
  "status": "SCHEDULED"
}`,
    errors: [
      ['403', 'SELF_APPROVAL_NOT_ALLOWED', 'Checker is also the maker'],
      ['409', 'ALREADY_DECIDED', 'Schedule was already approved or rejected'],
    ],
  },
  {
    label: 'Cancel',
    method: 'DELETE',
    path: '/v1/transfer-schedules/{id}',
    purpose: 'Maker cancels a schedule before its run date.',
    request: 'No request body',
    response: `200 OK
{
  "scheduleId": "SCH-1001",
  "status": "CANCELLED"
}`,
    errors: [['409', 'RUN_ALREADY_STARTED', 'Today\'s run has already started']],
  },
]

export const TABLES = [
  {
    name: 'transfer_schedule',
    purpose: 'One row for each schedule a maker creates.',
    columns: [
      ['id', 'BIGINT', 'Primary key'],
      ['source_account', 'VARCHAR(20)', 'Account to debit'],
      ['beneficiary_account', 'VARCHAR(20)', 'Account to credit'],
      ['amount', 'DECIMAL(18,2)', 'Must be above 0'],
      ['currency', 'CHAR(3)', 'IDR only for now'],
      ['repeat_type', 'VARCHAR(10)', 'ONCE or MONTHLY'],
      ['next_run_date', 'DATE', 'Indexed for the daily job'],
      ['status', 'VARCHAR(20)', 'PENDING_APPROVAL, SCHEDULED, CANCELLED, COMPLETED'],
      ['maker_id', 'BIGINT', 'Who created it'],
      ['checker_id', 'BIGINT', 'Who approved it, must differ from maker'],
    ],
    note: 'Searching by next_run_date keeps the daily job fast as schedules grow.',
  },
  {
    name: 'transfer_schedule_run',
    purpose: 'One row for each attempt to send the transfer.',
    columns: [
      ['id', 'BIGINT', 'Primary key'],
      ['schedule_id', 'BIGINT', 'Foreign key to transfer_schedule'],
      ['run_date', 'DATE', 'The date this run belongs to'],
      ['attempt', 'SMALLINT', '1 for first try, 2 for the 15:00 retry'],
      ['result', 'VARCHAR(20)', 'SUCCESS or FAILED_BALANCE'],
      ['reference_no', 'VARCHAR(30)', 'Filled when the transfer succeeds'],
    ],
    note: 'A unique key on schedule_id, run_date, and attempt stops the job from sending the same transfer twice.',
  },
]

export const CRITERIA = [
  { given: 'a run date before tomorrow', when: 'the maker submits the form', then: 'an error shows on the date field and nothing is saved' },
  { given: 'a user created a schedule', when: 'that same user opens its approval', then: 'approve is not available to them' },
  { given: 'a checker has approved a schedule', when: 'the run date arrives', then: 'the transfer is sent once and a receipt is stored' },
  { given: 'the balance is short on the run date', when: 'the first attempt fails', then: 'it retries at 15:00 and notifies the maker if that fails too' },
  { given: 'a schedule has status Scheduled', when: 'the maker cancels before the run date', then: 'status becomes Cancelled and no transfer is sent' },
]
