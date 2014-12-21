from models import Ledger


def subledger(ledger_id):
    subledgers = []
    ledger = Ledger.objects.get(id=ledger_id)
    sub_ledgers = ledger.ledger_set.all()
    for sub_ledger in sub_ledgers:
        subledgers.append(sub_ledger.get_json_data())
        subledgers.append(subledger(sub_ledger.id))
    return subledgers

subledger(1)