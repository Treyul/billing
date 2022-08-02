import re

def paymentsummation(array):
    sum = 0
    for element in array:

        #get description of payment 
        for description in element.values():
            if description != None:

                # get number of payments made in description
                data = re.split("{|}|;",description)
                for el in data:

                    # get amount from every payment
                    if len(el)> 1:
                        sum = sum + int(el.split(",")[0])


    return sum

def amount(string):
    sum = 0
    if string != None:

    # get number of payments made in description
        data = re.split("{|}|;",string)
        for el in data:
            
           # get amount from every payment
            if len(el)> 1:
                sum = sum + int(el.split(",")[0])
    return sum
