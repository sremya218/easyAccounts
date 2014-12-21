
from accounts.models import Ledger, LedgerEntry, Transaction

def create_ledger_entry(ledger, date, transaction_reference_number, debit_amount=None, credit_amount=None):
    ledger_entry = LedgerEntry()
    ledger_entry.ledger = ledger
    if credit_amount:
        ledger_entry.credit_amount = credit_amount
        ledger.balance = float(ledger.balance) - float(credit_amount)
    if debit_amount:
        ledger_entry.debit_amount = debit_amount
        ledger.balance = float(ledger.balance) + float(debit_amount)
    ledger_entry.date = date
    ledger_entry.transaction_reference_number = transaction_reference_number
    ledger_entry.save()
    return ledger_entry

def create_transaction(debit_ledger_entry, credit_ledger_entry):
    transaction = Transaction()
    if debit_ledger_entry:
        transaction.debit_ledger = debit_ledger_entry
        transaction.debit_amount = debit_ledger_entry.debit_amount
        transaction.transaction_ref = debit_ledger_entry.transaction_reference_number
    if credit_ledger_entry:
        transaction.credit_ledger = credit_ledger_entry
        transaction.credit_amount = credit_ledger_entry.credit_amount
        transaction.transaction_ref = credit_ledger_entry.transaction_reference_number
    transaction.save()
    return transaction

    
