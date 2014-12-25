
def calculate_actual_quantity(item, quantity, quantity_unit):
    if type(quantity_unit) == dict:
        quantity_unit = quantity_unit['uom']
    quantity = float(quantity)
    if quantity_unit=='box':
        if item.packets_per_box:
            quantity = quantity * float(item.packets_per_box) 
            quantity_unit = 'packet' 
        if item.pieces_per_box :
            quantity = quantity * float(item.pieces_per_box)  
            quantity_unit = 'piece' 
        if item.unit_per_box:
            quantity = quantity * float(item.unit_per_box)  
            quantity_unit = item.smallest_unit
    if quantity_unit=='packet':    
        if item.pieces_per_packet:
            quantity = quantity * float(item.pieces_per_packet)
            quantity_unit = 'piece'
        if item.unit_per_packet:
            quantity = quantity * float(item.unit_per_packet)  
            quantity_unit = item.smallest_unit
    if quantity_unit=='piece':
        if item.unit_per_piece:
            quantity = quantity * float(item.unit_per_piece)
            quantity_unit = item.smallest_unit       
    actual_quantity = quantity
    print item.smallest_unit,quantity_unit,quantity
    if item.smallest_unit == 'Kg':
        if quantity_unit == 'Kg':
            actual_quantity = quantity*1000*1000
        elif quantity_unit == 'gm':
            actual_quantity = quantity*1000
            print actual_quantity
    if item.smallest_unit == 'gm':
        if quantity_unit == 'gm':
            actual_quantity = quantity*1000
       
    if item.smallest_unit == 'Metre':
        if quantity_unit == 'Metre':
            actual_quantity = quantity*100*100
        elif quantity_unit == 'cm':
            actual_quantity = quantity*100
    if item.smallest_unit == 'cm':
        if quantity_unit == 'cm':
            actual_quantity = quantity*1000
    if item.smallest_unit == 'litre':
        if quantity_unit == 'litre':
            actual_quantity = quantity*1000
    if item.smallest_unit == 'ml':
        if quantity_unit == 'ml':
            actual_quantity = quantity*1000
    if item.smallest_unit == 'sqrmetre':
        if quantity_unit == 'sqrmetre':
            actual_quantity = quantity*10.7639
    
    return actual_quantity